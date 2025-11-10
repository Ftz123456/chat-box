'use client';

import OptionCard from '@/components/OptionCard';
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { throttle } from 'lodash';
import { useSidebar } from '@/components/Sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const DEFAULT_PROMPTS = {
  digital: `你好，欢迎来到这个独特的占卜空间。在这里，我们将运用古老的梅花易数，结合现代大数据分析、马克思主义的唯物辩证法以及中国传统文化智慧，为你解读当下的困惑，并预测未来的趋势。

为了开始，请你告诉我两件事：

三个数字：请随意说出你心中想到的3个数字，需要分开输入，每个数字都用空格隔开

一个占卜内容：你想占卜什么事情？比如：事业发展、感情走向、学业前景，或是一个具体问题的答案。

准备好了吗？请告诉我你的数字和占卜内容吧。`,
  comprehensive: `欢迎使用综合起卦模式。在这种模式下，你可以直接描述你想要占卜的问题和相关情况，我将结合传统易学理论为你进行分析和解读。

请详细描述：
1. 你想要占卜的具体问题
2. 相关的背景情况
3. 你希望了解的方面

例如："我最近在考虑跳槽到一家新公司，这个决定对我的职业发展会有什么影响？"

请开始你的描述吧。`
};

const createMessage = (role: Message['role'], content: string): Message => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content,
  timestamp: Date.now()
});

