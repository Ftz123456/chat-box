import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  prompt: string; // 用户输入（包含八字JSON）
  sessionId?: string; // 会话ID（多轮对话时使用）
  originalMessage?: string; // 原始用户输入（不包含JSON），用于保存
}

interface DashScopeChunk {
  output?: {
    text?: string;
    session_id?: string;
  };
  session_id?: string; // 也可能在顶层
  finish_reason?: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, sessionId, originalMessage }: ChatRequest = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // // 获取用户ID（如果已登录）
    const userId = await MessageService.getUserIdFromRequest(req);
    //    // 获取用户ID（如果已登录）
    // const userId = 2;

    const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-58c6269c6af3447b9e5b86c585ee50f8';
    const appId = process.env.DASHSCOPE_APP_ID || 'ede4f02d9fab4c73872c6d025d0ebe33';
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;
    
    // 构建请求数据（使用 prompt 和 session_id）
    const inputData: any = {
      prompt: prompt
    };
    
    // 如果有 session_id，添加到 input 中（用于多轮对话）
    if (sessionId) {
      inputData.session_id = sessionId;
    }

    const data = {
      input: inputData,
      parameters: {
        incremental_output: true // 增量输出（流式响应）
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'enable', // 启用SSE流式输出（关键头信息）
          'User-Agent': 'Next.js Server'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        const requestId = response.headers.get('x-request-id');
        
        return NextResponse.json(
          { 
            error: 'API请求失败',
            status: response.status,
            request_id: requestId,
            details: errorText 
          }, 
          { status: response.status }
        );
      }

      // 用于收集完整响应文本（后续保存用）
      let assistantText = '';
      let returnedSessionId: string | null = null; // 从响应中获取的 session_id
      // 使用原始消息（不包含JSON）用于保存
      const messageToSave = originalMessage || prompt;

      // 创建可读流处理流式响应
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            controller.error('No response body');
            return;
          }

          try {
            let buffer = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // 解码当前chunk并添加到buffer
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // 处理可能包含多个完整SSE消息的buffer
              const lines = buffer.split('\n');
              // 保留最后一个不完整的行在buffer中
              buffer = lines.pop() || '';

              // 查找并处理完整的SSE消息
              let i = 0;
              while (i < lines.length) {
                // 查找data:行
                if (lines[i].startsWith('data:')) {
                  const dataLine = lines[i].substring(5).trim();
                  if (dataLine) {
                    try {
                      const parsed: DashScopeChunk = JSON.parse(dataLine);
                      // 提取增量文本并推送给客户端
                      if (parsed.output?.text) {
                        const text = parsed.output.text;
                        assistantText += text;
                        controller.enqueue(new TextEncoder().encode(text));
                      }
                      // 提取 session_id（如果存在）
                      if (parsed.output?.session_id) {
                        returnedSessionId = parsed.output.session_id;
                      }
                      // 也可能在顶层有 session_id
                      if (!returnedSessionId && parsed.session_id) {
                        returnedSessionId = parsed.session_id;
                      }
                    } catch (e) {
                      // 解析失败，跳过这个chunk
                    }
                  }
                  break; // 处理完一个SSE消息
                }
                i++;
              }
            }

            // 流结束时发送 session_id（如果存在）
            if (returnedSessionId) {
              // 通过特殊格式发送 session_id 给客户端（使用Base64编码避免文本冲突）
              const encodedSessionId = Buffer.from(`SESSION_ID:${returnedSessionId}`).toString('base64');
              controller.enqueue(new TextEncoder().encode(`\x00SESSION_${encodedSessionId}\x00`));
            }

            // 流结束时保存消息（如果有完整内容）
            if (userId && assistantText && messageToSave) {
              try {
                // 保存用户消息（使用原始消息，不包含JSON）
                await MessageService.saveMessage({
                  userId,
                  chatType: 'bazi',
                  role: 'user',
                  content: messageToSave
                });

                // 保存助手回复
                await MessageService.saveMessage({
                  userId,
                  chatType: 'bazi',
                  role: 'assistant',
                  content: assistantText
                });
              } catch (saveErr) {
                console.error('保存消息失败:', saveErr);
              }
            }

            controller.close();
          } catch (e) {
            controller.error(e);
          }
        }
      });

      // 返回流式响应，设置SSE类型
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'API请求超时',
            message: '接口响应时间超过30秒',
            solution: '请尝试缩短输入文本或分批发送'
          }, 
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: '服务器内部错误',
          message: error instanceof Error ? error.message : '未知错误'
        }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: '请求解析失败',
        message: error instanceof Error ? error.message : '未知错误'
      }, 
      { status: 500 }
    );
  }
}