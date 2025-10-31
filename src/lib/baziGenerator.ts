import { Lunar } from 'lunar-typescript';
import { BaziFormData } from '@/components/BaziForm';

export interface MainTableData {
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
}

/**
 * 生成八字主表格数据
 */
export function generateBaziMainTable(formData: BaziFormData): MainTableData {
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
    const getShiShen = (gan: string) => {
      const riGan = d.getDayGan(); // 日干
      
      const tianGanList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const shiShenOrders = [
        ['劫财', '比肩', '伤官', '食神', '偏财', '正财', '七杀', '正官', '偏印', '正印'], // 甲日
        ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'], // 乙日
        ['劫财', '比肩', '伤官', '食神', '偏财', '正财', '七杀', '正官', '偏印', '正印'], // 丙日
        ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'], // 丁日
        ['劫财', '比肩', '伤官', '食神', '偏财', '正财', '七杀', '正官', '偏印', '正印'], // 戊日
        ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'], // 己日
        ['劫财', '比肩', '伤官', '食神', '偏财', '正财', '七杀', '正官', '偏印', '正印'], // 庚日
        ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'], // 辛日
        ['劫财', '比肩', '伤官', '食神', '偏财', '正财', '七杀', '正官', '偏印', '正印'], // 壬日
        ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印']  // 癸日
      ];

      const riGanIndex = tianGanList.indexOf(riGan);
      const ganIndex = tianGanList.indexOf(gan);
      
      if (riGanIndex === -1 || ganIndex === -1) {
        return gan;
      }

      const shiShenOrder = shiShenOrders[riGanIndex] || shiShenOrders[0];
      const diff = (ganIndex - riGanIndex + 10) % 10;
      
      return shiShenOrder[diff] || gan;
    };

    // 生成主表格数据
    const mainTable = {
      liuNian: {
        shiShen: currentLiuNian ? getShiShen(currentLiuNian.getGanZhi().substring(0, 1)) : '偏印',
        tianGan: currentLiuNian?.getGanZhi()?.substring(0, 1) || '乙',
        diZhi: currentLiuNian?.getGanZhi()?.substring(1, 2) || '巳',
        cangGan: currentLiuNian ? getCangGan(currentLiuNian.getGanZhi().substring(1, 2)).map(gan => `${gan}${getShiShen(gan)}`) : ['丙劫财', '庚正财', '戊伤官'],
        xingYun: '帝旺',
        ziZuo: '沐浴',
        naYin: '覆灯火'
      },
      daYun: {
        shiShen: daYunArr[currentDaYunIndex] ? getShiShen(daYunArr[currentDaYunIndex].getGanZhi().substring(0, 1)) : '食神',
        tianGan: daYunArr[currentDaYunIndex]?.getGanZhi()?.substring(0, 1) || '己',
        diZhi: daYunArr[currentDaYunIndex]?.getGanZhi()?.substring(1, 2) || '酉',
        cangGan: daYunArr[currentDaYunIndex] ? getCangGan(daYunArr[currentDaYunIndex].getGanZhi().substring(1, 2)).map(gan => `${gan}${getShiShen(gan)}`) : ['辛偏财'],
        xingYun: '长生',
        ziZuo: '长生',
        naYin: '大驿土'
      },
      nianZhu: {
        shiShen: d.getYearShiShenGan() || '正官',
        tianGan: d.getYearGan() || '壬',
        diZhi: d.getYearZhi() || '午',
        cangGan: getCangGan(d.getYearZhi()).map(gan => `${gan}${getShiShen(gan)}`),
        xingYun: '临官',
        ziZuo: '胎',
        naYin: d.getYearNaYin() || '杨柳木'
      },
      yueZhu: {
        shiShen: d.getMonthShiShenGan() || '劫财',
        tianGan: d.getMonthGan() || '戊',
        diZhi: d.getMonthZhi() || '戌',
        cangGan: getCangGan(d.getMonthZhi()).map(gan => `${gan}${getShiShen(gan)}`),
        xingYun: '衰',
        ziZuo: '墓',
        naYin: d.getMonthNaYin() || '平地木'
      },
      riZhu: {
        shiShen: '日干',
        tianGan: d.getDayGan() || '丙',
        diZhi: d.getDayZhi() || '申',
        cangGan: getCangGan(d.getDayZhi()).map(gan => `${gan}${getShiShen(gan)}`),
        xingYun: '病',
        ziZuo: '沐浴',
        naYin: d.getDayNaYin() || '山下火'
      },
      shiZhu: {
        shiShen: d.getTimeShiShenGan() || '偏印',
        tianGan: d.getTimeGan() || '壬',
        diZhi: d.getTimeZhi() || '寅',
        cangGan: getCangGan(d.getTimeZhi()).map(gan => `${gan}${getShiShen(gan)}`),
        xingYun: '临官',
        ziZuo: '长生',
        naYin: d.getTimeNaYin() || '金箔金'
      }
    };

    return mainTable;
  } catch (error) {
    console.error('生成八字数据失败:', error);
    // 返回默认数据
    return {
      liuNian: {
        shiShen: '偏印',
        tianGan: '乙',
        diZhi: '巳',
        cangGan: ['丙劫财', '庚正财', '戊伤官'],
        xingYun: '帝旺',
        ziZuo: '沐浴',
        naYin: '覆灯火'
      },
      daYun: {
        shiShen: '食神',
        tianGan: '己',
        diZhi: '酉',
        cangGan: ['辛偏财'],
        xingYun: '长生',
        ziZuo: '长生',
        naYin: '大驿土'
      },
      nianZhu: {
        shiShen: '正官',
        tianGan: '壬',
        diZhi: '午',
        cangGan: ['丁劫财', '己劫财'],
        xingYun: '临官',
        ziZuo: '胎',
        naYin: '杨柳木'
      },
      yueZhu: {
        shiShen: '劫财',
        tianGan: '戊',
        diZhi: '戌',
        cangGan: ['戊劫财', '辛偏财', '丁劫财'],
        xingYun: '衰',
        ziZuo: '墓',
        naYin: '平地木'
      },
      riZhu: {
        shiShen: '日干',
        tianGan: '丙',
        diZhi: '申',
        cangGan: ['庚正财', '壬七杀', '戊伤官'],
        xingYun: '病',
        ziZuo: '沐浴',
        naYin: '山下火'
      },
      shiZhu: {
        shiShen: '偏印',
        tianGan: '壬',
        diZhi: '寅',
        cangGan: ['甲劫财', '丙劫财', '戊伤官'],
        xingYun: '临官',
        ziZuo: '长生',
        naYin: '金箔金'
      }
    };
  }
}

