import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

interface DashScopeResponse {
  output?: {
    text?: string;
  };
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: ChatRequest = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 获取用户ID（如果已登录）
    const userId = await MessageService.getUserIdFromRequest(req);

    const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-58c6269c6af3447b9e5b86c585ee50f8';
    const appId = process.env.DASHSCOPE_APP_ID || 'ede4f02d9fab4c73872c6d025d0ebe33';
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;
    
    
    let typeSystemPrompt= ''
    // 构建请求消息数组
    const requestMessages: Message[] = [];
    
    // 添加系统提示
    if (typeSystemPrompt) {
      requestMessages.push({
        role: 'user',
        content: typeSystemPrompt
      });
    }
    
    // 添加所有用户消息
    messages.forEach(msg => {
      if (msg.role === 'user') {
        requestMessages.push(msg);
      }
    });

    const data = {
      input: {
        messages: requestMessages
      },
      parameters: {
        stream: true,
        max_tokens: 4096
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Next.js Server'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
          console.log('Calling DashScope API:', url);
    console.log('Request data:', JSON.stringify(data));
    
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        const requestId = response.headers.get('x-request-id');
        
        return NextResponse.json({ 
          error: 'API请求失败',
          status: response.status,
          request_id: requestId,
          details: errorText 
        }, { status: response.status });
      }

      // 流式处理响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
        }
      }

      const responseData: DashScopeResponse = JSON.parse(result);
      
      if (responseData.output?.text) {
        // 保存消息到数据库
        if (userId) {
          try {
            let currentSessionId: string | undefined;
            
            // 保存用户消息
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            if (lastUserMessage) {
              const userResult = await MessageService.saveMessage({
                userId,
                chatType: 'bazi',
                role: 'user',
                content: lastUserMessage.content
              });
              currentSessionId = userResult.session_id;
            }

            // 保存助手回复
            await MessageService.saveMessage({
              userId,
              chatType: 'bazi',
              role: 'assistant',
              content: responseData.output.text,
              sessionId: currentSessionId
            });
          } catch (error) {
            console.error('保存消息失败:', error);
          }
        }

        return NextResponse.json({
          content: responseData.output.text
        });
      } else {
        return NextResponse.json({
          error: 'API返回无有效内容',
          response: responseData
        }, { status: 500 });
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'API请求超时',
          message: '接口响应时间超过30秒',
          solution: '请尝试缩短输入文本或分批发送'
        }, { status: 504 });
      }
      
      return NextResponse.json({ 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      error: '请求解析失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
