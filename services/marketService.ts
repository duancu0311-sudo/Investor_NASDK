import { StockData, MasterWisdom, OptionScenario } from '../types';

// ==========================================
// 配置区域
// ==========================================
const API_KEY = "d4qd17hr01quli1brha0d4qd17hr01quli1brhag";

// 美股关注列表
const WATCHLIST_US = [
  { symbol: "NVDA", name: "英伟达", sector: "科技", fair_value: 720.00 },
  { symbol: "MSFT", name: "微软", sector: "科技", fair_value: 410.00 },
  { symbol: "AAPL", name: "苹果", sector: "科技", fair_value: 190.00 },
  { symbol: "TSLA", name: "特斯拉", sector: "消费", fair_value: 110.00 },
  { symbol: "AMD", name: "超威", sector: "科技", fair_value: 150.00 },
  { symbol: "GOOGL", name: "谷歌", sector: "通信", fair_value: 200.00 },
  { symbol: "META", name: "Meta", sector: "通信", fair_value: 450.00 },
  { symbol: "AMZN", name: "亚马逊", sector: "消费", fair_value: 180.00 },
];

// A股关注列表 (模拟数据源)
const WATCHLIST_CN = [
  { symbol: "600519", name: "贵州茅台", sector: "消费", fair_value: 1500.00 },
  { symbol: "600036", name: "招商银行", sector: "金融", fair_value: 38.00 },
  { symbol: "601318", name: "中国平安", sector: "金融", fair_value: 55.00 },
  { symbol: "300750", name: "宁德时代", sector: "工业", fair_value: 180.00 },
  { symbol: "000858", name: "五粮液", sector: "消费", fair_value: 140.00 },
  { symbol: "601888", name: "中国中免", sector: "消费", fair_value: 85.00 },
  { symbol: "600276", name: "恒瑞医药", sector: "医疗", fair_value: 45.00 },
  { symbol: "002594", name: "比亚迪", sector: "消费", fair_value: 260.00 },
];

const enrichData = (baseData: any, fairValue: number, region: 'US' | 'CN'): StockData => {
  const currentPrice = baseData.current_price;
  const margin = ((fairValue - currentPrice) / fairValue) * 100;
  
  // 模拟 RSI：如果价格很低（安全边际高），倾向于让 RSI 较低（超卖），模拟真实捕捉机会
  const baseRsi = margin > 20 ? 25 + Math.random() * 15 : 45 + Math.random() * 30;
  
  return {
    ...baseData,
    region,
    fair_value: fairValue,
    margin_of_safety: margin,
    // 模拟护城河数据 (大部分设为优质，部分设为垃圾以作对比)
    roic: Math.random() > 0.3 ? 15 + Math.random() * 10 : 5 + Math.random() * 8, // 目标 > 15
    debt_to_ebitda: Math.random() > 0.3 ? 1 + Math.random() * 1.5 : 3.5 + Math.random() * 2, // 目标 < 3
    rsi: baseRsi,
    volume_status: Math.random() > 0.7 ? 'High' : 'Normal',
  };
};

export const calculateMetricsMock = (region: 'US' | 'CN' = 'US'): StockData[] => {
  const list = region === 'US' ? WATCHLIST_US : WATCHLIST_CN;
  
  return list.map(s => {
    // 模拟当前价格
    // 对于A股，如果没有实时API，我们生成一个围绕公允价值波动的价格
    const noise = (Math.random() * 2.5) - 1.25; // -1.25% to +1.25% noise
    // 为了演示效果，随机让一些股票被低估，一些被高估
    const valuationBias = Math.random() > 0.5 ? 0.8 : 1.1; 
    const currentPrice = s.fair_value * valuationBias * (1 + noise / 100);

    return enrichData({ 
        symbol: s.symbol, 
        name: s.name, 
        sector: s.sector,
        price: currentPrice, 
        current_price: currentPrice 
    }, s.fair_value, region);
  });
};

