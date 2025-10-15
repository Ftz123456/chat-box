'use client';

import { useState } from 'react';

export default function FormPanel({ onPanChart, className }: { onPanChart: (data: any) => void; className?: string }) {
  const [dateType, setDateType] = useState('solar'); // 阳历/农历
  const [birthday, setBirthday] = useState('2002-06-18');
  const [hour, setHour] = useState('午时(11:00~13:00)');
  const [gender, setGender] = useState('male'); // 男/女
  const [name, setName] = useState('');

  // 切换日期类型
  const handleDateType = (type: 'solar' | 'lunar') => setDateType(type);
  // 处理生日输入
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => setBirthday(e.target.value);
  // 处理时辰选择
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => setHour(e.target.value);
  // 处理性别选择
  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => setGender(e.target.value);
  // 处理名字输入
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  // 点击「排盘」，传递表单数据给父组件
  const handlePan = () => {
    onPanChart({ dateType, birthday, hour, gender, name });
  };

  const hours = [
    "早子时(00:00~01:00)", "丑时(01:00~03:00)", "寅时(03:00~05:00)",
    "卯时(05:00~07:00)", "辰时(07:00~09:00)", "巳时(09:00~11:00)",
    "午时(11:00~13:00)", "未时(13:00~15:00)", "申时(15:00~17:00)",
    "酉时(17:00~19:00)", "戌时(19:00~21:00)", "亥时(21:00~23:00)","晚子时(23:00~00:00)"
  ];

  return (
    <div className={`form-panel w-64 bg-white rounded-lg shadow-md p-4 h-fit ${className || ''}`}>
      {/* 日期类型切换 */}
      <div className="form-group mb-4">
        <label className="block text-sm font-medium mb-1">日期类型</label>
        <div className="date-type-buttons flex">
          <button
            className={`flex-1 py-2 text-sm ${dateType === 'solar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleDateType('solar')}
          >
            阳历
          </button>
          <button
            className={`flex-1 py-2 text-sm ${dateType === 'lunar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleDateType('lunar')}
          >
            农历
          </button>
        </div>
      </div>

      {/* 生日输入 */}
      <div className="form-group mb-4">
        <label className="block text-sm font-medium mb-1">生日</label>
        <input
          type="date"
          value={birthday}
          onChange={handleBirthdayChange}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>

      {/* 时辰选择 */}
      <div className="form-group mb-4">
        <label className="block text-sm font-medium mb-1">时辰</label>
        <select
          value={hour}
          onChange={handleHourChange}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          {hours.map((h, idx) => (
            <option key={idx} value={h}>{h}</option>
          ))}
        </select>
      </div>

      {/* 性别选择 */}
      <div className="form-group mb-4">
        <label className="block text-sm font-medium mb-1">性别</label>
        <div className="gender-radios flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === 'male'}
              onChange={handleGenderChange}
              className="mr-1"
            />
            男
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === 'female'}
              onChange={handleGenderChange}
              className="mr-1"
            />
            女
          </label>
        </div>
      </div>

      {/* 名字输入 */}
      <div className="form-group mb-6">
        <label className="block text-sm font-medium mb-1">名字</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="输入姓名"
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>

      {/* 排盘按钮 */}
      <button
        className="pan-btn w-full py-2 bg-indigo-600 text-white rounded mb-4 hover:bg-indigo-700 transition-colors"
        onClick={handlePan}
      >
        排盘
      </button>

      
    </div>
  );
}