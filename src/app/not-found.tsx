'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-30 h-30 mb-6 shadow-lg rounded-full overflow-hidden bg-white">
            <Image
              src="/log.png"
              alt="易旅AI"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">功能开发中</h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8">
            抱歉，您访问的页面正在开发中
          </p>
          
          {/* Description */}
          <div className="prose prose-lg text-gray-700 mb-8">
            <p className="text-gray-600">
              我们正在努力为您提供更好的服务体验，
              此功能即将上线，敬请期待！
            </p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            返回首页
          </button>
          
          {/* Decorative Elements */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              🔮 易璇AI - 智能占卜助手
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
