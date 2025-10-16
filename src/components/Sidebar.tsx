'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

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

  const menuItems = [
    { icon: '💬', label: '对话中心', path: '/' },
    { icon: '🔮', label: '八字命理', path: '/bazi' },
    { icon: '⭐', label: '紫微斗数', path: '/ziwei' },
    { icon: '🎯', label: '梅花易数', path: '/meihua' },
    { icon: '🚀', label: '专项驱动', path: '/kaoyan' },
    { icon: '👁️', label: '易学理论', path: '/theory' },
    { icon: '🛍️', label: '开运物品', path: '/products' },
    { icon: '🛍️', label: 'ceshi', path: '/marxist-analysis' },
    { icon: '💬', label: '交流反馈', path: '/feedback' },
    { icon: '👤', label: '账户中心', path: '/account' }
  ];

  const handleMenuClick = (path: string) => {
    setActiveItem(path);
    router.push(path);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 h-screen fixed left-0 top-0 shadow-2xl border-r border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
            <Image
              src="/log.png"
              alt="易璇AI"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-white">易璇AI</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={activeItem === item.path}
            onClick={() => handleMenuClick(item.path)}
          />
        ))}
      </nav>
    </div>
  );
}