// 使用 useSearchParams 的组件
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen: isSidebarOpen, isMobile } = useSidebar();
  const [chatType, setChatType] = useState<'digital' | 'comprehensive'>('digital');
  const [messagesByType, setMessagesByType] = useState<Record<string, Message[]>>({
    digital: [],
    comprehensive: []
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionCards, setShowOptionCards] = useState(true);
  const [initialPrompt, setInitialPrompt] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantMessageId = useRef<string | null>(null);
  const queueRef = useRef<string[]>([]);

  const hasMessages = messagesByType[chatType].length > 0;

  const loadHistoryConversation = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/user/history/${encodeURIComponent(sessionId)}`);
      
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages.map((msg: any, index: number) => ({
          id: `${msg.role}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || Date.now()
        }));
        
        // 先设置消息，再设置聊天类型，确保状态同步
        setMessagesByType(prev => ({
          ...prev,
          [data.chat_type]: messages
        }));
        
        // 立即设置聊天类型，不使用setTimeout
        setChatType(data.chat_type);
        setShowOptionCards(false);
        setInitialPrompt(false);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 加载历史记录
  useEffect(() => {
    // 优先使用sessionId，兼容旧的conversationId
    const sessionId = searchParams.get('sessionId') || searchParams.get('conversationId');
    
    if (sessionId) {
      loadHistoryConversation(sessionId);
    }
  }, [searchParams, loadHistoryConversation]);

  // 返回按钮处理函数
  const handleBackToOptions = () => {
    setShowOptionCards(true);
    setInitialPrompt(true);
  };

  // 切换聊天类型时隐藏选项卡
  const handleDigitalDivination = () => {
    setChatType('digital');
    
  };

  const handleComprehensiveDivination = () => {
    setChatType('comprehensive');
   
  };

  // 清空对话
  const clearChat = () => {
    setMessagesByType(prev => ({
      ...prev,
      [chatType]: []
    }));
    setInitialPrompt(true);
  };

  // 节流函数优化
  const flushMessages = useCallback(
    throttle(() => {
      requestAnimationFrame(() => {
        if (queueRef.current.length > 0) {
          const batchContent = queueRef.current.join('');
          queueRef.current = [];
          
          setMessagesByType(prev => {
            const currentMessages = prev[chatType];
            const hasAssistantMessage = currentAssistantMessageId.current && 
              currentMessages.some(msg => msg.id === currentAssistantMessageId.current);
            
            if (hasAssistantMessage) {
              return {
                ...prev,
                [chatType]: currentMessages.map(msg =>
                  msg.id === currentAssistantMessageId.current
                    ? { ...msg, content: msg.content + batchContent }
                    : msg
                )
              };
            } else {
              const newAssistantMessage = createMessage('assistant', batchContent);
              currentAssistantMessageId.current = newAssistantMessage.id;
              return {
                ...prev,
                [chatType]: [...currentMessages, newAssistantMessage]
              };
            }
          });
        }
      });
    }, 300),
    [chatType]
  );

  // 自动滚动优化
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messagesByType[chatType], isLoading, scrollToBottom]);

  const sendMessage = async () => {
     setShowOptionCards(false);
    if (!input.trim() || isLoading) return;
    setInitialPrompt(false);

    // 关键修改：用户直接输入时，如果没有选择方式，默认使用数字起卦[1,2](@ref)
    let actualChatType = chatType;
    // if (showOptionCards) {
    //   actualChatType = 'digital'; // 默认数字起卦
    //   setChatType('digital');
    //   setShowOptionCards(false);
    // }

    const userMessage = createMessage('user', input);
    setMessagesByType(prev => ({
      ...prev,
      [actualChatType]: [...prev[actualChatType], userMessage]
    }));
    setInput('');
    setIsLoading(true);
    currentAssistantMessageId.current = null;
    queueRef.current = [];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messagesByType[actualChatType], userMessage],
          type: actualChatType 
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setIsLoading(false);
                flushMessages.cancel();
                if (queueRef.current.length > 0) {
                  setMessagesByType(prev => {
                    const currentMessages = prev[actualChatType];
                    return currentAssistantMessageId.current
                      ? {
                          ...prev,
                          [actualChatType]: currentMessages.map(msg =>
                            msg.id === currentAssistantMessageId.current
                              ? { ...msg, content: msg.content + queueRef.current.join('') }
                              : msg
                          )
                        }
                      : prev;
                  });
                  queueRef.current = [];
                }
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  queueRef.current.push(parsed.content);
                  flushMessages();
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = createMessage('assistant', '抱歉，发生了错误。请稍后再试。');
      setMessagesByType(prev => ({
        ...prev,
        [actualChatType]: [...prev[actualChatType], errorMessage]
      }));
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

  const getInitialPrompt = () => {
    return chatType === 'digital' ? DEFAULT_PROMPTS.digital : DEFAULT_PROMPTS.comprehensive;
  };

  const currentMessages = messagesByType[chatType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* 内容区域 */}
      <div 
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto pb-32 lg:pb-32" // 增加底部padding为输入框留出空间
        style={{ 
          padding: '16px lg:24px',
          maxHeight: 'calc(100vh - 130px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
         {showOptionCards && (
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
              </div>
              {/* 标题区域 */}
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 lg:w-28 lg:h-28 mb-6 lg:mb-8 shadow-lg rounded-full overflow-hidden bg-white">
                  <Image
                    src="/log.png"
                    alt="易璇AI"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-4 lg:mb-6">欢迎使用易璇AI</h1>
                <p className="text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12">
                  {showOptionCards ? '请选择您的起卦方式' : `${chatType === 'digital' ? '数字起卦' : '综合起卦'}`}
                </p>
              </div>
                
              <div className="flex-1"></div>
              
            </div>
           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12 max-w-5xl mx-auto mb-8 lg:mb-16">
              <OptionCard
                title="数字起卦"
                subtitle="通过三个数字起卦"
                icon="1️⃣2️⃣"
                variant={chatType === 'digital' ? 'primary' : 'secondary'}
                onClick={handleDigitalDivination}
              />
              <OptionCard
                title="综合起卦"
                subtitle="通过文字内容起卦"
                icon="📋"
                variant={chatType === 'comprehensive' ? 'primary' : 'secondary'}
                onClick={handleComprehensiveDivination}
              />
            </div>
        
          </div>
        </div>
      )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-12">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
            <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
              {/* 控制按钮区域 */}
              {!showOptionCards && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">  
                    <button
                    onClick={handleBackToOptions}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    返回选择
                  </button>
                    <span className="text-base lg:text-lg font-semibold text-gray-700">
                      {chatType === 'digital' ? '数字起卦' : '综合起卦'}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {currentMessages.length} 条消息
                    </span>
                  </div>
                  <button
                    onClick={clearChat}
                    className="flex items-center px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    清空对话
                  </button>
                </div>
              )}
              
              {/* 初始提示 */}
              {initialPrompt && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-8">
                  <div className="bg-blue-50 rounded-xl p-4 lg:p-6 border border-blue-100">
                    <div className="prose prose-blue max-w-none">
                      <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                         {getInitialPrompt()}
                      </p>  
                    </div>
                  </div>
                </div>
              )}
         

              {/* 历史记录加载状态 */}
              {isLoadingHistory && (
                <div className="flex justify-center animate-fade-in">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">正在加载历史记录...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 消息列表 */}
              {!showOptionCards && !isLoadingHistory && currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-2xl px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-sm border ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-800 border-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
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
                            },
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0 leading-relaxed text-gray-700">{children}</p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 text-gray-800">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold mb-2 text-gray-800">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-medium mb-2 text-gray-800">{children}</h3>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">{children}</strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {!showOptionCards && isLoading && (
                <div className="flex justify-start animate-fade-in">
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
            </div>
          </div>
        </div>
      </div>

      {/* Input Area - 在移动端侧边栏打开时隐藏 */}
      {!(isMobile && isSidebarOpen) && (
        <div 
          className="bg-white border-t border-gray-200 p-4 lg:p-6 fixed bottom-0 left-0 right-0 lg:left-64 z-30"
          style={{ 
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box'
          }}
        >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex space-x-2 lg:space-x-4 items-end">
            <div className="flex-1 max-w-2xl relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                    chatType === 'digital' 
                    ? "请输入三个数字和占卜问题..." 
                    : "请描述您想要占卜的问题..."
                }
                className="w-full resize-none border border-gray-300 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 min-h-[44px] lg:min-h-[52px] max-h-32 text-gray-900 bg-white placeholder:text-gray-500 text-sm lg:text-base"
                rows={1}
                disabled={isLoading}
                style={{
                  lineHeight: '1.5',
                  fontSize: '16px'
                }}
              />
              {input.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {input.length} 字
                </div>
              )}
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

// 主组件，用 Suspense 包装
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}