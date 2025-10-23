'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSidebar } from '@/components/Sidebar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_PROMPTS = [
  `欢迎来到马克思主义分析模块。在这里，我们将运用马克思主义的基本原理，包括历史唯物主义、辩证唯物主义等理论视角，结合现代社会发展的实际情况，为您分析各种问题。

请告诉我您想要分析的问题或现象，比如：
- 社会现象分析
- 经济问题探讨  
- 政治制度研究
- 文化发展趋势
- 个人发展规划

我将从马克思主义的角度为您提供深入的理论分析和实践指导。`,
];

function MarxistAnalysisContent() {
  const { isOpen: isSidebarOpen, isMobile } = useSidebar();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadHistoryConversation = useCallback(async (conversationId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/user/history/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        const historyMessages = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 加载历史记录
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      loadHistoryConversation(conversationId);
    }
  }, [searchParams, loadHistoryConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/dashscope', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                aria-label="返回"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold">马克思主义分析</h1>
                <p className="text-red-100 text-xs lg:text-sm">基于马克思主义理论的社会现象分析</p>
              </div>
            </div>
            <div className="text-xl lg:text-2xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
          {messages.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 lg:p-8">
              <div className="text-center mb-4 lg:mb-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto mb-3 lg:mb-4 flex items-center justify-center">
                  <span className="text-white text-lg lg:text-2xl font-bold">马</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">马克思主义理论分析</h2>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 lg:p-6 border border-red-100">
                <div className="prose prose-red max-w-none">
                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {DEFAULT_PROMPTS[0]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-2xl px-4 lg:px-6 py-3 lg:py-4 rounded-2xl shadow-sm border ${message.role === 'user'
                    ? 'bg-red-600 text-white border-red-600'
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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">正在分析中...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - 在移动端侧边栏打开时隐藏 */}
      {!(isMobile && isSidebarOpen) && (
        <div className="bg-white border-t border-gray-200 p-4 lg:p-6 fixed bottom-0 left-0 right-0 lg:left-64 lg:right-64 z-30 relative">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="flex space-x-2 lg:space-x-4 items-end">
              <div className="flex-1 max-w-2xl">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请描述您想要分析的社会现象或问题..."
                  className="w-full resize-none border border-gray-300 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all duration-200 min-h-[44px] lg:min-h-[52px] max-h-32 text-gray-900 bg-white placeholder:text-gray-500 text-sm lg:text-base"
                  rows={1}
                  disabled={isLoading}
                  style={{
                    lineHeight: '1.5',
                    fontSize: '16px'
                  }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 lg:px-6 py-2 lg:py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium min-w-[60px] lg:min-w-[80px] flex items-center justify-center h-[44px] lg:h-[52px] text-sm lg:text-base"
              >
                {isLoading ? (
                  <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  '分析'
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
export default function MarxistAnalysis() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <MarxistAnalysisContent />
    </Suspense>
  );
}