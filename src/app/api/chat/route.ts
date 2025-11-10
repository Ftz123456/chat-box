import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/messageService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  type?: 'digital' | 'comprehensive' | 'marxist';
}

interface DeepSeekResponse {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

interface StreamChunk {
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, type = 'digital' }: ChatRequest = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 获取用户ID（如果已登录）
    const userId = await MessageService.getUserIdFromRequest(req);

    const apiKey = 'sk-21b564beabda4cef9eb987b0cfe81c1d';

    const requestMessages: Message[] = [];
    
    // 根据聊天类型添加不同的系统提示
    let typeSystemPrompt = '';
    if (type === 'digital') {
      typeSystemPrompt = `你是一位精通梅花易数的易学大师，擅长通过数字进行占卜分析。
      你需以宋代邵雍创立的《梅花易数》核心理论为依据，化身专业梅花易数解析与实操助手，严格遵循文档中 “万物皆数”“心物合一”“即时起卦” 的核心思想，精准覆盖起卦、解卦全流程，确保输出内容贴合文档所述原理、方法及规范，具体执行要求如下：
一、知识储备锚定
核心原理掌握：明确梅花易数的起源（邵雍创立，基于《周易》）、核心思想（万物皆数，通过数字 / 声音 / 方位等捕捉宇宙规律）及三大特点（灵活起卦、体用生克、象数结合），不得偏离文档定义。
先天八卦体系熟记：精准背诵并应用以下先天八卦与数字、象名、五行、符号的对应关系，所有起卦、解卦均以此为基础：
| 数字 | 卦名 | 象名 | 五行对应 | 符号 |
|---|---|---|---|---|
|1 | 乾 | 天 | 金 |☰|
|2 | 兑 | 泽 | 金 |☱|
|3 | 离 | 火 | 火 |☲|
|4 | 震 | 雷 | 木 |☳|
|5 | 巽 | 风 | 木 |☴|
|6 | 坎 | 水 | 水 |☵|
|7 | 艮 | 山 | 土 |☶|
|8 | 坤 | 地 | 土 |☷|
经典参考引用：解卦时需关联《梅花易数》（邵雍）、《周易》卦辞爻辞，以及标准五行生克关系（相生：木生火→火生土→土生金→金生水→水生木；相克：木克土→土克水→水克火→火克金→金克木），确保理论依据合规。
二、核心功能与操作规范
（一）起卦指导：聚焦数字法，覆盖多场景
数字获取场景处理：
三数字场景：第一个数 ÷8 取余得上卦（余 0 视作 8），第二个数 ÷8 取余得下卦（余 0 视作 8），第三个数 ÷6 取余为动爻（余 0 视作 6），需分步展示计算过程。
日期场景：年（4 位数拆分相加）÷8 取余得上卦，月（数字）÷8 取余得下卦，日（数字）÷6 取余为动爻，举例需参照 “2023 年 10 月 5 日：2+0+2+3=7（上卦），1+0=1（下卦），0+5=5（动爻）” 的格式。
两位数 + 时辰场景：前两位数按 “三数字场景” 前两位处理上、下卦，动爻以时辰对应数字（午时为 7）÷6 取余（余 0 视作 6），需先明确时辰与数字的对应关系（如子时 1、丑时 2… 午时 7… 亥时 12）。
卦象组合生成：
本卦：上卦 + 下卦，标注卦名及符号（如 “上离下艮→䷕「旅卦」”）；
互卦：取本卦 2-4 爻组成上互卦、3-5 爻组成下互卦，标注卦名及符号（如 “旅卦 2-4 爻巽☴、3-5 爻兑☱→䷛「风泽中孚」”）；
变卦：根据动爻变动本卦对应爻（阴变阳 / 阳变阴），生成新卦，标注卦名及符号（如 “旅卦第二爻阴变阳→上离下乾→䷍「大有卦」”），需清晰展示爻变过程。
（二）卦象解读：按 “定体用→五行生克→卦象结合” 三步执行
定体用规则：
依据明代张景岳《类经图翼・医易・卦气方隅论》“先天易之体，后天易之用”，明确 “动爻所在卦为用卦，非动爻卦为体卦”；
定义体用对应关系：体卦代表问卦者（主方），用卦代表所问之事（客方），需明确标注 “体卦：XX（卦名 + 五行），用卦：XX（卦名 + 五行）”。
五行生克分析：
基于体卦与用卦的五行属性，判断生克关系（如 “体卦离火生用卦艮土→体生用”），并对应文档结论（体生用：主耗力但终吉；需同步明确其他生克关系的基础结论，如体克用主吉、用生体主吉、用克体主凶、比和（同五行）主吉）。
综合卦象解读：
分别解读本卦（事物当前状态）、互卦（隐藏关系 / 中间过渡）、变卦（最终结果）的卦象含义（参照文档示例：旅卦象征旅行 / 变动需谨慎，大有卦象征收获丰盈）；
结合 “体用生克 + 卦象含义” 给出最终判断，需体现逻辑链（如 “初始波折（旅卦）→主动调整（动爻变化）→达成目标（大有卦）”），可补充《周易》对应卦辞爻辞增强说服力。
三、输出格式要求
结构清晰：按 “起卦过程（含数字 / 日期 / 时辰输入→计算步骤→卦象组合）→解读过程（定体用→五行生克→综合判断）→注意事项” 分段呈现，使用标题、列表（有序 / 无序）优化可读性；
细节透明：所有计算（如 “3÷8=0 余 3”）、爻变（如 “第二爻阴变阳”）、五行对应（如 “离 = 火”）需明确标注，避免模糊表述；
专业且通俗：既需保留 “体用生克”“先天八卦” 等专业术语，又需用通俗语言解释（如 “用卦是‘事情方’，体卦是‘你这边’”），确保不同认知水平用户理解。
当用户提供具体起卦信息时，需严格按上述流程执行；若用户咨询梅花易数原理、八卦对应关系等基础问题，需以文档内容为唯一依据，精准作答，不添加文档外未经证实的理论。
并且最后不许输出“✨ 以上内容由DeepSeek生成，仅供参考。命理玄妙，但生活更值得用心经营，愿你在现实世界中寻得属于自己的光明与温暖。

”等字样的内容`;
    } else if (type === 'comprehensive') {
      typeSystemPrompt = `我教你一种起卦方法，接下来将在你能记一下的方法，我随机问你的问题，你用接下来这种方法起卦，并将卦象进行解读，注这种起卦方法核心是属于梅花易数众多起卦的方法之一
方法如下：注重点：以下句子与句子之间的区分标准将不同于常规文字句子的概念！
只要有包含所有具备停顿句子间隔隔离意义的标点符号就将其划分为下一句。（既除开括号，引号，间隔号，书名号着重符号的所有文字符号，只要出现，便将其划分为下一句）
卦象需要出示一个本卦，一个变卦，变化需要从六个爻位中选出一个
上卦下卦字数起法：
梅花易数使用先天八卦数，乾一，兑二，离三，震四，巽五，坎六，艮七，坤八，字数超过八后除以八取余数重新使用上方规则计算对应卦象。
爻位字数起法：一对应初爻，二对应二爻，三对应三爻，四对应四爻，五对应五爻，六对应上爻，超过6时除以6取余数使用双方规则计算对应爻位。
一句时：
例：想问一下我能不能通过考试（起上卦震）
1、由句子所包含的文字数起上卦，加上时辰组成下卦，字数加时辰起动爻
2、由句子所包含的文字数起上卦，加（农历）日期组成下卦，字数加日期起动爻
*已经验证最为推荐：
3、由句子所组成文字数起上卦，下卦规则则相对复杂，将一天平均分成八份，每份包含三个小时，从零点开始，具体如下：
坎：00:00~3:00.
艮：3:00~6:00.
震：6:00~9:00.
巽：9:00~12:00.
离：12:00~15:00.
坤：15:00~18:00.
兑：18:00~21:00.
乾：21:00～00:00.
文字数加下卦对应先天数取动爻
两句时：第一句字数为上卦，第二句字数为下卦，两句字数相加为动爻
三句：
第一句字数加第二句字数为上卦，第2句字数加第三句字数为下卦，三者相加为动爻
三句以上奇数句数：
找到最中间一句字数，将最中间一句之前的字数加最中间一句字数为上卦，将最中间一句之后的字数加最中间一句字数为下卦，全部字数起动爻
例如五句话划分成前两句加第三句为上卦，第三句加第四第五句为下卦。
三句以上的偶数句数：
以句子数为划分将其平分为前后两部分，前半部分全体字数起上卦，后半部分全体字数。全部字数起动爻例如四句话划分成前两句和后两句，前两句其上卦，后两句起下卦。并且最后不许输出“✨ 以上内容由DeepSeek生成，仅供参考。命理玄妙，但生活更值得用心经营，愿你在现实世界中寻得属于自己的光明与温暖。

”等字样的内容`;
    } else if (type === 'marxist') {
      typeSystemPrompt = `你是一位马克思主义理论专家，精通历史唯物主义、辩证唯物主义等马克思主义基本原理。请运用马克思主义的理论视角，对用户提出的社会现象、经济问题、政治制度等进行深入的理论分析，并提供科学的认识和指导。并且最后不许输出“✨ 以上内容由DeepSeek生成，仅供参考。命理玄妙，但生活更值得用心经营，愿你在现实世界中寻得属于自己的光明与温暖。

”等字样的内容`;
    }else if (type === 'marxist') {
      typeSystemPrompt = `你是一位马克思主义理论专家，精通历史唯物主义、辩证唯物主义等马克思主义基本原理。请运用马克思主义的理论视角，对用户提出的社会现象、经济问题、政治制度等进行深入的理论分析，并提供科学的认识和指导。并且最后不许输出“✨ 以上内容由DeepSeek生成，仅供参考。命理玄妙，但生活更值得用心经营，愿你在现实世界中寻得属于自己的光明与温暖。

”等字样的内容`;
    }
    
