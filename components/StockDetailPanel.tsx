import React, { useEffect, useState } from 'react';
import { StockData } from '../types';
import { getMasterWisdom } from '../services/marketService';
import { Icons } from './Icons';

interface StockDetailPanelProps {
  stock: StockData | null;
  onClose: () => void;
}

export const StockDetailPanel: React.FC<StockDetailPanelProps> = ({ stock, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (stock) {
        // Small delay to allow render before sliding in
        requestAnimationFrame(() => setAnimateIn(true));
    } else {
        setAnimateIn(false);
    }
  }, [stock]);

  if (!stock) return null;

  const wisdom = getMasterWisdom(stock.margin_of_safety);
  const isSafe = stock.margin_of_safety > 0;
  
  // Slide-in class logic
  const translateClass = animateIn ? 'translate-x-0' : 'translate-x-full';

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-slate-200 overflow-y-auto ${translateClass}`}>
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-start z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{stock.symbol}</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase tracking-wider">
                {stock.sector}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">{stock.name}</p>
        </div>
        <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <Icons.X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-8 pb-12">
        {/* Main Price Card */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-inner">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">市场价格</div>
              <div className="text-3xl font-bold text-slate-800 font-mono tracking-tighter">
                ${stock.current_price.toFixed(2)}
              </div>
            </div>
            <div className="h-12 w-[1px] bg-slate-200"></div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">内在价值</div>
              <div className="text-3xl font-bold text-blue-600 font-mono tracking-tighter">
                ${stock.fair_value.toFixed(0)}
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Custom Progress/Gauge */}
            <div className="h-5 bg-white rounded-full overflow-hidden flex shadow-sm border border-slate-100">
              <div className="w-1/2 flex justify-end pr-0.5 border-r border-slate-100">
                {!isSafe && (
                    <div 
                        className="h-full bg-rose-500 rounded-l-full opacity-90" 
                        style={{ width: `${Math.min(Math.abs(stock.margin_of_safety), 100)}%` }} 
                    />
                )}
              </div>
              <div className="w-1/2 pl-0.5">
                {isSafe && (
                    <div 
                        className="h-full bg-emerald-500 rounded-r-full opacity-90" 
                        style={{ width: `${Math.min(stock.margin_of_safety, 100)}%` }} 
                    />
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-wider">
              <span className={!isSafe ? "text-rose-600" : "text-slate-300"}>溢价 (高估)</span>
              <span className={isSafe ? "text-emerald-600" : "text-slate-300"}>折价 (低估)</span>
            </div>
            
            <div className="text-center mt-6 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-400 uppercase mr-2">安全边际</span>
                <span className={`text-xl font-bold font-mono ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isSafe ? '+' : ''}{stock.margin_of_safety.toFixed(2)}%
                </span>
            </div>
          </div>
        </div>

        {/* Master's Wisdom Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-2">
            <Icons.Brain size={20} className="text-purple-600" />
            <h3 className="text-base font-bold uppercase tracking-wider">大师思考</h3>
          </div>
          <div className="relative pl-6 border-l-4 border-purple-100 space-y-4">
            <p className="text-lg font-serif italic text-slate-600 leading-relaxed">
                "{wisdom.quote}"
            </p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {wisdom.analysis}
            </p>
          </div>
        </div>

        {/* Action Strategy */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-2">
            <Icons.Target size={20} className="text-blue-600" />
            <h3 className="text-base font-bold uppercase tracking-wider">操作策略</h3>
          </div>
          <div className={`p-5 rounded-xl border ${wisdom.strategyColor} flex items-center justify-between shadow-sm transition-all hover:shadow-md`}>
            <div>
                <div className="text-xs opacity-70 uppercase font-bold mb-1">建议</div>
                <span className="font-bold text-2xl tracking-tight">{wisdom.strategy}</span>
            </div>
            {isSafe ? <Icons.TrendingUp size={32} /> : <Icons.TrendingDown size={32} />}
          </div>
        </div>

        {/* Checklist */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-2">
            <Icons.ScrollText size={20} className="text-slate-600" />
            <h3 className="text-base font-bold uppercase tracking-wider">基本面检查清单</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckItem label="盈利稳定性 (10年)" checked={wisdom.checklist.earnings} />
            <CheckItem label="财务健康 (低负债)" checked={wisdom.checklist.debt} />
            <CheckItem label="股息记录 (连续)" checked={wisdom.checklist.dividend} />
            <CheckItem label="价格 < 净资产 (廉价)" checked={wisdom.checklist.cheap} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${checked ? 'bg-slate-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
    {checked ? (
        <div className="bg-emerald-100 text-emerald-600 rounded-full p-0.5">
            <Icons.CheckCircle2 size={14} />
        </div>
    ) : (
        <div className="bg-slate-200 text-slate-400 rounded-full p-0.5">
            <Icons.XCircle size={14} />
        </div>
    )}
    <span className={`text-xs font-bold ${checked ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
  </div>
);