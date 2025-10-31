'use client';
import { useState, useEffect } from 'react';

interface BaziFormProps {
  onSubmit: (data: BaziFormData) => void;
  initialData?: Partial<BaziFormData>;
}

export interface BaziFormData {
  date: string;
  time: string;
  gender: 'male' | 'female';
  location?: string;
}

export default function BaziForm({ onSubmit, initialData }: BaziFormProps) {
  const [formData, setFormData] = useState<BaziFormData>({
    date: initialData?.date || '',
    time: initialData?.time || '',
    gender: initialData?.gender || 'male',
    location: initialData?.location || ''
  });

  // 当initialData变化时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.time) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof BaziFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">八字排盘测试</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-label="出生日期"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生时间
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-label="出生时间"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="性别"
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生地（可选）
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="如：北京市"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          >
            生成八字排盘
          </button>
        </div>
      </form>
    </div>
  );
}
