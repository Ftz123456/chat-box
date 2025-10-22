'use client';

import React from 'react';
import UserCenter from '../../components/UserCenter';
import Image from 'next/image';

const UserCenterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面头部 */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white shadow-lg mb-4">
            <Image
              src="/log.png"
              alt="易璇AI"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            个人中心
          </h1>
          <p className="text-sm text-gray-600">
            管理您的账户信息和查看使用统计
          </p>
        </div>

        {/* 用户中心内容 */}
        <UserCenter />
      </div>
    </div>
  );
};

export default UserCenterPage; 