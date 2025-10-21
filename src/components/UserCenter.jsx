import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const UserCenter = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState([]);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    learningProgress: 0,
    badges: 0,
    membershipLevel: '普通'
  });
  const [loading, setLoading] = useState(true);

  // 获取用户统计数据
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('获取用户统计失败:', error);
      }
    };

    fetchUserStats();
  }, [user]);

  // 获取用户历史记录
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/history');
        if (response.ok) {
          const data = await response.json();
          setHistoryItems(data);
        }
      } catch (error) {
        console.error('获取历史记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // 跳转到对应的聊天页面并显示历史记录
  const handleViewHistory = (item) => {
    const pathMap = {
      'digital': '/?type=digital',
      'comprehensive': '/?type=comprehensive', 
      'bazi': '/bazi',
      'ziwei': '/ziwei',
      'marxist': '/marxist-analysis'
    };
    
    const path = pathMap[item.chat_type] || '/';
    router.push(`${path}?historyId=${item.id}`);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* 用户头部区域 */}
      <div className="flex items-center space-x-4">
        {/* 用户图标 */}
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        {/* 标题区域 */}
        <div>
          <h2 className="text-xl font-semibold">
            {user ? `${user.username} 的用户中心` : '用户中心'}
          </h2>
          <p className="text-gray-500 text-sm">
            {user?.email || '探索国学智慧，掌握人生命理'}
          </p>
        </div>
      </div>
      
      {/* 统计卡片区 */}
      <div className="flex flex-wrap gap-4 mt-6">
        {/* 咨询次数卡片 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center w-40">
          <div className="text-blue-500 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold">{stats.totalConsultations}</div>
          <div className="text-gray-500 text-sm">咨询次数</div>
        </div>
        
        {/* 学习进度卡片 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center w-40">
          <div className="text-blue-500 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75h13.5m-13.5 3h13.5m-13.5 3h13.5m-13.5 3h13.5"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold">{stats.learningProgress}%</div>
          <div className="text-gray-500 text-sm">学习详细资料</div>
        </div>
        
        {/* 勋章卡片 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center w-40">
          <div className="text-blue-500 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold">{stats.badges}</div>
          <div className="text-gray-500 text-sm">获得勋章</div>
        </div>
        
        {/* 会员等级卡片 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center w-40">
          <div className="text-blue-500 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 19.5a2.25 2.25 0 01-1.5-2.18l.007-1.03c0-1.135.845-2.098 1.976-2.188a48.04 48.04 0 0111.186 0c1.131.09 1.976 1.053 1.976 2.188l.007 1.03a2.25 2.25 0 01-1.5 2.18m-2.25-6.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm13.5 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <div className="text-xl font-semibold">{stats.membershipLevel}</div>
          <div className="text-gray-500 text-sm">会员等级</div>
        </div>
      </div>
      
      {/* 历史记录区域 */}
      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100">
        {/* 历史记录标题 */}
        <div className="flex items-center space-x-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5 0h.75m0 0h.75m0 0h.75m1.5 0h.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-semibold">历史记录</h3>
        </div>
        
        {/* 历史记录列表 */}
        <div>
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 mt-2">加载中...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无历史记录</p>
            </div>
          ) : (
            historyItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">{item.title || item.chat_type}</h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(item.created_at).toLocaleDateString('zh-CN')} · {item.message_count}条消息
                  </p>
                  {item.preview && (
                    <p className="text-gray-400 text-xs mt-1 truncate">
                      {item.preview}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => handleViewHistory(item)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  >
                    查看
                  </button>
                  <span className="bg-blue-100 text-blue-500 px-2 py-0.5 rounded text-xs">已完成</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCenter;
