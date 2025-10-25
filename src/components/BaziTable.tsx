'use client';
import { Lunar } from 'lunar-typescript';
import { BaziFormData } from './BaziForm';

interface BaziTableProps {
  formData: BaziFormData;
}

interface BaziData {
  // 主表格数据
  mainTable: {
    liuNian: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
    daYun: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
    nianZhu: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
    yueZhu: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
    riZhu: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
    shiZhu: {
      shiShen: string;
      tianGan: string;
      diZhi: string;
      cangGan: string[];
      xingYun: string;
      ziZuo: string;
      naYin: string;
    };
  };
  // 喜用忌
  xiYongJi: {
    xi: string;
    yong: string;
    ji: string;
  };
  // 大运
  daYun: Array<{
    age: string;
    ganZhi: string;
  }>;
  // 流年
  liuNian: Array<{
    year: string;
    ganZhi: string;
  }>;
  // 备注
  notes: {
    tianGan: string;
    diZhi: string;
  };
}

// 获取五行颜色
const getWuXingColor = (element: string) => {
  const colors: { [key: string]: string } = {
    '木': 'text-green-600',
    '火': 'text-red-600',
    '土': 'text-yellow-600',
    '金': 'text-gray-600',
    '水': 'text-blue-600'
  };
  return colors[element] || 'text-gray-600';
};

// 获取天干颜色
const getTianGanColor = (gan: string) => {
  const colors: { [key: string]: string } = {
    '甲': 'text-green-600',
    '乙': 'text-green-600',
    '丙': 'text-red-600',
    '丁': 'text-red-600',
    '戊': 'text-yellow-600',
    '己': 'text-yellow-600',
    '庚': 'text-gray-600',
    '辛': 'text-gray-600',
    '壬': 'text-blue-600',
    '癸': 'text-blue-600'
  };
  return colors[gan] || 'text-gray-600';
};

// 获取地支颜色
const getDiZhiColor = (zhi: string) => {
  const colors: { [key: string]: string } = {
    '寅': 'text-green-600',
    '卯': 'text-green-600',
    '巳': 'text-yellow-600',
    '午': 'text-red-600',
    '申': 'text-green-600',
    '酉': 'text-yellow-600',
    '亥': 'text-blue-600',
    '子': 'text-blue-600',
    '丑': 'text-yellow-600',
    '辰': 'text-yellow-600',
    '未': 'text-yellow-600',
    '戌': 'text-yellow-600'
  };
  return colors[zhi] || 'text-gray-600';
};

