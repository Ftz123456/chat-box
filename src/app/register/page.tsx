import React from 'react';
import { astro } from "iztro";
function formatCompleteZiweiChart(data:any) {
   
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

    
    const palaceDescriptions = [];
    
    for (const palace of data.palaces) {
       
        let desc = `【${palace.name}宫】${palace.heavenlyStem}${palace.earthlyBranch}`;
        
        
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
        
    
        if (palace.adjectiveStars && palace.adjectiveStars.length > 0) {
            const adjStarsNames = palace.adjectiveStars.map((star: any) => star.name);
            desc += `\n  杂曜：${adjStarsNames.join('、')}`;
        }
        
        
        desc += `\n  长生十二神：${palace.changsheng12}`;
        
       
        desc += `，博士十二神：${palace.boshi12}`;
        
      
        desc += `\n  将前十二神：${palace.jiangqian12}，岁前十二神：${palace.suiqian12}`;
        
   
        const decadal = palace.decadal;
        desc += `\n  大限：${decadal.range[0]}-${decadal.range[1]}岁（${decadal.heavenlyStem}${decadal.earthlyBranch}）`;
        
        palaceDescriptions.push(desc);
    }
    
   
    const fullDescription = basicInfo + "【十二宫分布】\n" + palaceDescriptions.join("\n\n");
    
    return fullDescription;
}



export default function ZiweiPage() {

const astrolabe = astro.bySolar("2002-6-28", 6, "男");
  const chartText = formatCompleteZiweiChart(astrolabe);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre' }}>
      <h1>紫微斗数命盘测试（2000年数据）</h1>
      <div>
        <p>阳历: {astrolabe.solarDate}</p>
        <p>农历: {astrolabe.lunarDate}</p>
        <p>四柱: {astrolabe.chineseDate}</p>
        <p>时辰: {astrolabe.time} ({astrolabe.timeRange})</p>
        <p>星座: {astrolabe.sign} | 生肖: {astrolabe.zodiac}</p>
        <p>命宫地支: {astrolabe.earthlyBranchOfSoulPalace} | 身宫地支: {astrolabe.earthlyBranchOfBodyPalace}</p>
        <p>命主: {astrolabe.soul} | 身主: {astrolabe.body} | 五行局: {astrolabe.fiveElementsClass}</p>
      </div>
          <pre>{chartText}</pre>
        
          
    </div>
  );
}
