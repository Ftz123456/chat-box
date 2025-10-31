'use client';
import { useState, useEffect } from 'react';
import DatePicker, { DatePickerValue } from './DatePicker';

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 将 BaziFormData 转换为 DatePickerValue
  const parseDatePickerValue = (date: string, time: string): DatePickerValue | undefined => {
    if (!date || !time) return undefined;
    
    try {
      // date 格式: YYYY-MM-DD
      // time 格式: HH:MM
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
        return {
          year,
          month,
          day,
          hour,
          minute,
          calendarType: 'solar'
        };
      }
    } catch (e) {
      console.error('解析日期失败:', e);
    }
    return undefined;
  };

  // 将 DatePickerValue 转换为 BaziFormData 格式
  const formatDatePickerValue = (value: DatePickerValue): { date: string; time: string } => {
    const date = `${value.year}-${value.month.toString().padStart(2, '0')}-${value.day.toString().padStart(2, '0')}`;
    const hour = value.hour !== null ? value.hour : 0;
    const minute = value.minute !== null ? value.minute : 0;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return { date, time };
  };

  // 格式化显示日期时间
  const formatDisplayDateTime = () => {
    if (!formData.date || !formData.time) {
      return '点击选择日期时间';
    }
    try {
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hour, minute] = formData.time.split(':').map(Number);
      const hourStr = hour === null ? '未知' : hour.toString().padStart(2, '0');
      const minuteStr = minute === null ? '未知' : minute.toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hourStr}:${minuteStr}`;
    } catch (e) {
      return '点击选择日期时间';
    }
  };

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

  // 处理日期选择器确认
  const handleDatePickerConfirm = (value: DatePickerValue) => {
    const { date, time } = formatDatePickerValue(value);
    setFormData(prev => ({
      ...prev,
      date,
      time
    }));
    setIsDatePickerOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">八字排盘测试</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期时间
            </label>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors"
              aria-label="选择出生日期时间"
            >
              <span className={formData.date && formData.time ? 'text-gray-900' : 'text-gray-400'}>
                {formatDisplayDateTime()}
              </span>
            </button>
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

      {/* 日期选择器 */}
      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDatePickerConfirm}
        initialValue={parseDatePickerValue(formData.date, formData.time)}
      />
    </div>
  );
}