export const fetchRealMarketData = async (region: 'US' | 'CN'): Promise<StockData[]> => {
  // A股目前没有免费且无需后缀的稳定API，统一使用Mock算法以保证演示流畅
  if (region === 'CN') {
    return new Promise(resolve => {
        setTimeout(() => resolve(calculateMetricsMock('CN')), 600);
    });
  }

  // 美股逻辑
  if (!API_KEY) {
    return calculateMetricsMock('US');
  }

  try {
    const promises = WATCHLIST_US.map(async (stock) => {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        const currentPrice = data.c;
        if (!currentPrice || currentPrice === 0) return null;

        return enrichData({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: data.pc, 
          current_price: currentPrice,
        }, stock.fair_value, 'US');
      } catch (err) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter((item): item is StockData => item !== null);
    
    if (validResults.length === 0) return calculateMetricsMock('US');
    return validResults;

  } catch (error) {
    return calculateMetricsMock('US');
  }
};

// ==========================================
// 核心策略逻辑：深渊狩猎者 (The Deep Value Hunter)
// ==========================================
export const getMasterWisdom = (stock: StockData): MasterWisdom => {
  const margin = stock.margin_of_safety;
  const isMoatSolid = stock.roic >= 15 && stock.debt_to_ebitda <= 3;
  const stinkBid = stock.current_price * 0.95;

  let wisdom: MasterWisdom = {
    sentiment: "中性",
    quote: "",
    analysis: "",
    strategy: "观望",
    strategyColor: "text-slate-600 bg-slate-50 border-slate-200",
    execution: { stage: 'Wait', allocation: "0%", desc: "不在击球区。" },
    stink_bid_price: stinkBid
  };

  if (!isMoatSolid) {
    return {
      ...wisdom,
      sentiment: "基本面不达标",
      quote: "只买便宜的垃圾是'烟蒂投资'，我们要买的是'受难的皇冠'。",
      analysis: `护城河破损：ROIC (${stock.roic.toFixed(1)}%) 过低或债务 (${stock.debt_to_ebitda.toFixed(1)}) 过高。即使便宜也不要碰。`,
      strategy: "回避 (Avoid)",
      strategyColor: "text-slate-500 bg-slate-100 border-slate-200",
      execution: { stage: 'Wait', allocation: "0%", desc: "基本面质量未通过筛选。" }
    };
  }
  
  if (margin >= 50) {
    wisdom = {
      sentiment: "上帝的礼物 (Gift)",
      quote: "别人恐惧时我贪婪。市场先生正在以 50 美分的价格出售 1 美元的资产。",
      analysis: "深渊区：价格已被恐慌击穿。这是防御型投资者梦寐以求的时刻。",
      strategy: "强力买入 (Aggressive)",
      strategyColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      execution: { stage: 'Main', allocation: "50% (扫尾队)", desc: "安全边际极厚，确认企稳后打入剩余子弹。" },
      stink_bid_price: stinkBid
    };
  } else if (margin >= 30) {
    if (stock.rsi < 30) {
      wisdom = {
        sentiment: "猎物进场 (Sniper)",
        quote: "不要接飞刀。等待 1 小时 K 线企稳，RSI 超卖是第一信号。",
        analysis: "进入击球区：价格低于 0.7倍 内在价值。RSI 显示极度超卖。",
        strategy: "分批建仓 (Scale-In)",
        strategyColor: "text-blue-700 bg-blue-50 border-blue-200",
        execution: { stage: 'Scout', allocation: "20% (侦察兵)", desc: "RSI < 30，价格进入击球区。派出侦察兵建仓。" },
        stink_bid_price: stinkBid
      };
    } else {
      wisdom = {
        sentiment: "观察区 (Watch)",
        quote: "耐心是美德。猎物已进入视野，但还未到最佳射击位置。",
        analysis: "虽然有 30% 安全边际，但技术指标尚未极度超卖。",
        strategy: "准备 (Ready)",
        strategyColor: "text-blue-600 bg-white border-blue-200",
        execution: { stage: 'Wait', allocation: "挂 Limit Buy", desc: `在 $${stinkBid.toFixed(2)} 处挂臭单。` },
        stink_bid_price: stinkBid
      };
    }
  } else if (margin < -20) {
    wisdom = {
      sentiment: "非理性繁荣 (Bubble)",
      quote: "这就好比在去地狱的路上，还要坚持数钱。这是纯粹的投机。",
      analysis: "价格超过价值 120%。支撑价格的唯一理由是'博傻理论'。",
      strategy: "清仓离场 (Clear Out)",
      strategyColor: "text-rose-700 bg-rose-50 border-rose-200",
      execution: { stage: 'Exit', allocation: "卖出 100%", desc: "寻找下一个猎物。" },
      stink_bid_price: 0
    };
  } else if (margin < 5) {
    wisdom = {
      sentiment: "风险积聚 (Risky)",
      quote: "你支付的是价格，得到的是价值。现在价格已接近价值。",
      analysis: "价格回归内在价值。安全垫已经消失。",
      strategy: "分批卖出 (Trim)",
      strategyColor: "text-amber-700 bg-amber-50 border-amber-200",
      execution: { stage: 'Exit', allocation: "卖出", desc: "不再买入，开始兑现利润。" },
      stink_bid_price: 0
    };
  } else {
    wisdom = {
      sentiment: "中庸 (Average)",
      quote: "无聊是美德。如果没有显而易见的便宜，就什么都不要做。",
      analysis: "价格合理，但没有显著的安全边际 (少于 30%)。",
      strategy: "持有/观望 (Hold)",
      strategyColor: "text-slate-600 bg-slate-50 border-slate-200",
      execution: { stage: 'Wait', allocation: "0%", desc: "等待更好价格。" },
      stink_bid_price: stinkBid
    };
  }

  return wisdom;
};

// ==========================================
// 末日期权推演算法 (Simulation)
// ==========================================
export const calculateOptionScenario = (stock: StockData): OptionScenario => {
  // 模拟波动率计算 (Price vs Value deviation + RSI extreme)
  // 如果价格极低(margin high)且RSI极低，意味着可能有剧烈反弹 -> IV 高，偏Bullish
  const isOversold = stock.rsi < 35;
  const isOverbought = stock.rsi > 70;
  
  let prediction: OptionScenario['prediction_trend'] = 'Neutral';
  let strategyName = 'Iron Condor (铁鹰)';
  let strategyDesc = '预计价格横盘震荡，赚取时间价值。';
  let pcr = 0.9;
  
  // 基础波动率 (15% - 60%)
  const iv = 15 + Math.random() * 45; 

  if (isOversold) {
    prediction = 'Bullish';
    strategyName = 'Bull Call Spread (牛市看涨)';
    strategyDesc = '极度超卖，预计 5 日内有技术性反弹。买入近月实值 Call，卖出虚值 Call。';
    pcr = 0.6; // 看涨多
  } else if (isOverbought) {
    prediction = 'Bearish';
    strategyName = 'Bear Put Spread (熊市看跌)';
    strategyDesc = '动能耗尽，预计 5 日内回调。买入近月实值 Put，卖出虚值 Put。';
    pcr = 1.4; // 看跌多
  } else if (iv > 40) {
    prediction = 'Volatile';
    strategyName = 'Long Straddle (跨式突破)';
    strategyDesc = 'IV 极高，变盘在即。不论方向，只要有大波动即可获利。';
    pcr = 1.0;
  }

  // 蒙特卡洛模拟简化版：计算 5 日后的 1个标准差范围
  // Price * IV * sqrt(5/365)
  const days = 5;
  const volMove = stock.current_price * (iv / 100) * Math.sqrt(days / 365);
  
  return {
    iv: iv,
    put_call_ratio: pcr,
    prediction_trend: prediction,
    target_price_high: stock.current_price + volMove,
    target_price_low: stock.current_price - volMove,
    probability: 68.2, // 1 SD probability
    recommended_strategy: {
      name: strategyName,
      desc: strategyDesc,
      risk_level: iv > 50 ? 'Extreme' : 'High'
    }
  };
};