'use client';

import { useState } from 'react';
import { astro } from "iztro";
import DatePicker, { DatePickerValue } from './DatePicker';

export default function FormPanel({ onPanChart, className }: { onPanChart: (data: any) => void; className?: string }) {
  const [dateType, setDateType] = useState<'solar' | 'lunar'>('solar'); // 阳历/农历
  const [birthday, setBirthday] = useState('2002-06-18');
  const [hour, setHour] = useState('午时(11:00~13:00)');
  const [gender, setGender] = useState('male'); // 男/女
  const [name, setName] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [isAutoSend, setIsAutoSend] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);



  // 切换日期类型
  const handleDateType = (type: 'solar' | 'lunar') => {
    setDateType(type);
  };

  // 将 DatePickerValue 转换为生日字符串格式
  const formatBirthdayFromPicker = (value: DatePickerValue): string => {
    const date = `${value.year}-${value.month.toString().padStart(2, '0')}-${value.day.toString().padStart(2, '0')}`;
    return date;
  };

  // 将生日字符串转换为 DatePickerValue
  const parseBirthdayToPicker = (): DatePickerValue | undefined => {
    try {
      const [year, month, day] = birthday.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        // 获取时辰对应的小时
        const hourValue = hourMap[hour as keyof typeof hourMap];
        return {
          year,
          month,
          day,
          hour: hourValue !== undefined ? hourValue : 0,
          minute: 0,
          calendarType: dateType === 'lunar' ? 'lunar' : 'solar'
        };
      }
    } catch (e) {
      console.error('解析生日失败:', e);
    }
    return undefined;
  };

  // 处理日期选择器确认
  const handleDatePickerConfirm = (value: DatePickerValue) => {
    const formattedDate = formatBirthdayFromPicker(value);
    setBirthday(formattedDate);
    // 根据选择的日历类型更新 dateType
    if (value.calendarType === 'lunar') {
      setDateType('lunar');
    } else {
      setDateType('solar');
    }
    setIsDatePickerOpen(false);
  };

  // 格式化显示日期
  const formatDisplayBirthday = () => {
    if (!birthday) return '点击选择生日';
    try {
      const [year, month, day] = birthday.split('-');
      return `${year}年${month}月${day}日`;
    } catch (e) {
      return '点击选择生日';
    }
  };
  // 处理时辰选择
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => setHour(e.target.value);
  // 处理性别选择
  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => setGender(e.target.value);
  // 处理名字输入
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  // 点击「排盘」，传递表单数据给父组件
  const handlePan = () => {
    const astrolabe = astro.bySolar(birthday, hourMap[hour as keyof typeof hourMap], gender === 'male' ? "男" : "女", true, "zh-CN");
   
    setHoroscope(formatCompleteZiweiChart(astrolabe))
    const newHoroscope = formatCompleteZiweiChart(astrolabe);
    // 先更新本地状态
    setHoroscope(newHoroscope);
    console.log(horoscope);
    setIsAutoSend(true)
    onPanChart({ dateType, birthday, hour, gender, name, horoscope: newHoroscope, isAutoSend: true });
  };
  const hourMap = {
    // @ts-ignore
    ...{ '晚子时(23:00~00:00)': 12 },
    '早子时(00:00~01:00)': 0, '丑时(01:00~03:00)': 1, '寅时(03:00~05:00)': 2,
    '卯时(05:00~07:00)': 3, '辰时(07:00~09:00)': 4, '巳时(09:00~11:00)': 5,
    '午时(11:00~13:00)': 6, '未时(13:00~15:00)': 7, '申时(15:00~17:00)': 8,
    '酉时(17:00~19:00)': 9, '戌时(19:00~21:00)': 10, '亥时(21:00~23:00)': 11, '晚子时(23:00~00:00)': 12
  };
  const hours = [
    "早子时(00:00~01:00)", "丑时(01:00~03:00)", "寅时(03:00~05:00)",
    "卯时(05:00~07:00)", "辰时(07:00~09:00)", "巳时(09:00~11:00)",
    "午时(11:00~13:00)", "未时(13:00~15:00)", "申时(15:00~17:00)",
    "酉时(17:00~19:00)", "戌时(19:00~21:00)", "亥时(21:00~23:00)", "晚子时(23:00~00:00)"
  ];

  function formatCompleteZiweiChart(data: any) {
   
    // 基本信息部分
    const basicInfo = `【命盘基本信息】
性别：${data.gender}
出生日期：公历${data.solarDate}（农历${data.lunarDate}）
八字：${data.chineseDate}
出生时间：${data.time}（${data.timeRange}）
星座：${data.sign}，生肖：${data.zodiac}
命主：${data.soul}，身主：${data.body}
五行局：${data.fiveElementsClass}
命宫地支：${data.earthlyBranchOfSoulPalace}，身宫地支：${data.earthlyBranchOfBodyPalace}

`;

    // 处理十二宫位
    const palaceDescriptions = [];
    
    for (const palace of data.palaces) {
      // 宫位基本信息
      let desc = `【${palace.name}宫】${palace.heavenlyStem}${palace.earthlyBranch}`;
        
      // 特殊标记
      const specialMarks = [];
      if (palace.isBodyPalace) {
        specialMarks.push("身宫");
      }
      if (palace.isOriginalPalace) {
        specialMarks.push("来因宫");
      }
      if (specialMarks.length > 0) {
        desc += `〔${specialMarks.join('、')}〕`;
      }
        
      // 主星
      if (palace.majorStars && palace.majorStars.length > 0) {
        const majorStarsDesc = palace.majorStars.map((star: any) => {
          let starDesc = star.name;
          if (star.brightness) {
            starDesc += `(${star.brightness})`;
          }
          if (star.mutagen) {
            starDesc += `〔${star.mutagen}〕`;
          }
          return starDesc;
        });
        desc += `\n  主星：${majorStarsDesc.join('、')}`;
      }
        
      // 辅星
      if (palace.minorStars && palace.minorStars.length > 0) {
        const minorStarsDesc = palace.minorStars.map((star: any) => {
          let starDesc = star.name;
          if (star.brightness) {
            starDesc += `(${star.brightness})`;
          }
          if (star.mutagen) {
            starDesc += `〔${star.mutagen}〕`;
          }
          return starDesc;
        });
        desc += `\n  辅星：${minorStarsDesc.join('、')}`;
      }
        
      // 杂曜
      if (palace.adjectiveStars && palace.adjectiveStars.length > 0) {
        const adjStarsNames = palace.adjectiveStars.map((star: any) => star.name);
        desc += `\n  杂曜：${adjStarsNames.join('、')}`;
      }
        
      // 长生十二神
      desc += `\n  长生十二神：${palace.changsheng12}`;
        
      // 博士十二神
      desc += `，博士十二神：${palace.boshi12}`;
        
      // 流年神煞
      desc += `\n  将前十二神：${palace.jiangqian12}，岁前十二神：${palace.suiqian12}`;
        
      // 大限
      const decadal = palace.decadal;
      desc += `\n  大限：${decadal.range[0]}-${decadal.range[1]}岁（${decadal.heavenlyStem}${decadal.earthlyBranch}）`;
        
      palaceDescriptions.push(desc);
    }
    
    // 组合完整描述
    const fullDescription = basicInfo + "【十二宫分布】\n" + palaceDescriptions.join("\n\n");
    
    return fullDescription;
  }

  return (
    <div className={`form-panel w-full lg:w-64 bg-white rounded-lg shadow-md p-4 lg:p-6 h-fit ${className || ''}`}>
      {false && (
        < div className="form-group mb-4 lg:mb-6">
      <label className="block text-sm font-medium mb-2">日期类型</label>
      <div className="date-type-buttons flex space-x-2">
        <button
          className={`flex-1 py-2 lg:py-2.5 text-xs lg:text-sm rounded-md transition-all ${dateType === 'solar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          onClick={() => handleDateType('solar')}
        >
          阳历
        </button>
        <button
          className={`flex-1 py-2 lg:py-2.5 text-xs lg:text-sm rounded-md transition-all ${dateType === 'lunar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          onClick={() => handleDateType('lunar')}
        >
          农历
        </button>
      </div>
    </div>)}

      {/* 生日输入 */}
      <div className="form-group mb-4 lg:mb-6">
        <label className="block text-sm font-medium mb-2">生日</label>
        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="w-full p-2 lg:p-2.5 border border-gray-300 rounded-md text-xs lg:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-left bg-white hover:bg-gray-50"
          aria-label="选择生日"
        >
          <span className={birthday ? 'text-gray-900' : 'text-gray-400'}>
            {formatDisplayBirthday()}
          </span>
        </button>
      </div>

      {/* 时辰选择 */}
      <div className="form-group mb-4 lg:mb-6">
        <label className="block text-sm font-medium mb-2">时辰</label>
        <select
          value={hour}
          onChange={handleHourChange}
          className="w-full p-2 lg:p-2.5 border border-gray-300 rounded-md text-xs lg:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          aria-label="选择时辰"
        >
          {hours.map((h, idx) => (
            <option key={idx} value={h}>{h}</option>
          ))}
        </select>
      </div>

      {/* 性别选择 */}
      <div className="form-group mb-4 lg:mb-6">
        <label className="block text-sm font-medium mb-2">性别</label>
        <div className="gender-radios flex gap-4 lg:gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === 'male'}
              onChange={handleGenderChange}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs lg:text-sm">男</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === 'female'}
              onChange={handleGenderChange}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs lg:text-sm">女</span>
          </label>
        </div>
      </div>

      {/* 名字输入 */}
      <div className="form-group mb-6 lg:mb-8">
        <label className="block text-sm font-medium mb-2">名字</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="输入姓名"
          className="w-full p-2 lg:p-2.5 border border-gray-300 rounded-md text-xs lg:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* 排盘按钮 */}
      <button
        className="pan-btn w-full py-2 lg:py-3 bg-indigo-600 text-white rounded-md mb-4 hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md text-sm lg:text-base"
        onClick={handlePan}
      >
        排盘
      </button>

      {/* 日期选择器 */}
      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={handleDatePickerConfirm}
        initialValue={parseBirthdayToPicker()}
        showTime={false}
      />
    </div>
  );
}