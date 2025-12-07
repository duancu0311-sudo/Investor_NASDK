
import React, { useState, useEffect } from 'react';
import { StockData } from './types';
import { fetchRealMarketData } from './services/marketService';
import { MarketThermometer } from './components/MarketThermometer';
import { GrahamPrinciples } from './components/GrahamPrinciples';
import { StockList } from './components/StockList';
import { StockDetailPanel } from './components/StockDetailPanel';
import { Icons } from './components/Icons';

const App: React.FC = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // 数据加载函数
    const loadData = async () => {
      const metrics = await fetchRealMarketData();
      setData(metrics);
      setLoading(false);
      setLastUpdated(new Date());
    };

    // 初始加载
    loadData();

    // 实时更新 
    // Finnhub 免费版限制为 60 calls/minute。
    // 我们有 8 个股票，如果每次都请求，间隔设置为 20秒 是安全的 (8 * 3 = 24 calls/minute)
    const interval = setInterval(() => {
      loadData();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const opportunities = data
    .filter(s => s.margin_of_safety > 0)
    .sort((a, b) => b.margin_of_safety - a.margin_of_safety);

  const risks = data
    .filter(s => s.margin_of_safety < 0)
    .sort((a, b) => a.margin_of_safety - b.margin_of_safety);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-blue-600 font-mono">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Icons.Lock size={32} />
          <span className="text-slate-500 font-medium tracking-wider">正在连接市场数据流...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 lg:p-8 relative overflow-hidden">
      
      {/* Detail Panel Overlay */}
      {selectedStock && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setSelectedStock(null)}
        />
      )}
      
      <StockDetailPanel 
        stock={selectedStock} 
        onClose={() => setSelectedStock(null)} 
      />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
            <Icons.Terminal size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              INTELLIGENT INVESTOR <span className="text-blue-600">PRO</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
              价值发现与风险分析系统
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex px-4 py-2 rounded-full bg-white border border-slate-300 items-center gap-2 text-xs text-slate-500 shadow-sm">
            <Icons.Search size={14} />
            <span>搜索代码...</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">数据状态</div>
            <div className="flex items-center justify-end gap-2 text-xs text-emerald-600 font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              REALTIME
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-140px)]">
        
        {/* Left Column: Stats & Info */}
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
          <MarketThermometer data={data} />
          <GrahamPrinciples />
          <div className="mt-auto hidden lg:block p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-400 mb-2 font-mono uppercase font-bold">系统仪表盘</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">API 连接:</span>
                <span className="text-emerald-600">活跃 (Finnhub)</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">上次更新:</span>
                <span className="text-slate-800">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">监控数量:</span>
                <span className="text-slate-800">{data.length} 支股票</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Middle Column: Opportunities */}
        <section className="lg:col-span-5 flex flex-col h-[500px] lg:h-full">
          <StockList 
            title="安全边际 (价值)" 
            data={opportunities} 
            type="opportunity" 
            onSelect={setSelectedStock} 
          />
        </section>

        {/* Right Column: Risks */}
        <section className="lg:col-span-4 flex flex-col h-[500px] lg:h-full">
          <StockList 
            title="高估风险 (回避)" 
            data={risks} 
            type="risk" 
            onSelect={setSelectedStock} 
          />
        </section>

      </main>
    </div>
  );
};

export default App;
