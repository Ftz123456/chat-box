'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, createContext, useContext, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

// 创建侧边栏状态上下文
const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}>({
  isOpen: false,
  setIsOpen: () => {},
  isMobile: false
});

export const useSidebar = () => useContext(SidebarContext);

interface MenuItemProps {
  icon: string;
  label: string;
  path: string;
  isActive?: boolean;
  onClick?: () => void;
}

const MenuItem = ({ icon, label, isActive, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 监听路径变化，更新活动菜单项
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  const menuItems = [
    { icon: '💬', label: '对话中心', path: '/', exact: true },
    { icon: '🔮', label: '八字命理', path: '/bazi', exact: true },
    { icon: '⭐', label: '紫微斗数', path: '/ziwei', exact: true },
    { icon: '🎯', label: '梅花易数', path: '/meihua', exact: true },
    { icon: '🚀', label: '专项驱动', path: '/kaoyan', exact: true },
    { icon: '👁️', label: '易学理论', path: '/theory', exact: true },
    { icon: '🛍️', label: '开运物品', path: '/products', exact: true },
    { icon: '💬', label: '交流反馈', path: '/feedback', exact: true },
    { icon: '👤', label: '账户中心', path: '/account', exact: true }
  ];

  const handleMenuClick = (path: string) => {
    setActiveItem(path);
    router.push(path);
    // 在移动端点击菜单项后关闭侧边栏
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        aria-label="打开菜单"
        title="打开菜单"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-gradient-to-b from-gray-800 to-gray-900 h-screen fixed left-0 top-0 shadow-2xl border-r border-gray-700 z-[60]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
                <Image
                  src="/log.png"
                  alt="易璇AI"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-white">易璇AI</h1>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
              aria-label="关闭菜单"
              title="关闭菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {menuItems.map((item, index) => {
            // 判断菜单项是否激活
            const isActive = item.exact 
              ? activeItem === item.path 
              : activeItem.startsWith(item.path);
            
            return (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={isActive}
                onClick={() => handleMenuClick(item.path)}
              />
            );
          })}
        </nav>

        {/* User Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.phone}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors"
                title="登出"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push('/login');
                  setIsOpen(false);
                }}
                className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                登录
              </button>
              <button
                onClick={() => {
                  router.push('/register');
                  setIsOpen(false);
                }}
                className="w-full bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                注册
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
