
import { StockData, MasterWisdom } from '../types';

// ==========================================
// 配置区域
// ==========================================
// 使用用户提供的 Finnhub API Key
const API_KEY = "d4qd17hr01quli1brha0d4qd17hr01quli1brhag";

// 免费版 API 限制较多，减少关注列表以防超限
// 注意：fair_value (内在价值) 是估值模型的产出，通常是静态计算的，而 price (价格) 是实时获取的
const WATCHLIST = [
  { symbol: "NVDA", name: "英伟达", sector: "科技", fair_value: 720.00 },
  { symbol: "MSFT", name: "微软", sector: "科技", fair_value: 410.00 },
  { symbol: "AAPL", name: "苹果", sector: "科技", fair_value: 190.00 },
  { symbol: "TSLA", name: "特斯拉", sector: "消费", fair_value: 110.00 },
  { symbol: "AMD", name: "超威", sector: "科技", fair_value: 150.00 },
  { symbol: "GOOGL", name: "谷歌", sector: "通信", fair_value: 200.00 },
  { symbol: "META", name: "Meta", sector: "通信", fair_value: 450.00 },
  { symbol: "AMZN", name: "亚马逊", sector: "消费", fair_value: 180.00 },
];

// 后备模拟数据（仅当 API 请求失败时使用）
const MOCK_DATA_SOURCE = [
  { symbol: "NVDA", name: "英伟达", sector: "科技", price: 880.50, fair_value: 720.00 },
  { symbol: "MSFT", name: "微软", sector: "科技", price: 420.15, fair_value: 410.00 },
  { symbol: "AAPL", name: "苹果", sector: "科技", price: 175.30, fair_value: 190.00 },
  { symbol: "TSLA", name: "特斯拉", sector: "消费", price: 170.50, fair_value: 110.00 },
];

// 模拟计算函数
export const calculateMetricsMock = (): StockData[] => {
  return MOCK_DATA_SOURCE.map(stock => {
    const noise = (Math.random() * 2.0) - 1.0; 
    const currentPrice = stock.price * (1 + noise / 100);
    const marginOfSafety = ((stock.fair_value - currentPrice) / stock.fair_value) * 100;
    return {
      ...stock,
      current_price: currentPrice,
      margin_of_safety: marginOfSafety,
    };
  });
};

// 真实数据抓取函数
export const fetchRealMarketData = async (): Promise<StockData[]> => {
  if (!API_KEY) {
    console.warn("未配置 API Key，正在使用模拟数据...");
    return calculateMetricsMock();
  }

  try {
    // 使用 Promise.all 并行请求所有股票数据
    const promises = WATCHLIST.map(async (stock) => {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
        
        if (!response.ok) {
           // 如果特定股票请求失败，不要中断整个流程，返回 null
           console.warn(`Failed to fetch ${stock.symbol}`);
           return null;
        }
        
        const data = await response.json();
        const currentPrice = data.c; // 'c' 是 Finnhub 返回的当前价格

        // 验证价格有效性
        if (!currentPrice || currentPrice === 0) return null;

        const marginOfSafety = ((stock.fair_value - currentPrice) / stock.fair_value) * 100;

        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: data.pc || currentPrice, // pc = 昨日收盘价
          fair_value: stock.fair_value,
          current_price: currentPrice,
          margin_of_safety: marginOfSafety
        } as StockData;
      } catch (err) {
        console.error(`Error fetching ${stock.symbol}:`, err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    
    // 过滤掉失败的请求 (null)
    const validResults = results.filter((item): item is StockData => item !== null);

    // 如果所有请求都失败了（比如 API Key 无效或网络断开），回退到模拟数据
    if (validResults.length === 0) {
        return calculateMetricsMock();
    }

    return validResults;

  } catch (error) {
    console.error("Critical error in data fetching:", error);
    return calculateMetricsMock();
  }
};

export const getMasterWisdom = (margin: number): MasterWisdom => {
  if (margin >= 20) {
    return {
      sentiment: "深度价值 (机遇)",
      quote: "别人恐惧时我贪婪。市场先生正在以 50 美分的价格出售 1 美元的资产。",
      analysis: "当前价格显著低于内在价值，提供了巨大的安全边际。即使我们的估值模型出现偏差，这笔投资亏损的概率依然极低。这正是防御型投资者梦寐以求的标的。",
      strategy: "大力买入",
      strategyColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      checklist: { earnings: true, debt: true, dividend: true, cheap: true }
    };
  } else if (margin > 0) {
    return {
      sentiment: "理性均衡 (合理)",
      quote: "以合理的价格买入一家优秀的公司，远胜过以便宜的价格买入一家平庸的公司。",
      analysis: "公司处于合理估值区间。虽然安全边际不如深度价值股那么厚实，但考虑到其行业地位和护城河，这是一个可以通过时间换取空间的投资。",
      strategy: "逐步建仓",
      strategyColor: "text-blue-700 bg-blue-50 border-blue-200",
      checklist: { earnings: true, debt: true, dividend: true, cheap: false }
    };
  } else if (margin > -20) {
    return {
      sentiment: "投机风险 (谨慎)",
      quote: "你支付的是价格，得到的是价值。现在你支付的稍微多了一些。",
      analysis: "市场对该公司的未来增长已经计入了过于完美的预期。如果未来业绩稍有不达标，股价将面临戴维斯双杀的风险。此时不仅没有安全边际，反而存在负的安全边际。",
      strategy: "持有 / 减仓",
      strategyColor: "text-amber-700 bg-amber-50 border-amber-200",
      checklist: { earnings: true, debt: true, dividend: false, cheap: false }
    };
  } else {
    return {
      sentiment: "泡沫化 (危险)",
      quote: "短期来看市场是投票机，长期来看市场是称重机。",
      analysis: "股价已经完全脱离了基本面引力。支撑当前价格的唯一理由是'博傻理论'——相信会有更傻的人以更高的价格接盘。作为价值投资者，应当远离这种狂热。",
      strategy: "卖出 / 回避",
      strategyColor: "text-rose-700 bg-rose-50 border-rose-200",
      checklist: { earnings: false, debt: false, dividend: false, cheap: false }
    };
  }
};
