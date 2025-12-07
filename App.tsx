import React, { useState, useEffect } from 'react';
import { StockData } from './types';
import { fetchRealMarketData } from './services/marketService';
import { MarketThermometer } from './components/MarketThermometer';
import { GrahamPrinciples } from './components/GrahamPrinciples';
import { StockList } from './components/StockList';
import { StockDetailPanel } from './components/StockDetailPanel';
import { Icons } from './components/Icons';

const App: React.FC = () => {
  const [region, setRegion] = useState<'US' | 'CN'>('US');
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 数据加载函数
  const loadData = async (currentRegion: 'US' | 'CN') => {
    // 切换区域时，先清空或显示loading态，体验更好
    setLoading(true);
    const metrics = await fetchRealMarketData(currentRegion);
    setData(metrics);
    setLoading(false);
    setLastUpdated(new Date());
  };

  // 监听区域变化
  useEffect(() => {
    loadData(region);
  }, [region]);

  useEffect(() => {
    // 实时更新轮询
    const interval = setInterval(() => {
      // 默默更新，不设置全局 loading
      fetchRealMarketData(region).then(metrics => {
        setData(metrics);
        setLastUpdated(new Date());
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [region]);

  const opportunities = data
    .filter(s => s.margin_of_safety > 0)
    .sort((a, b) => b.margin_of_safety - a.margin_of_safety);

  const risks = data
    .filter(s => s.margin_of_safety < 0)
    .sort((a, b) => a.margin_of_safety - b.margin_of_safety);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 lg:p-8 relative overflow-hidden font-sans">
      
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
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Region Switcher */}
          <div className="flex p-1 bg-slate-200 rounded-lg">
            <button 
                onClick={() => setRegion('US')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${region === 'US' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Icons.Globe size={14} /> 美股深渊
            </button>
            <button 
                onClick={() => setRegion('CN')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${region === 'CN' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Icons.TrendingUp size={14} /> A股核心
            </button>
          </div>

          <div className="text-right pl-4 border-l border-slate-200 hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">数据状态</div>
            <div className="flex items-center justify-end gap-2 text-xs text-emerald-600 font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-140px)]">
        
        {/* Left Column: Stats & Info */}
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
          {loading && data.length === 0 ? (
             <div className="h-40 rounded-xl bg-slate-200 animate-pulse"></div>
          ) : (
             <MarketThermometer data={data} />
          )}
          
          <GrahamPrinciples />
          
          <div className="mt-auto hidden lg:block p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-400 mb-2 font-mono uppercase font-bold">系统仪表盘</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">当前市场:</span>
                <span className={`font-bold ${region === 'US' ? 'text-blue-600' : 'text-rose-600'}`}>
                    {region === 'US' ? 'US Stocks' : 'China A-Shares'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600">上次更新:</span>
                <span className="text-slate-800">{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {loading && data.length === 0 ? (
          <div className="lg:col-span-9 flex items-center justify-center text-slate-400 gap-2">
             <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
             正在加载{region === 'US' ? '美股' : 'A股'}数据...
          </div>
        ) : (
          <>
            {/* Middle Column: Opportunities */}
            <section className="lg:col-span-5 flex flex-col h-[500px] lg:h-full">
              <StockList 
                title={region === 'US' ? "深渊狩猎 (安全边际)" : "低估核心资产"} 
                data={opportunities} 
                type="opportunity" 
                onSelect={setSelectedStock} 
              />
            </section>

            {/* Right Column: Risks */}
            <section className="lg:col-span-4 flex flex-col h-[500px] lg:h-full">
              <StockList 
                title="高估预警 (风险)" 
                data={risks} 
                type="risk" 
                onSelect={setSelectedStock} 
              />
            </section>
          </>
        )}

      </main>
    </div>
  );
};

export default App;