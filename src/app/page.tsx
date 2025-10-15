'use client';

import OptionCard from '@/components/OptionCard';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { astro } from "iztro";
interface Message {
  role: 'user' | 'assistant';
  content: string;
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


export default function Home() {
  // const astrolabe = astro.bySolar("2002-6-28", 6, "男", true, "zh-CN");
  // const horoscope = astrolabe.horoscope('2025-10-11');
 
  
  // console.log(JSON.stringify(astrolabe)); 



  const router = useRouter();

  const [chatType, setChatType] = useState<'digital' | 'comprehensive'>('digital');

  const handleDigitalDivination = () => {
    setChatType('digital');
    // 保留其他类型的消息记录
  };

  const handleComprehensiveDivination = () => {
    setChatType('comprehensive');
    // 保留其他类型的消息记录
  };
  const [messagesByType, setMessagesByType] = useState<Record<string, Message[]>>({
  digital: [],
  comprehensive: []
});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  
  // 使用内部状态管理chatType
  // const chatType = searchParams.get('type') || 'digital';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesByType[chatType]]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messagesByType[chatType], userMessage];
    setMessagesByType(prev => ({
      ...prev,
      [chatType]: newMessages
    }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          type: chatType 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
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
                setIsLoading(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessagesByType(prev => ({
                    ...prev,
                    [chatType]: prev[chatType].some(m => m.role === 'assistant')
                      ? prev[chatType].map((m, i, arr) => i === arr.length - 1 ? { role: 'assistant', content: assistantContent } : m)
                      : [...prev[chatType], { role: 'assistant', content: assistantContent }]
                  }));
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
      setMessagesByType(prev => ({
        ...prev,
        [chatType]: [...prev[chatType], {
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后再试。'
        }]
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

  const getTypeTitle = () => {
    return chatType === 'digital' ? '数字起卦' : '综合起卦';
  };

  const getInitialPrompt = () => {
    return chatType === 'digital' ? DEFAULT_PROMPTS.digital : DEFAULT_PROMPTS.comprehensive;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 shadow-lg rounded-full overflow-hidden bg-white">
              <Image
                src="/log.png"
                alt="易璇AI"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">欢迎使用易璇AI</h1>
            <p className="text-xl text-gray-600">请选择您的起卦方式</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Option Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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

        
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {messagesByType[chatType].length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {getInitialPrompt()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {messagesByType[chatType].map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl shadow-sm border ${message.role === 'user'
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
              </div>
            </div>
          ))}

          {isLoading && (
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

      {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6 fixed bottom-0 left-0 right-0 z-50 relative">
        
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatType === 'digital' ? "请输入三个数字和占卜问题..." : "请描述您想要占卜的问题..."}
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 min-h-[52px] max-h-32 text-gray-900 bg-white placeholder:text-gray-500"
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
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-medium min-w-[80px] flex items-center justify-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