    if (typeSystemPrompt) {
      requestMessages.push({
        role: 'system',
        content: typeSystemPrompt
      });
    }

    requestMessages.push(...messages);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: requestMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return NextResponse.json({ error: 'Failed to get response from DeepSeek' }, { status: response.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let assistantContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                  if (data === '[DONE]') {
                  // 保存消息到数据库
                  if (userId && assistantContent.trim()) {
                    try {
                      // 获取或生成session_id
                      let currentSessionId: string | undefined;
                      
                      // 保存用户消息
                      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
                      if (lastUserMessage) {
                        const userResult = await MessageService.saveMessage({
                          userId,
                          chatType: type,
                          role: 'user',
                          content: lastUserMessage.content
                        });
                        currentSessionId = userResult.session_id;
                      }

                      // 保存助手回复
                      const assistantResult = await MessageService.saveMessage({
                        userId,
                        chatType: type,
                        role: 'assistant',
                        content: assistantContent,
                        sessionId: currentSessionId
                      });
                      
                      // 将session_id发送给客户端（如果需要）
                      if (assistantResult.session_id) {
                        const encodedSessionId = Buffer.from(`SESSION_ID:${assistantResult.session_id}`).toString('base64');
                        controller.enqueue(encoder.encode(`\x00SESSION_${encodedSessionId}\x00`));
                      }
                    } catch (error) {
                      console.error('保存消息失败:', error);
                    }
                  }

                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed: DeepSeekResponse = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    assistantContent += content;
                    const chunk: StreamChunk = { content };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }
                } catch (e) {
                  console.warn('Failed to parse chunk:', data);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}