'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export interface DatePickerValue {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  calendarType: 'solar' | 'lunar' | 'bazi';
}

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: DatePickerValue) => void;
  initialValue?: DatePickerValue;
}

const ITEM_HEIGHT = 44; // 每个选项的高度
const VISIBLE_ITEMS = 5; // 可见的项目数量
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function DatePicker({ isOpen, onClose, onConfirm, initialValue }: DatePickerProps) {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar' | 'bazi'>('solar');
  const [year, setYear] = useState(initialValue?.year || new Date().getFullYear());
  const [month, setMonth] = useState(initialValue?.month || new Date().getMonth() + 1);
  const [day, setDay] = useState(initialValue?.day || new Date().getDate());
  const [hour, setHour] = useState<number | null>(initialValue?.hour ?? 0);
  const [minute, setMinute] = useState<number | null>(initialValue?.minute ?? 0);
  const [inputValue, setInputValue] = useState('');
  
  // 长按相关状态
  const longPressTimerRef = useRef<number | null>(null);
  const longPressIntervalRef = useRef<number | null>(null);

  // 初始化当前日期
  useEffect(() => {
    if (isOpen && !initialValue) {
      const now = new Date();
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
      setDay(now.getDate());
      setHour(now.getHours());
      setMinute(now.getMinutes());
    } else if (isOpen && initialValue) {
      setYear(initialValue.year);
      setMonth(initialValue.month);
      setDay(initialValue.day);
      setHour(initialValue.hour);
      setMinute(initialValue.minute);
      setCalendarType(initialValue.calendarType);
    }
  }, [isOpen, initialValue]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
      }
      if (longPressIntervalRef.current !== null) {
        clearInterval(longPressIntervalRef.current);
      }
    };
  }, []);

  // 生成年份列表
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // 生成月份列表
  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 生成日期列表（根据年月）
  const generateDays = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // 生成小时列表
  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  // 生成分钟列表
  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i);
  };

  const years = generateYears();
  const months = generateMonths();
  const days = generateDays();
  const hours = generateHours();
  const minutes = generateMinutes();

  // 处理输入框输入
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // 解析输入框内容（格式：199303270255 -> 1993年03月27日02时55分）
  const parseInputValue = (value: string): DatePickerValue | null => {
    if (value.length === 12) {
      const year = parseInt(value.substring(0, 4));
      const month = parseInt(value.substring(4, 6));
      const day = parseInt(value.substring(6, 8));
      const hour = parseInt(value.substring(8, 10));
      const minute = parseInt(value.substring(10, 12));
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
        // 验证日期有效性
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day) {
          return { year, month, day, hour, minute, calendarType };
        }
      }
    }
    return null;
  };

  // 确认输入框内容
  const handleInputConfirm = () => {
    const parsed = parseInputValue(inputValue);
    if (parsed) {
      setYear(parsed.year);
      setMonth(parsed.month);
      setDay(parsed.day);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setInputValue('');
    }
  };

  // 一年一年切换
  const handleYearStep = (direction: 'prev' | 'next') => {
    setYear(prev => {
      const newYear = direction === 'prev' ? prev - 1 : prev + 1;
      // 限制年份范围
      if (newYear >= 1900 && newYear <= 2100) {
        // 调整日期，避免2月29日等问题
        const daysInNewMonth = new Date(newYear, month, 0).getDate();
        if (day > daysInNewMonth) {
          setDay(daysInNewMonth);
        }
        return newYear;
      }
      return prev;
    });
  };

  // 长按开始
  const handleLongPressStart = (direction: 'prev' | 'next', callback: () => void) => {
    // 先执行一次
    callback();
    
    // 延迟后开始连续切换
    longPressTimerRef.current = window.setTimeout(() => {
      // 连续切换
      longPressIntervalRef.current = window.setInterval(() => {
        callback();
      }, 150); // 每150ms切换一次
    }, 500); // 500ms后开始连续切换
  };

  // 长按结束
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressIntervalRef.current !== null) {
      clearInterval(longPressIntervalRef.current);
      longPressIntervalRef.current = null;
    }
  };

  // 切换月份（支持长按连续切换）
  const handleMonthStep = useCallback((direction: 'prev' | 'next') => {
    setMonth(prev => {
      let newMonth = direction === 'prev' ? prev - 1 : prev + 1;
      let newYear = year;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear = year - 1;
        if (newYear >= 1900) {
          setYear(newYear);
        } else {
          return prev;
        }
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear = year + 1;
        if (newYear <= 2100) {
          setYear(newYear);
        } else {
          return prev;
        }
      }
      
      // 调整日期
      const daysInNewMonth = new Date(newYear, newMonth, 0).getDate();
      if (day > daysInNewMonth) {
        setDay(daysInNewMonth);
      }
      
      return newMonth;
    });
  }, [year, day]);

  // 确认选择
  const handleConfirm = () => {
    onConfirm({
      year,
      month,
      day,
      hour,
      minute,
      calendarType
    });
    onClose();
  };

  // 设置为今天
  const handleSetToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(now.getHours());
    setMinute(now.getMinutes());
  };

  // 格式化显示
  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-600 text-base px-2 py-1"
          >
            取消
          </button>
          
          {/* 日历类型切换 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarType('solar')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                calendarType === 'solar'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              公历
            </button>
            <button
              onClick={() => setCalendarType('lunar')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                calendarType === 'lunar'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              农历
            </button>
            <button
              onClick={() => setCalendarType('bazi')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                calendarType === 'bazi'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              四柱
            </button>
          </div>
          
          <button
            onClick={handleSetToday}
            className="text-gray-600 text-base px-2 py-1"
          >
            今天
          </button>
        </div>

        {/* 输入框 */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="输入出生年月日时分 (格式199303270255)"
              maxLength={12}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleInputConfirm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              确定
            </button>
          </div>
        </div>

        {/* 滚轮选择器 */}
        <div className="flex-1 overflow-hidden relative py-4">
          <div className="flex items-center h-full px-4">
            {/* 年份列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">年</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                {/* 年份导航按钮 */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center gap-4 z-10">
                  <button
                    onMouseDown={() => handleLongPressStart('prev', () => handleYearStep('prev'))}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart('prev', () => handleYearStep('prev'))}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none"
                  >
                    ◀
                  </button>
                  <button
                    onMouseDown={() => handleLongPressStart('next', () => handleYearStep('next'))}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart('next', () => handleYearStep('next'))}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none"
                  >
                    ▶
                  </button>
                </div>
                <WheelPicker
                  items={years}
                  selectedValue={year}
                  onValueChange={setYear}
                  format={(val) => val.toString()}
                />
              </div>
            </div>

            {/* 月份列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">月</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                {/* 月份导航按钮 */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center gap-4 z-10">
                  <button
                    onMouseDown={() => handleLongPressStart('prev', () => handleMonthStep('prev'))}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart('prev', () => handleMonthStep('prev'))}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none"
                  >
                    ◀
                  </button>
                  <button
                    onMouseDown={() => handleLongPressStart('next', () => handleMonthStep('next'))}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart('next', () => handleMonthStep('next'))}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none"
                  >
                    ▶
                  </button>
                </div>
                <WheelPicker
                  items={months}
                  selectedValue={month}
                  onValueChange={setMonth}
                  format={(val) => formatNumber(val)}
                />
              </div>
            </div>

            {/* 日期列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">日</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                <WheelPicker
                  items={days}
                  selectedValue={day}
                  onValueChange={setDay}
                  format={(val) => formatNumber(val)}
                />
              </div>
            </div>

            {/* 小时列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">时</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                <WheelPicker
                  items={[null, ...hours]}
                  selectedValue={hour}
                  onValueChange={setHour}
                  format={(val) => val === null ? '未知' : formatNumber(val)}
                />
              </div>
            </div>

            {/* 分钟列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">分</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                <WheelPicker
                  items={[null, ...minutes]}
                  selectedValue={minute}
                  onValueChange={setMinute}
                  format={(val) => val === null ? '未知' : formatNumber(val)}
                />
              </div>
            </div>
          </div>

          {/* 选中指示器 */}
          <div
            className="absolute left-4 right-4 border-t-2 border-b-2 border-purple-500 pointer-events-none"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              height: ITEM_HEIGHT,
              marginTop: COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2,
            }}
          />
        </div>

        {/* 底部确定按钮 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-base font-medium hover:bg-purple-700 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

// 滚轮选择器组件
interface WheelPickerProps<T> {
  items: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  format: (value: T) => string;
}

function WheelPicker<T>({ items, selectedValue, onValueChange, format }: WheelPickerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);

  // 计算当前选中索引
  const selectedIndex = items.findIndex(item => item === selectedValue);
  const selectedIndexValue = selectedIndex >= 0 ? selectedIndex : 0;

  // 计算初始偏移
  useEffect(() => {
    if (!isDragging) {
      const targetOffset = -selectedIndexValue * ITEM_HEIGHT;
      setCurrentTranslate(targetOffset);
      setVelocity(0);
    }
  }, [selectedIndexValue, isDragging]);

  // 处理触摸/鼠标开始
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setVelocity(0);
    lastYRef.current = clientY;
    lastTimeRef.current = Date.now();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // 处理移动
  const handleMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - startY;
    const newTranslate = currentTranslate + deltaY;

    // 限制滚动范围
    const minTranslate = -(items.length - 1) * ITEM_HEIGHT;
    const maxTranslate = 0;
    const clampedTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
    
    setCurrentTranslate(clampedTranslate);
    setStartY(clientY);

    // 计算速度
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    if (timeDelta > 0) {
      const yDelta = clientY - lastYRef.current;
      setVelocity(yDelta / timeDelta);
    }
    lastYRef.current = clientY;
    lastTimeRef.current = now;

    // 更新选中的值
    const currentIndex = Math.round(-clampedTranslate / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
    if (items[clampedIndex] !== selectedValue) {
      onValueChange(items[clampedIndex]);
    }
  };

  // 处理结束
  const handleEnd = () => {
    setIsDragging(false);
    
    // 惯性滚动
    let currentVelocity = velocity;
    let currentPos = currentTranslate;
    
    const animate = () => {
      if (Math.abs(currentVelocity) < 0.1) {
        // 滚动到最近的项
        const currentIndex = Math.round(-currentPos / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
        const targetTranslate = -clampedIndex * ITEM_HEIGHT;
        
        // 平滑滚动到目标位置
        const diff = targetTranslate - currentPos;
        if (Math.abs(diff) > 0.5) {
          currentPos += diff * 0.2;
          setCurrentTranslate(currentPos);
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentTranslate(targetTranslate);
          onValueChange(items[clampedIndex]);
        }
      } else {
        currentVelocity *= 0.95; // 摩擦系数
        currentPos += currentVelocity * 16; // 假设60fps
        
        // 边界检查
        const minTranslate = -(items.length - 1) * ITEM_HEIGHT;
        const maxTranslate = 0;
        if (currentPos < minTranslate) {
          currentPos = minTranslate;
          currentVelocity = 0;
        } else if (currentPos > maxTranslate) {
          currentPos = maxTranslate;
          currentVelocity = 0;
        }
        
        setCurrentTranslate(currentPos);
        
        // 更新选中值
        const currentIndex = Math.round(-currentPos / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex));
        if (items[clampedIndex] !== selectedValue) {
          onValueChange(items[clampedIndex]);
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // 渲染项目
  const renderItems = () => {
    // 填充上下空白区域，确保滚动顺畅
    const paddingItems = Math.floor(VISIBLE_ITEMS / 2);
    const allItems = [
      ...Array(paddingItems).fill(null),
      ...items,
      ...Array(paddingItems).fill(null)
    ];

    return allItems.map((item, index) => {
      const actualIndex = index - paddingItems;
      if (actualIndex < 0 || actualIndex >= items.length) {
        return (
          <div
            key={`padding-${index}`}
            style={{ height: ITEM_HEIGHT }}
            className="flex items-center justify-center"
          />
        );
      }

      const isSelected = item === selectedValue;
      return (
        <div
          key={`item-${actualIndex}`}
          style={{ height: ITEM_HEIGHT }}
          className={`flex items-center justify-center text-base transition-all ${
            isSelected
              ? 'text-gray-900 font-semibold text-lg'
              : 'text-gray-400 text-sm'
          }`}
        >
          {format(item)}
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="overflow-hidden relative"
      style={{ height: COLUMN_HEIGHT }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          transform: `translateY(${currentTranslate + (VISIBLE_ITEMS / 2) * ITEM_HEIGHT}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {renderItems()}
      </div>
    </div>
  );
}
