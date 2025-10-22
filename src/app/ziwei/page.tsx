'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Iztrolabe } from "react-iztro"
import FormPanel from '../../components/FormPanel';
import { astro } from "iztro";
import { useSidebar } from '@/components/Sidebar';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}


function ZiWei() {
  const { isOpen: isSidebarOpen, isMobile } = useSidebar();
  const searchParams = useSearchParams();
  const [dateType, setDateType] = useState<'solar' | 'lunar'>('solar');
  const [birthday, setBirthday] = useState('2002-06-18');
  const [hour, setHour] = useState('午时(11:00~13:00)');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [isAutoSend, setIsAutoSend] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  console.log(horoscope); 


  const hourMap = {
  // @ts-ignore
  ...{'晚子时(23:00~00:00)': 12},
    '早子时(00:00~01:00)': 0, '丑时(01:00~03:00)': 1, '寅时(03:00~05:00)': 2,
    '卯时(05:00~07:00)': 3, '辰时(07:00~09:00)': 4, '巳时(09:00~11:00)': 5,
    '午时(11:00~13:00)': 6, '未时(13:00~15:00)': 7, '申时(15:00~17:00)': 8,
    '酉时(17:00~19:00)': 9, '戌时(19:00~21:00)': 10, '亥时(21:00~23:00)': 11,'晚子时(23:00~00:00)': 12
  };
 const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

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

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // 只有满足所有条件时才自动发送
    if (
      horoscope &&
      horoscope.trim() !== '' &&
      isAutoSend &&
      !isLoading &&
      messages.length === 0
    ) {
      handleAutoSendHoroscope(horoscope);
    }
  }, [horoscope, isAutoSend, isLoading, messages.length]);
  
// 自动发送 horoscope 给AI的函数
  const handleAutoSendHoroscope = async (currentHoroscope: string) => {
    if (isLoading) return; // 如果正在加载，不重复发送
    
    setIsLoading(true);
    const userMessage: Message = { 
      role: 'user', 
      content: `这是我的紫微斗数命盘信息：\n${currentHoroscope}\n\n请帮我分析解读。`
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/ziwei', {
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
      console.error('Error sending horoscope to AI:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，自动解析命盘时发生了错误。请稍后再试。'
      }]);
    } finally {
      setIsLoading(false);
      setIsAutoSend(false); // 重置自动发送状态
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
     console.log('horoscope:', horoscope);
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ziwei', {
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
  const firstUserIndex = messages.findIndex(m => m.role === 'user');
  return (
    <>
      {/* 顶部空白容器 - 高度等于按钮高度，只在手机端显示 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-[60] bg-transparent pointer-events-none" />
      
      <div className="App p-2 sm:p-4 lg:p-8 max-w-8xl w-full mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-6 min-h-screen" style={{ margin: '5px auto', boxShadow: '0 0 25px rgba(0,0,0,0.25)'}}>
        {/* 手机端顶部空白区域 - 确保内容不被按钮遮挡 */}
        <div className="lg:hidden h-16 w-full" />
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-6">
        {/* 星图区域 */}
        <div className="flex-1 w-full aspect-square lg:max-h-[calc(100vh-20rem)] lg:min-h-[400px] mb-4 sm:mb-6 lg:mb-0">
          <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <Iztrolabe
              birthday={birthday}
              birthTime={hourMap[hour as keyof typeof hourMap]}
              birthdayType={dateType}
              gender={gender}
              horoscopeDate={new Date()}
              horoscopeHour={1}
              className="w-full h-full"
            />
          </div>
        </div>
        {/* 表单区域 */}
        <div className="flex-shrink-0 h-auto lg:max-h-[calc(100vh-20rem)] flex items-stretch lg:min-h-[400px] w-full lg:w-auto">
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <FormPanel 
              className="h-full w-full"
              onPanChart={({ dateType, birthday, hour, gender, name ,horoscope,isAutoSend}) => {
                setDateType(dateType);
                setBirthday(birthday);
                setHour(hour);
                setGender(gender);
                setName(name);
                setHoroscope(horoscope);
                setIsAutoSend(isAutoSend)
              }} />
          </div>
        </div>
      
      </div>
      {/* 内容区域 - 去掉独立滚动，使整页跟随消息滚动 */}
      <div
      ref={contentWrapperRef}
      className="w-full mt-4"
      style={{
      padding: '16px',
      boxSizing: 'border-box',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
      }}
      >
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 pb-32">
          <>
            {messages.map((message, index) => (
              index === firstUserIndex ? null : (
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
              )
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
        </div>
      </div>

      {/* 输入区域 - 在移动端侧边栏打开时隐藏 */}
      {!(isMobile && isSidebarOpen) && (
        <div 
          className="bg-white border-t border-gray-200 p-4 lg:p-6 fixed bottom-0 left-0 right-0 lg:left-64 lg:right-0 z-30 "
           style={{ 
             boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
             boxSizing: 'border-box'
           }}
         >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex space-x-2 lg:space-x-4 items-end">
            <div className="flex-1 max-w-2xl">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={"输入您的问题"}
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
    </>
  );
}




export default ZiWei;