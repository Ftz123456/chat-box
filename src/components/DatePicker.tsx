'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lunar } from 'lunar-typescript';

export interface DatePickerValue {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  calendarType: 'solar' | 'lunar';
}

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: DatePickerValue) => void;
  initialValue?: DatePickerValue;
  showTime?: boolean; // 是否显示时分选择，默认 true
}

const ITEM_HEIGHT = 44; // 每个选项的高度
const VISIBLE_ITEMS = 5; // 可见的项目数量
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2); // 上下填充的项目数量

export default function DatePicker({ isOpen, onClose, onConfirm, initialValue, showTime = true }: DatePickerProps) {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
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
      setHour(initialValue.hour !== null && initialValue.hour !== undefined ? initialValue.hour : 0);
      setMinute(initialValue.minute !== null && initialValue.minute !== undefined ? initialValue.minute : 0);
      setCalendarType(initialValue.calendarType || 'solar');
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

  // 当年月变化时，自动调整日期
  useEffect(() => {
    if (calendarType === 'solar') {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        setDay(daysInMonth);
      }
    } else if (calendarType === 'lunar') {
      // 农历日期调整：通过获取该月第一天的 Lunar 对象，然后获取该月的天数
      try {
        const isLeapMonth = month < 0;
        const actualMonth = Math.abs(month);
        // 农历月份天数计算：通过找到该月第一天和最后一天的公历日期
        let daysInMonth = 30; // 默认值
        try {
          // 找到该月第一天的公历日期
          let firstDaySolar: Date | null = null;
          for (let testDay = 1; testDay <= 31; testDay++) {
            try {
              const testLunar = Lunar.fromYmd(year, actualMonth, testDay);
              const solar = testLunar.getSolar();
              const solarDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
              // 检查是否是闰月：通过比较月份名称
              if (!firstDaySolar) {
                firstDaySolar = solarDate;
                // 再检查下一个月的第一天
                const nextMonthLunar = Lunar.fromDate(new Date(solarDate.getTime() + 32 * 86400000));
                // 如果月份相同但名称不同，说明有闰月
                if (nextMonthLunar.getMonth() === actualMonth && 
                    nextMonthLunar.getMonthInChinese() !== testLunar.getMonthInChinese() &&
                    isLeapMonth) {
                  // 这是闰月
                }
              }
              // 继续查找最后一天
              daysInMonth = testDay;
            } catch (e) {
              // 如果日期无效，说明已经找到最后一天
              if (firstDaySolar) break;
            }
          }
        } catch (e) {
          // 使用默认值
        }
        if (day > daysInMonth) {
          setDay(daysInMonth);
        }
      } catch (e) {
        // 如果转换失败，使用默认值
      }
    }
  }, [year, month, day, calendarType]);

  // 当切换日历类型时，转换日期
  const prevCalendarTypeRef = useRef(calendarType);
  useEffect(() => {
    if (!isOpen || prevCalendarTypeRef.current === calendarType) {
      prevCalendarTypeRef.current = calendarType;
      return;
    }
    
    try {
      if (calendarType === 'solar' && prevCalendarTypeRef.current === 'lunar') {
        // 从农历转为公历
        const isLeapMonth = month < 0;
        const actualMonth = Math.abs(month);
        // Lunar.fromYmd 只接受3个参数，不支持闰月参数
        // 需要通过遍历来找到正确的日期
        const lunar = Lunar.fromYmd(year, actualMonth, day);
        const solar = lunar.getSolar();
        // 检查是否是闰月，如果是，需要找到闰月对应的日期
        if (isLeapMonth) {
          // 查找该年的闰月：通过遍历该年所有日期
          let foundLeap = false;
          for (let m = 1; m <= 12; m++) {
            try {
              const testLunar1 = Lunar.fromYmd(year, m, 1);
              const testLunar2 = Lunar.fromYmd(year, m + 1 <= 12 ? m + 1 : 1, 1);
              if (m === actualMonth && testLunar1.getMonthInChinese() === testLunar2.getMonthInChinese()) {
                // 找到闰月，需要找到对应日期的公历日期
                // 通过查找该日期前后的公历日期来确定
                foundLeap = true;
                // 使用下一个同名月份的第一天作为参考
                break;
              }
            } catch (e) {
              continue;
            }
          }
          // 如果找不到，使用普通转换的结果
        }
        setYear(solar.getYear());
        setMonth(solar.getMonth());
        setDay(solar.getDay());
      } else if (calendarType === 'lunar' && prevCalendarTypeRef.current === 'solar') {
        // 从公历转为农历
        const solarDate = new Date(year, month - 1, day);
        const lunar = Lunar.fromDate(solarDate);
        const lunarYear = lunar.getYear();
        const lunarMonth = lunar.getMonth();
        const lunarDay = lunar.getDay();
        // 检查是否是闰月：通过比较相邻日期来判断
        const prevLunar = Lunar.fromDate(new Date(solarDate.getTime() - 86400000)); // 前一天
        const nextLunar = Lunar.fromDate(new Date(solarDate.getTime() + 86400000)); // 后一天
        // 如果当前日期和下一天的农历月份相同但月份名称不同，说明当前是闰月
        const isLeap = lunarMonth === nextLunar.getMonth() && 
                       lunar.getMonthInChinese() === prevLunar.getMonthInChinese() &&
                       lunar.getMonthInChinese() !== nextLunar.getMonthInChinese();
        // 如果是闰月，使用负数表示
        setMonth(isLeap ? -lunarMonth : lunarMonth);
        setYear(lunarYear);
        setDay(lunarDay);
      }
    } catch (e) {
      // 转换失败时保持原值
      console.error('日期转换失败:', e);
    }
    
    prevCalendarTypeRef.current = calendarType;
  }, [calendarType, isOpen]); // 只在 calendarType 变化时触发

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
    if (calendarType === 'lunar') {
      // 农历月份：1-12月，可能有闰月
      // 通过遍历该年份的公历日期来查找所有农历月份
      try {
        const months: number[] = [];
        const seenMonths = new Set<string>();
        
        // 遍历该年份的每一天，找出所有不同的农历月份
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        const monthMap = new Map<number, { name: string; isLeap: boolean }>();
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          try {
            const lunar = Lunar.fromDate(d);
            const lunarMonth = lunar.getMonth();
            const monthName = lunar.getMonthInChinese();
            const key = `${lunarMonth}_${monthName}`;
            
            if (!seenMonths.has(key)) {
              seenMonths.add(key);
              // 检查是否是闰月：比较前后日期
              const nextDay = new Date(d.getTime() + 86400000);
              const nextLunar = Lunar.fromDate(nextDay);
              // 如果月份数字相同但名称不同，说明有闰月
              const isLeap = nextLunar.getMonth() === lunarMonth && 
                           nextLunar.getMonthInChinese() !== monthName;
              monthMap.set(lunarMonth, { name: monthName, isLeap });
            }
          } catch (e) {
            continue;
          }
        }
        
        // 按月份顺序添加到数组
        for (let m = 1; m <= 12; m++) {
          const monthInfo = monthMap.get(m);
          if (monthInfo) {
            months.push(m);
            // 如果有闰月，添加闰月（用负数表示）
            if (monthInfo.isLeap) {
              // 找到闰月插入位置：在正常月份之后
              const nextMonth = m < 12 ? m + 1 : 1;
              if (monthMap.has(nextMonth)) {
                months.push(-m); // 闰月用负数表示
              }
            }
          }
        }
        
        return months.length > 0 ? months : Array.from({ length: 12 }, (_, i) => i + 1);
      } catch (e) {
        // 如果转换失败，返回常规月份
        return Array.from({ length: 12 }, (_, i) => i + 1);
      }
    }
    // 公历月份：1-12月
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 生成日期列表（根据年月）
  const generateDays = () => {
    if (calendarType === 'lunar') {
      // 农历日期：根据年份和月份（包括闰月）获取天数
      try {
        const isLeapMonth = month < 0;
        const actualMonth = Math.abs(month);
        // 通过遍历该年份找到该农历月对应的所有日期
        let daysInMonth = 30; // 默认值
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        const targetMonthName = isLeapMonth ? null : null; // 闰月需要通过遍历确定
        
        let maxDay = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          try {
            const lunar = Lunar.fromDate(d);
            if (lunar.getMonth() === actualMonth) {
              const lunarDay = lunar.getDay();
              // 检查是否是闰月
              if (isLeapMonth) {
                // 检查前后日期来确认是否是闰月
                const prevLunar = Lunar.fromDate(new Date(d.getTime() - 86400000));
                const nextLunar = Lunar.fromDate(new Date(d.getTime() + 86400000));
                if (prevLunar.getMonthInChinese() === lunar.getMonthInChinese() &&
                    nextLunar.getMonth() === actualMonth &&
                    nextLunar.getMonthInChinese() !== lunar.getMonthInChinese()) {
                  // 这是闰月
                  if (lunarDay > maxDay) maxDay = lunarDay;
                }
              } else {
                // 普通月份
                if (lunarDay > maxDay) maxDay = lunarDay;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        daysInMonth = maxDay > 0 ? maxDay : 30;
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
      } catch (e) {
        // 如果转换失败，返回默认值
        return Array.from({ length: 30 }, (_, i) => i + 1);
      }
    }
    // 公历日期
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

  // 格式化月份显示（支持农历闰月）
  const formatMonth = (month: number) => {
    if (calendarType === 'lunar') {
      const actualMonth = Math.abs(month);
      const isLeap = month < 0;
      
      // 农历月份中文名称
      const lunarMonthNames: { [key: number]: string } = {
        1: '正月',
        2: '二月',
        3: '三月',
        4: '四月',
        5: '五月',
        6: '六月',
        7: '七月',
        8: '八月',
        9: '九月',
        10: '十月',
        11: '十一月',
        12: '十二月'
      };
      
      const monthName = lunarMonthNames[actualMonth] || `${actualMonth}月`;
      
      if (isLeap) {
        return `闰${monthName}`;
      }
      return monthName;
    }
    // 公历月份使用数字格式
    return formatNumber(Math.abs(month));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col shadow-2xl md:rounded-3xl md:max-w-lg">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-600 text-base md:text-lg px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          
          {/* 日历类型切换 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarType('solar')}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                calendarType === 'solar'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              公历
            </button>
            <button
              onClick={() => setCalendarType('lunar')}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                calendarType === 'lunar'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              农历
            </button>
          </div>
          
          <button
            onClick={handleSetToday}
            className="text-gray-600 text-base md:text-lg px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            今天
          </button>
        </div>

        {/* 输入框 */}
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 md:gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="输入出生年月日时分 (格式199303270255)"
              maxLength={12}
              className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInputConfirm();
                }
              }}
            />
            <button
              onClick={handleInputConfirm}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-300 transition-colors"
            >
              确定
            </button>
          </div>
        </div>

        {/* 滚轮选择器 */}
        <div className="flex-1 overflow-hidden relative py-4 md:py-6">
          <div className="flex items-center h-full px-4 md:px-6 gap-2 md:gap-4">
            {/* 年份列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">年</div>
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
                    className="px-2 md:px-3 py-1 md:py-2 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none text-sm md:text-base transition-colors"
                    title="上一年的快捷按钮"
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
                    className="px-2 md:px-3 py-1 md:py-2 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none text-sm md:text-base transition-colors"
                    title="下一年的快捷按钮"
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
              <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">月</div>
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
                    className="px-2 md:px-3 py-1 md:py-2 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none text-sm md:text-base transition-colors"
                    title="上个月的快捷按钮（长按连续切换）"
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
                    className="px-2 md:px-3 py-1 md:py-2 text-gray-600 hover:bg-gray-100 rounded active:bg-gray-200 select-none text-sm md:text-base transition-colors"
                    title="下个月的快捷按钮（长按连续切换）"
                  >
                    ▶
                  </button>
                </div>
                <WheelPicker
                  items={months}
                  selectedValue={month}
                  onValueChange={setMonth}
                  format={(val) => formatMonth(val)}
                />
              </div>
            </div>

            {/* 日期列 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">日</div>
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
            {showTime && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">时</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                <WheelPicker
                  items={[null, ...hours]}
                  selectedValue={hour}
                  onValueChange={setHour}
                  format={(val) => val === null ? '未知' : formatNumber(val)}
                />
              </div>
            </div>
            )}

            {/* 分钟列 */}
            {showTime && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">分</div>
              <div className="relative w-full" style={{ height: COLUMN_HEIGHT }}>
                <WheelPicker
                  items={[null, ...minutes]}
                  selectedValue={minute}
                  onValueChange={setMinute}
                  format={(val) => val === null ? '未知' : formatNumber(val)}
                />
              </div>
            </div>
            )}
          </div>
        </div>

        {/* 底部确定按钮 */}
        <div className="p-4 md:p-6 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            className="w-full bg-purple-600 text-white py-3 md:py-4 rounded-xl text-base md:text-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-lg hover:shadow-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleConfirm();
              }
            }}
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
  const selectedIndex = items.findIndex(item => {
    // 处理 null 值的比较
    if (item === null && selectedValue === null) return true;
    return item === selectedValue;
  });
  const selectedIndexValue = selectedIndex >= 0 ? selectedIndex : 0;

  // 计算初始偏移 - 确保选中项在中间位置（两条指示线之间）
  useEffect(() => {
    if (!isDragging) {
      // 容器中心位置是 COLUMN_HEIGHT / 2
      // 选中项的中心应该在容器中心，所以选中项的顶部应该在 COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2
      // 由于有 padding，选中项的实际索引位置是 selectedIndexValue + PADDING_ITEMS
      // 所以需要移动的距离是 (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((selectedIndexValue + PADDING_ITEMS) * ITEM_HEIGHT)
      const targetOffset = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((selectedIndexValue + PADDING_ITEMS) * ITEM_HEIGHT);
      setCurrentTranslate(targetOffset);
      setVelocity(0);
    }
  }, [selectedIndexValue, isDragging, items.length]);

  // 处理触摸/鼠标开始
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    // 保存当前容器内的相对位置，而不是屏幕坐标
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      const relativeY = clientY - containerRect.top;
      setStartY(relativeY);
    } else {
      setStartY(clientY);
    }
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

    const containerRect = containerRef.current?.getBoundingClientRect();
    let deltaY: number;
    let currentRelativeY: number;
    
    if (containerRect) {
      currentRelativeY = clientY - containerRect.top;
      deltaY = currentRelativeY - startY;
    } else {
      currentRelativeY = clientY;
      deltaY = clientY - startY;
    }
    
    const newTranslate = currentTranslate + deltaY;
    
    // 限制滚动范围
    // 第一项居中：(COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - (0 + PADDING_ITEMS) * ITEM_HEIGHT
    // 最后一项居中：(COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((items.length - 1 + PADDING_ITEMS) * ITEM_HEIGHT)
    const minTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((items.length - 1 + PADDING_ITEMS) * ITEM_HEIGHT);
    const maxTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - (PADDING_ITEMS * ITEM_HEIGHT);
    const clampedTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
    
    setCurrentTranslate(clampedTranslate);
    setStartY(currentRelativeY);

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
    // 从 currentTranslate 计算选中项的索引（需要考虑 padding）
    // currentTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((index + PADDING_ITEMS) * ITEM_HEIGHT)
    // 所以 index = ((COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - currentTranslate) / ITEM_HEIGHT - PADDING_ITEMS
    const calculatedIndex = ((COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - clampedTranslate) / ITEM_HEIGHT - PADDING_ITEMS;
    const clampedIndex = Math.max(0, Math.min(items.length - 1, Math.round(calculatedIndex)));
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
        // 从 currentPos 计算对应的索引（需要考虑 padding）
        const calculatedIndex = ((COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - currentPos) / ITEM_HEIGHT - PADDING_ITEMS;
        const clampedIndex = Math.max(0, Math.min(items.length - 1, Math.round(calculatedIndex)));
        const targetTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((clampedIndex + PADDING_ITEMS) * ITEM_HEIGHT);
        
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
        const minTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - ((items.length - 1 + PADDING_ITEMS) * ITEM_HEIGHT);
        const maxTranslate = (COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - (PADDING_ITEMS * ITEM_HEIGHT);
        if (currentPos < minTranslate) {
          currentPos = minTranslate;
          currentVelocity = 0;
        } else if (currentPos > maxTranslate) {
          currentPos = maxTranslate;
          currentVelocity = 0;
        }
        
        setCurrentTranslate(currentPos);
        
        // 更新选中值
        const calculatedIndex = ((COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2) - currentPos) / ITEM_HEIGHT - PADDING_ITEMS;
        const clampedIndex = Math.max(0, Math.min(items.length - 1, Math.round(calculatedIndex)));
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
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleEnd();
    }
  };

  // 鼠标滚轮事件（web端）
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // 如果正在拖拽，忽略滚轮事件
    if (isDragging) return;
    
    const delta = e.deltaY;
    const scrollAmount = Math.abs(delta) > 50 ? 2 : 1; // 快速滚动时一次滚动多项
    
    if (delta > 0) {
      // 向下滚动，选择下一项
      let newIndex = selectedIndexValue + scrollAmount;
      newIndex = Math.min(newIndex, items.length - 1);
      if (items[newIndex] !== selectedValue) {
        onValueChange(items[newIndex]);
      }
    } else {
      // 向上滚动，选择上一项
      let newIndex = selectedIndexValue - scrollAmount;
      newIndex = Math.max(newIndex, 0);
      if (items[newIndex] !== selectedValue) {
        onValueChange(items[newIndex]);
      }
    }
  };

  // 渲染项目
  const renderItems = () => {
    // 添加上下 padding，确保滚动顺畅
    const allItems = [
      ...Array(PADDING_ITEMS).fill(null),
      ...items,
      ...Array(PADDING_ITEMS).fill(null)
    ];

    return allItems.map((item, index) => {
      const actualIndex = index - PADDING_ITEMS;
      if (actualIndex < 0 || actualIndex >= items.length) {
        // 填充项
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
          style={{ 
            height: ITEM_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className={`transition-all ${
            isSelected
              ? 'text-gray-900 font-bold text-lg md:text-xl' // 改为 font-bold，更粗更黑
              : 'text-gray-400 text-sm md:text-base font-normal'
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
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      tabIndex={0}
    >
      {/* 选中指示器 - 精确居中在容器中心 */}
      <div
        className="absolute left-0 right-0 border-t-2 border-b-2 border-purple-500 pointer-events-none z-10"
        style={{
          top: `${COLUMN_HEIGHT / 2 - ITEM_HEIGHT / 2}px`,
          height: ITEM_HEIGHT,
        }}
      />
      <div
        style={{
          // currentTranslate 已经包含了居中计算，直接使用
          // 确保选中项的中心对齐到容器中心（COLUMN_HEIGHT / 2）
          transform: `translateY(${currentTranslate}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          willChange: 'transform',
        }}
      >
        {renderItems()}
      </div>
    </div>
  );
}
