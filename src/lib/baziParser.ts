// 生辰信息提取工具

export interface BirthInfo {
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
  gender?: 'male' | 'female';
  location?: string;
  complete: boolean;
}

/**
 * 从用户输入中提取生辰信息
 * 支持多种格式：
 * - "1999年6月28日11时33分四川省成都市 男"
 * - "1999-06-28 11:33"
 * - "我是1999年6月28日11时33分出生的，男"
 */
export function extractBirthInfo(text: string): BirthInfo {
  const result: BirthInfo = {
    complete: false
  };

  // 提取年份（1990-2099）
  const yearPattern = /(?:出生于|出生日期|生辰|八字|公历).*?(\d{4})(?:年|-|\/)/;
  const yearMatch = text.match(yearPattern) || text.match(/(\d{4})年/);
  if (yearMatch) {
    result.year = yearMatch[1];
  }

  // 提取月份（1-12或01-12）
  const monthPattern = /(?:年|-|\/)(\d{1,2})(?:月|-|\/)/;
  const monthMatch = text.match(monthPattern);
  if (monthMatch && monthMatch[1]) {
    const monthNum = parseInt(monthMatch[1]);
    if (monthNum >= 1 && monthNum <= 12) {
      result.month = monthNum.toString().padStart(2, '0');
    }
  }

  // 提取日期（1-31或01-31）
  const dayPattern = /(?:月|-|\/)(\d{1,2})(?:日|号|$| )/;
  const dayMatch = text.match(dayPattern);
  if (dayMatch && dayMatch[1]) {
    const dayNum = parseInt(dayMatch[1]);
    if (dayNum >= 1 && dayNum <= 31) {
      result.day = dayNum.toString().padStart(2, '0');
    }
  }

  // 提取小时
  const hourPattern = /(\d{1,2})(?:时|点|：|:)/;
  const hourMatch = text.match(hourPattern);
  if (hourMatch) {
    result.hour = hourMatch[1].padStart(2, '0');
  }

  // 提取分钟
  const minutePattern = /(?:时|点|：|:)(?:(\d{1,2})(?:分|$| ))?/;
  let minuteMatch = text.match(minutePattern);
  if (!minuteMatch || !minuteMatch[1]) {
    // 尝试提取 "11:33" 格式
    const colonMinutePattern = /:(\d{1,2})(?:分|$| )/;
    minuteMatch = text.match(colonMinutePattern);
  }
  if (minuteMatch && minuteMatch[1]) {
    result.minute = minuteMatch[1].padStart(2, '0');
  }

  // 提取性别
  const malePattern = /(男|雄性|male|Male)/;
  const femalePattern = /(女|雌性|female|Female)/;
  if (text.match(malePattern)) {
    result.gender = 'male';
  } else if (text.match(femalePattern)) {
    result.gender = 'female';
  }

  // 提取地点（省市区等）
  const locationPattern = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]\w+(?:省|市|自治区|特别行政区))/;
  const locationMatch = text.match(locationPattern);
  if (locationMatch) {
    result.location = locationMatch[1];
  }

  // 判断是否完整
  result.complete = !!(result.year && result.month && result.day && result.hour && result.minute);

  return result;
}

/**
 * 将生辰信息转换为BaziFormData格式
 */
export function convertToBaziFormData(birthInfo: BirthInfo): {
  date: string;
  time: string;
  gender: 'male' | 'female';
  location?: string;
} | null {
  if (!birthInfo.complete || !birthInfo.gender) {
    return null;
  }

  const date = `${birthInfo.year}-${birthInfo.month}-${birthInfo.day}`;
  const time = `${birthInfo.hour}:${birthInfo.minute}`;

  return {
    date,
    time,
    gender: birthInfo.gender,
    location: birthInfo.location
  };
}

/**
 * 将生辰信息转换为格式化的字符串用于显示
 */
export function formatBirthInfo(birthInfo: BirthInfo): string {
  const parts: string[] = [];
  
  if (birthInfo.year) parts.push(birthInfo.year + '年');
  if (birthInfo.month) parts.push(birthInfo.month + '月');
  if (birthInfo.day) parts.push(birthInfo.day + '日');
  if (birthInfo.hour) parts.push(birthInfo.hour + '时');
  if (birthInfo.minute) parts.push(birthInfo.minute + '分');
  
  if (birthInfo.gender) parts.push(birthInfo.gender === 'male' ? '男' : '女');
  if (birthInfo.location) parts.push(birthInfo.location);
  
  return parts.join(' ');
}

