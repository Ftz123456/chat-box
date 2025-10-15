'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Iztrolabe } from "react-iztro"
import FormPanel from '../../components/FormPanel';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}


function ZiWei() {
  const [dateType, setDateType] = useState<'solar' | 'lunar'>('solar');
  const [birthday, setBirthday] = useState('2002-06-18');
  const [hour, setHour] = useState('午时(11:00~13:00)');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [name, setName] = useState('');

  const hourMap = {
  // @ts-ignore
  ...{'晚子时(23:00~00:00)': 12},
    '早子时(00:00~01:00)': 0, '丑时(01:00~03:00)': 1, '寅时(03:00~05:00)': 2,
    '卯时(05:00~07:00)': 3, '辰时(07:00~09:00)': 4, '巳时(09:00~11:00)': 5,
    '午时(11:00~13:00)': 6, '未时(13:00~15:00)': 7, '申时(15:00~17:00)': 8,
    '酉时(17:00~19:00)': 9, '戌时(19:00~21:00)': 10, '亥时(21:00~23:00)': 11,'晚子时(23:00~00:00)': 12
  };

  return (
    <div className="App p-8 max-w-8xl w-full mx-100 flex gap-6 min-h-screen items-stretch" style={{ margin: '5px auto', boxShadow: '0 0 25px rgba(0,0,0,0.25)'}}>
      <div className="flex-1 h-[calc(100vh-2rem)]">
        <Iztrolabe
          birthday={birthday}
          birthTime={hourMap[hour as keyof typeof hourMap]}
          birthdayType={dateType}
          gender={gender}
          horoscopeDate={new Date()}
          horoscopeHour={1}
          className="h-full"
        />
      </div>
      <FormPanel 
        className="flex-shrink-0 h-[calc(100vh-2rem)]"
        onPanChart={({ dateType, birthday, hour, gender, name }) => {
          setDateType(dateType);
          setBirthday(birthday);
          setHour(hour);
          setGender(gender);
          setName(name);
        }} />
    </div>
  );
}





export default ZiWei;