'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSidebar } from '@/components/Sidebar';

import { astro } from "iztro";
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function BaziMain() {
  const { isOpen: isSidebarOpen, isMobile } = useSidebar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const contentWrapperRef = useRef<HTMLDivElement>(null);
  

  // 加载历史记录
  useEffect(() => {
    const historyId = searchParams.get('historyId');
    if (historyId) {
      loadHistoryRecord(historyId);
    }
  }, [searchParams]);

  const loadHistoryRecord = async (historyId: string) => {
    try {
      const response = await fetch(`/api/user/history/${historyId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/zhongyiChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const responseData = await response.json();
      
      if (responseData.content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseData.content
        }]);
      } else {
        throw new Error('No content in response');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* 内容区域 - 独立滚动容器 */}
      <div 
        ref={contentWrapperRef}
        className="flex-1 overflow-y-auto"
        style={{ 
          padding: '16px lg:24px',
          maxHeight: 'calc(100vh - 130px)', // 精确计算高度，避开输入框
          boxSizing: 'border-box'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
          {messages.length === 0 ? (
            <BaziPrompt />
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in mb-4`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-2xl px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-sm border ${message.role === 'user'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-800 border-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          pre: ({ children }) => (
                            <pre className="bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
                              {children}
                            </pre>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm border">
                                {children}
                              </code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          }
                        }}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in mb-4">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">正在生成解析结果...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* 输入区域 - 在移动端侧边栏打开时隐藏 */}
      {!(isMobile && isSidebarOpen) && (
        <div 
          className="bg-white border-t border-gray-200 p-4 lg:p-6 fixed bottom-0 left-0 right-0 lg:left-0 lg:right-0 z-30 relative"
          style={{ 
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box' // 确保padding不影响宽度
          }}
        >
        {/* 与内容区域严格对齐 */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex space-x-2 lg:space-x-4 items-end">
            <div className="flex-1 max-w-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={"请根据八字命理使用说明，输入您的问题"}
                className="w-full resize-none border border-gray-300 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 min-h-[44px] lg:min-h-[52px] max-h-32 text-gray-900 bg-white placeholder:text-gray-500 text-sm lg:text-base"
                rows={1}
                disabled={isLoading}
                style={{ lineHeight: '1.5', fontSize: '16px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium min-w-[60px] lg:min-w-[80px] flex items-center justify-center h-[44px] lg:h-[52px] text-sm lg:text-base"
            >
              {isLoading ? (
                <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

// 修改说明面板，避免高度冲突
function BaziPrompt() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 lg:p-8 xl:p-10">
       {/* Header */}
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        <div className="text-center">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2 lg:mb-4">八字命理说明</h1>
        </div>
      </div>
    </div>

      {/* 引言部分 */}
        <div className="mb-6 lg:mb-8">
          <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
            同志您好！作为马克思主义命理分析助手，我的说明书可以这样简明概括：
          </p>
        </div>

        {/* 核心功能部分 */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-3 lg:mb-4 pb-2 border-b border-gray-200">
            1. 核心功能
          </h2>
          <ul className="space-y-2 lg:space-y-3 text-sm lg:text-base text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>八字命理唯物分析 矛盾论指导下的性格解构 实践论指引的改运建议</span>
            </li>
          </ul>
        </div>


      {/* 使用方法部分 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          2. 使用方法
        </h2>
        <ol className="space-y-4 text-gray-700">
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-1 flex-shrink-0">①</span>
            <span>提供生辰信息(年月日时+出生地+性别，例如1999年6月28日11时33分四川省成都市 男)</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-1 flex-shrink-0">②</span>
            <span>描述具体困惑/问题场景。</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-1 flex-shrink-0">③</span>
            <span>我们会分三步走:先分析命理特征-再用辩证法剖析矛盾-最后给出《实践论》式解决方案。</span>
          </li>
        </ol>
      </div>

      {/* 典型问题部分 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          3. 典型问题
        </h2>
        <ul className="space-y-4 text-gray-700">
          <li className="bg-gray-50 p-4 rounded-lg">
            <span className="font-medium text-gray-800">事业发展的阶段性矛盾</span>，比如该不该换城市发展?要考研还是工作?
          </li>
          <li className="bg-gray-50 p-4 rounded-lg">
            <span className="font-medium text-gray-800">人际关系的主要矛盾</span>，比如我明明很小心，还是很容易得罪人，这段感情要不要继续?
          </li>
          <li className="bg-gray-50 p-4 rounded-lg">
            <span className="font-medium text-gray-800">自我认知的辩证统一</span>，比如想深入认识自己的思维性格特点，需要自己调整为人处世策略。
          </li>
        </ul>
      </div>

      {/* 注意事项部分 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          4. 注意事项
        </h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-gray-700">
          <p className="font-medium">所有分析基于唯物辩证法!拒绝形而上学宿命论!强调主观能动性改造。</p>
        </div>
      </div>

      {/* 结尾部分 */}
      <div className="mt-10 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 italic">当你准备好后，我以命理为镜，供你展开阅读。</p>
      </div>
    </div>
  );
}

function Loading() {
  return <div>Loading search parameters...</div>;
}
function formatCompleteZiweiChart(data: any) {
   
    // 基本信息部分
    const basicInfo = `【命盘基本信息】
性别：${data.gender}
出生日期：公历${data.solarDate}（农历${data.lunarDate}）
八字：${data.chineseDate}
出生时间：${data.time}（${data.timeRange}）
星座：${data.sign}，生肖：${data.zodiac}
命主：${data.soul}，身主：${data.body}
五行局：${data.fiveElementsClass}
命宫地支：${data.earthlyBranchOfSoulPalace}，身宫地支：${data.earthlyBranchOfBodyPalace}

`;

    // 处理十二宫位
    const palaceDescriptions = [];
    
    for (const palace of data.palaces) {
        // 宫位基本信息
        let desc = `【${palace.name}宫】${palace.heavenlyStem}${palace.earthlyBranch}`;
        
        // 特殊标记
        const specialMarks = [];
        if (palace.isBodyPalace) {
            specialMarks.push("身宫");
        }
        if (palace.isOriginalPalace) {
            specialMarks.push("来因宫");
        }
        if (specialMarks.length > 0) {
            desc += `〔${specialMarks.join('、')}〕`;
        }
        
        // 主星
        if (palace.majorStars && palace.majorStars.length > 0) {
            const majorStarsDesc = palace.majorStars.map((star: any) => {
                let starDesc = star.name;
                if (star.brightness) {
                    starDesc += `(${star.brightness})`;
                }
                if (star.mutagen) {
                    starDesc += `〔${star.mutagen}〕`;
                }
                return starDesc;
            });
            desc += `\n  主星：${majorStarsDesc.join('、')}`;
        }
        
        // 辅星
        if (palace.minorStars && palace.minorStars.length > 0) {
            const minorStarsDesc = palace.minorStars.map((star: any) => {
                let starDesc = star.name;
                if (star.brightness) {
                    starDesc += `(${star.brightness})`;
                }
                if (star.mutagen) {
                    starDesc += `〔${star.mutagen}〕`;
                }
                return starDesc;
            });
            desc += `\n  辅星：${minorStarsDesc.join('、')}`;
        }
        
        // 杂曜
        if (palace.adjectiveStars && palace.adjectiveStars.length > 0) {
            const adjStarsNames = palace.adjectiveStars.map((star: any) => star.name);
            desc += `\n  杂曜：${adjStarsNames.join('、')}`;
        }
        
        // 长生十二神
        desc += `\n  长生十二神：${palace.changsheng12}`;
        
        // 博士十二神
        desc += `，博士十二神：${palace.boshi12}`;
        
        // 流年神煞
        desc += `\n  将前十二神：${palace.jiangqian12}，岁前十二神：${palace.suiqian12}`;
        
        // 大限
        const decadal = palace.decadal;
        desc += `\n  大限：${decadal.range[0]}-${decadal.range[1]}岁（${decadal.heavenlyStem}${decadal.earthlyBranch}）`;
        
        palaceDescriptions.push(desc);
    }
    
    // 组合完整描述
    const fullDescription = basicInfo + "【十二宫分布】\n" + palaceDescriptions.join("\n\n");
    
    return fullDescription;
}








export default function BaziPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BaziMain />
    </Suspense>
  );
}
