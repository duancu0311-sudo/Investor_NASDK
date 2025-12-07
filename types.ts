export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  region: 'US' | 'CN'; // 新增：区分美股和A股
  price: number;       // Base reference price
  fair_value: number;  // Calculated Intrinsic Value (V)
  current_price: number; 
  margin_of_safety: number; // Percentage
  
  // 护城河指标 (The Moat)
  roic: number;          // Return on Invested Capital > 15%
  debt_to_ebitda: number; // < 3
  
  // 狙击手指标 (Daily Execution)
  rsi: number;           // 14-day RSI
  volume_status: 'Low' | 'Normal' | 'High';
}

export interface MasterWisdom {
  sentiment: string;     // e.g. "深渊狩猎 (Gift)"
  quote: string;
  analysis: string;
  strategy: string;      // e.g. "重仓出击 (Aggressive)"
  strategyColor: string;
  
  // 倒金字塔建仓建议
  execution: {
    stage: 'Wait' | 'Scout' | 'Main' | 'Tail' | 'Exit'; 
    allocation: string;  // "0%", "20%", "30%", "50%"
    desc: string;
  };

  // 挂单建议
  stink_bid_price: number; 
}

// 新增：末日期权分析数据结构
export interface OptionScenario {
  iv: number; // 隐含波动率
  put_call_ratio: number;
  prediction_trend: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  target_price_high: number; // 5日看涨目标
  target_price_low: number;  // 5日看跌目标
  probability: number;       // 到达目标的概率
  recommended_strategy: {
    name: string;   // e.g. "Long Straddle"
    desc: string;
    risk_level: 'High' | 'Extreme';
  };
}

export enum StockListType {
  OPPORTUNITY = 'opportunity',
  RISK = 'risk',
}