export default function BaziTable({ formData }: BaziTableProps) {
  // 生成八字数据
  const generateBaziData = (): BaziData => {
    try {
      const dateTime = `${formData.date} ${formData.time}:00`;
      const lunar = Lunar.fromDate(new Date(dateTime));
      const d = lunar.getEightChar();
      const yun = d.getYun(formData.gender === 'male' ? 1 : 0);
      const daYunArr = yun.getDaYun();

      
      // 获取当前年份
      const currentYear = new Date().getFullYear();
      
      // 找到当前年份所在的大运
      let currentDaYunIndex = 0;
      let currentLiuNianArr: any[] = [];
      
      for (let i = 0; i < daYunArr.length; i++) {
        const daYun = daYunArr[i];
        const liuNianArr = daYun.getLiuNian();
        
        // 检查当前年份是否在这个大运的流年中
        const hasCurrentYear = liuNianArr.some(ln => ln.getYear() === currentYear);
        if (hasCurrentYear) {
          currentDaYunIndex = i;
          currentLiuNianArr = liuNianArr;
          break;
        }
      }
      
      // 如果没找到当前年份，使用第一个大运
      if (currentLiuNianArr.length === 0) {
        currentLiuNianArr = daYunArr[0]?.getLiuNian() || [];
      }
      
      const currentLiuNian = currentLiuNianArr.find(ln => ln.getYear() === currentYear) || currentLiuNianArr[0];

      // 获取地支藏干信息
      const getCangGan = (zhi: string) => {
        const cangGanMap: { [key: string]: string[] } = {
          '子': ['癸'],
          '丑': ['己', '癸', '辛'],
          '寅': ['甲', '丙', '戊'],
          '卯': ['乙'],
          '辰': ['戊', '乙', '癸'],
          '巳': ['丙', '庚', '戊'],
          '午': ['丁', '己'],
          '未': ['己', '丁', '乙'],
          '申': ['庚', '壬', '戊'],
          '酉': ['辛'],
          '戌': ['戊', '辛', '丁'],
          '亥': ['壬', '甲']
        };
        return cangGanMap[zhi] || [];
      };

      // 获取十神信息（根据日干推算）
      const getShiShen = (gan: string, isRiZhu: boolean = false) => {
        if (isRiZhu) {
          return formData.gender === 'male' ? '元男' : '元女';
        }
        
        const riGan = d.getDayGan();
        const ganOrder = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const riGanIndex = ganOrder.indexOf(riGan);
        const ganIndex = ganOrder.indexOf(gan);
        
        if (riGanIndex === -1 || ganIndex === -1) return '未知';
        
        // 十神关系：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
        const shiShenOrder = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
        const diff = (ganIndex - riGanIndex + 10) % 10;
        return shiShenOrder[diff];
      };

      // 生成主表格数据
      const mainTable = {
        liuNian: {
          shiShen: currentLiuNian ? getShiShen(currentLiuNian.getGanZhi().substring(0, 1)) : '偏印',
          tianGan: currentLiuNian?.getGanZhi()?.substring(0, 1) || '乙',
          diZhi: currentLiuNian?.getGanZhi()?.substring(1, 2) || '巳',
          cangGan: currentLiuNian ? getCangGan(currentLiuNian.getGanZhi().substring(1, 2)).map(gan => `${gan}${getShiShen(gan)}`) : ['丙劫财', '庚正财', '戊伤官'],
          xingYun: '帝旺', // 这里需要根据实际计算
          ziZuo: '沐浴', // 这里需要根据实际计算
          naYin: '覆灯火' // 这里需要根据实际计算
        },
        daYun: {
          shiShen: daYunArr[0] ? getShiShen(daYunArr[0].getGanZhi().substring(0, 1)) : '食神',
          tianGan: daYunArr[0]?.getGanZhi()?.substring(0, 1) || '己',
          diZhi: daYunArr[0]?.getGanZhi()?.substring(1, 2) || '酉',
          cangGan: daYunArr[0] ? getCangGan(daYunArr[0].getGanZhi().substring(1, 2)).map(gan => `${gan}${getShiShen(gan)}`) : ['辛偏财'],
          xingYun: '长生', // 这里需要根据实际计算
          ziZuo: '长生', // 这里需要根据实际计算
          naYin: '大驿土' // 这里需要根据实际计算
        },
        nianZhu: {
          shiShen: d.getYearShiShenGan() || '正官',
          tianGan: d.getYearGan() || '壬',
          diZhi: d.getYearZhi() || '午',
          cangGan: getCangGan(d.getYearZhi()).map(gan => `${gan}${getShiShen(gan)}`),
          xingYun: '临官', // 这里需要根据实际计算
          ziZuo: '胎', // 这里需要根据实际计算
          naYin: d.getYearNaYin() || '杨柳木'
        },
        yueZhu: {
          shiShen: d.getMonthShiShenGan() || '劫财',
          tianGan: d.getMonthGan() || '丙',
          diZhi: d.getMonthZhi() || '午',
          cangGan: getCangGan(d.getMonthZhi()).map(gan => `${gan}${getShiShen(gan)}`),
          xingYun: '临官', // 这里需要根据实际计算
          ziZuo: '帝旺', // 这里需要根据实际计算
          naYin: d.getMonthNaYin() || '天河水'
        },
        riZhu: {
          shiShen: formData.gender === 'male' ? '元男' : '元女',
          tianGan: d.getDayGan() || '丁',
          diZhi: d.getDayZhi() || '卯',
          cangGan: getCangGan(d.getDayZhi()).map(gan => `${gan}${getShiShen(gan)}`),
          xingYun: '病', // 这里需要根据实际计算
          ziZuo: '病', // 这里需要根据实际计算
          naYin: d.getDayNaYin() || '炉中火'
        },
        shiZhu: {
          shiShen: d.getTimeShiShenGan() || '劫财',
          tianGan: d.getTimeGan() || '丙',
          diZhi: d.getTimeZhi() || '午',
          cangGan: getCangGan(d.getTimeZhi()).map(gan => `${gan}${getShiShen(gan)}`),
          xingYun: '临官', // 这里需要根据实际计算
          ziZuo: '帝旺', // 这里需要根据实际计算
          naYin: d.getTimeNaYin() || '天河水'
        }
      };

      // 生成喜用忌（简化版本，实际应该根据八字分析）
      const xiYongJi = {
        xi: '土',
        yong: '金',
        ji: '火'
      };

      // 生成大运数据
      const daYun = daYunArr.slice(0, 10).map((dy, index) => ({
        age: `${dy.getStartAge()}-${dy.getStartAge() + 9}`,
        ganZhi: dy.getGanZhi()
      }));

      // 生成流年数据（从当前年份开始，使用lunar库的方法）
      const generateLiuNianFromCurrentYear = () => {
        const liuNianData = [];
        
        // 从当前年份开始，生成未来10年的流年数据
        for (let i = 0; i < 10; i++) {
          const year = currentYear + i;
          let liuNian = null;
          
          // 在所有大运中查找该年份的流年
          for (let j = 0; j < daYunArr.length; j++) {
            const daYun = daYunArr[j];
            const liuNianArr = daYun.getLiuNian();
            liuNian = liuNianArr.find(ln => ln.getYear() === year);
            if (liuNian) break;
          }
          
          if (liuNian) {
            // 使用lunar库计算的流年数据
            liuNianData.push({
              year: year.toString(),
              ganZhi: liuNian.getGanZhi()
            });
          } else {
            // 如果没找到，使用lunar库重新计算该年份的八字
            try {
              const yearLunar = Lunar.fromDate(new Date(`${year}-01-01 12:00:00`));
              const yearEightChar = yearLunar.getEightChar();
              liuNianData.push({
                year: year.toString(),
                ganZhi: yearEightChar.getYearGan() + yearEightChar.getYearZhi()
              });
            } catch (error) {
              // 如果计算失败，使用默认值
              liuNianData.push({
                year: year.toString(),
                ganZhi: '未知'
              });
            }
          }
        }
        
        return liuNianData;
      };

      const liuNian = generateLiuNianFromCurrentYear();

      // 生成备注
      const notes = {
        tianGan: `${d.getYearGan()}(木)克${d.getMonthGan()}(土), ${d.getMonthGan()}(土)克${d.getDayGan()}(水), ${d.getDayGan()}(水)克${d.getTimeGan()}(火), ${d.getTimeGan()}(水)克${d.getDayGan()}(火), ${d.getDayGan()}${d.getTimeGan()}合化木`,
        diZhi: `${d.getYearZhi()}${d.getMonthZhi()}相冲`
      };

      return {
        mainTable,
        xiYongJi,
        daYun,
        liuNian,
        notes
      };
    } catch (error) {
      console.error('生成八字数据失败:', error);
      // 返回默认数据
      return {
        mainTable: {
          liuNian: { shiShen: '偏印', tianGan: '乙', diZhi: '巳', cangGan: ['丙劫财', '庚正财', '戊伤官'], xingYun: '帝旺', ziZuo: '沐浴', naYin: '覆灯火' },
          daYun: { shiShen: '食神', tianGan: '己', diZhi: '酉', cangGan: ['辛偏财'], xingYun: '长生', ziZuo: '长生', naYin: '大驿土' },
          nianZhu: { shiShen: '正官', tianGan: '壬', diZhi: '午', cangGan: ['丁比肩', '己食神'], xingYun: '临官', ziZuo: '胎', naYin: '杨柳木' },
          yueZhu: { shiShen: '劫财', tianGan: '丙', diZhi: '午', cangGan: ['丁比肩', '己食神'], xingYun: '临官', ziZuo: '帝旺', naYin: '天河水' },
          riZhu: { shiShen: '元男', tianGan: '丁', diZhi: '卯', cangGan: ['乙偏印'], xingYun: '病', ziZuo: '病', naYin: '炉中火' },
          shiZhu: { shiShen: '劫财', tianGan: '丙', diZhi: '午', cangGan: ['丁比肩', '己食神'], xingYun: '临官', ziZuo: '帝旺', naYin: '天河水' }
        },
        xiYongJi: { xi: '土', yong: '金', ji: '火' },
        daYun: [],
        liuNian: [],
        notes: { tianGan: '', diZhi: '' }
      };
    }
  };

  const baziData = generateBaziData();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">八字排盘</h2>
      
      {/* 主表格 */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border-2 border-gray-400 text-sm font-medium">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-2 border-gray-400 px-3 py-2 w-16 font-bold"></th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">流年</th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">大运</th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">年柱</th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">月柱</th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">日柱</th>
              <th className="border-2 border-gray-400 px-3 py-2 font-bold text-center">时柱</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">十神</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.liuNian.shiShen}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.daYun.shiShen}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.nianZhu.shiShen}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.yueZhu.shiShen}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.riZhu.shiShen}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.shiZhu.shiShen}</td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">天干</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.liuNian.tianGan)}`}>
                  {baziData.mainTable.liuNian.tianGan}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.daYun.tianGan)}`}>
                  {baziData.mainTable.daYun.tianGan}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.nianZhu.tianGan)}`}>
                  {baziData.mainTable.nianZhu.tianGan}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.yueZhu.tianGan)}`}>
                  {baziData.mainTable.yueZhu.tianGan}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.riZhu.tianGan)}`}>
                  {baziData.mainTable.riZhu.tianGan}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getTianGanColor(baziData.mainTable.shiZhu.tianGan)}`}>
                  {baziData.mainTable.shiZhu.tianGan}
                </span>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">地支</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.liuNian.diZhi)}`}>
                  {baziData.mainTable.liuNian.diZhi}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.daYun.diZhi)}`}>
                  {baziData.mainTable.daYun.diZhi}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.nianZhu.diZhi)}`}>
                  {baziData.mainTable.nianZhu.diZhi}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.yueZhu.diZhi)}`}>
                  {baziData.mainTable.yueZhu.diZhi}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.riZhu.diZhi)}`}>
                  {baziData.mainTable.riZhu.diZhi}
                </span>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <span className={`text-lg font-bold ${getDiZhiColor(baziData.mainTable.shiZhu.diZhi)}`}>
                  {baziData.mainTable.shiZhu.diZhi}
                </span>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">藏干</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.liuNian.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-yellow-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.daYun.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-yellow-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.nianZhu.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-yellow-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.yueZhu.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-yellow-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.riZhu.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-green-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">
                <div className="space-y-1">
                  {baziData.mainTable.shiZhu.cangGan.map((item, index) => (
                    <div key={index} className="text-xs text-yellow-600 font-medium">{item}</div>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">星运</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.liuNian.xingYun}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.daYun.xingYun}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.nianZhu.xingYun}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.yueZhu.xingYun}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.riZhu.xingYun}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.shiZhu.xingYun}</td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">自坐</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.liuNian.ziZuo}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.daYun.ziZuo}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.nianZhu.ziZuo}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.yueZhu.ziZuo}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.riZhu.ziZuo}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.shiZhu.ziZuo}</td>
            </tr>
            <tr>
              <td className="border-2 border-gray-400 px-3 py-2 font-bold">纳音</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.liuNian.naYin}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.daYun.naYin}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.nianZhu.naYin}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.yueZhu.naYin}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.riZhu.naYin}</td>
              <td className="border-2 border-gray-400 px-3 py-2 text-center">{baziData.mainTable.shiZhu.naYin}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 喜用忌 */}
      <div className="mb-6 text-center">
        <div className="inline-flex space-x-4 text-sm">
          <span>喜: <span className="text-yellow-600 font-medium">{baziData.xiYongJi.xi}</span></span>
          <span>用: <span className="text-yellow-600 font-medium">{baziData.xiYongJi.yong}</span></span>
          <span>忌: <span className="text-red-600 font-medium">{baziData.xiYongJi.ji}</span></span>
        </div>
      </div>

      {/* 大运表格 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">大运</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-400 text-sm font-medium">
            <tbody>
              <tr>
                <td className="border-2 border-gray-400 px-3 py-2 bg-gray-100 font-bold">年龄</td>
                {baziData.daYun.map((item, index) => (
                  <td key={index} className="border-2 border-gray-400 px-3 py-2 text-center">
                    {item.age}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-400 px-3 py-2 bg-gray-100 font-bold">干支</td>
                {baziData.daYun.map((item, index) => (
                  <td key={index} className="border-2 border-gray-400 px-3 py-2 text-center">
                    <span className={`text-lg font-bold ${getTianGanColor(item.ganZhi[0])}`}>
                      {item.ganZhi[0]}
                    </span>
                    <span className={`text-lg font-bold ${getDiZhiColor(item.ganZhi[1])}`}>
                      {item.ganZhi[1]}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 流年表格 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">流年（{new Date().getFullYear()}年起）</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-gray-400 text-sm font-medium">
            <tbody>
              <tr>
                <td className="border-2 border-gray-400 px-3 py-2 bg-gray-100 font-bold">年份</td>
                {baziData.liuNian.map((item, index) => (
                  <td key={index} className="border-2 border-gray-400 px-3 py-2 text-center">
                    {item.year}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-400 px-3 py-2 bg-gray-100 font-bold">干支</td>
                {baziData.liuNian.map((item, index) => (
                  <td key={index} className="border-2 border-gray-400 px-3 py-2 text-center">
                    <span className={`text-lg font-bold ${getTianGanColor(item.ganZhi[0])}`}>
                      {item.ganZhi[0]}
                    </span>
                    <span className={`text-lg font-bold ${getDiZhiColor(item.ganZhi[1])}`}>
                      {item.ganZhi[1]}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 备注 */}
      {baziData.notes.tianGan && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>天干留意: {baziData.notes.tianGan}</div>
          <div>地支留意: {baziData.notes.diZhi}</div>
        </div>
      )}
    </div>
  );
}
