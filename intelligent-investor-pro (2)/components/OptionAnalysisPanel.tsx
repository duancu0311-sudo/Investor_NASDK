import React, { useEffect, useState } from 'react';
import { StockData, OptionScenario } from '../types';
import { calculateOptionScenario } from '../services/marketService';
import { Icons } from './Icons';

interface OptionAnalysisPanelProps {
  stock: StockData;
  onClose: () => void;
}

export const OptionAnalysisPanel: React.FC<OptionAnalysisPanelProps> = ({ stock, onClose }) => {
  const [scenario, setScenario] = useState<OptionScenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate calculation delay
    const timer = setTimeout(() => {
      setScenario(calculateOptionScenario(stock));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [stock]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Main Card */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400 border border-purple-500/30">
              <Icons.Zap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">末日推演实验室</h2>
              <p className="text-xs text-slate-400 font-mono">DOOMSDAY PREDICTION ENGINE // {stock.symbol}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="text-purple-400 font-mono text-sm animate-pulse">Running Monte Carlo Simulation...</div>
            </div>
          ) : scenario && (
            <div className="space-y-8">
              
              {/* 1. Prediction Cone */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Icons.TrendingUp size={80} className="text-slate-500" />
                </div>
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">5日 价格概率分布 (1 SD)</h3>
                
                <div className="flex justify-between items-center relative z-10">
                    <div className="text-center">
                        <div className="text-xs text-rose-400 font-mono mb-1">看跌下限</div>
                        <div className="text-2xl font-bold text-rose-500 font-mono">${scenario.target_price_low.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="w-full h-0.5 bg-slate-600 relative">
                             {/* Center Dot */}
                             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                             {/* Range Line */}
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-rose-500/10 via-transparent to-emerald-500/10 blur-xl"></div>
                        </div>
                        <div className="mt-2 text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-600">
                            当前: ${stock.current_price.toFixed(2)}
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-xs text-emerald-400 font-mono mb-1">看涨上限</div>
                        <div className="text-2xl font-bold text-emerald-500 font-mono">${scenario.target_price_high.toFixed(2)}</div>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                    <span className="text-[10px] text-slate-500 font-mono border border-slate-700 px-2 py-0.5 rounded-full">
                        置信区间: {scenario.probability}% (Monte Carlo)
                    </span>
                </div>
              </div>

              {/* 2. Volatility & Greeks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1 uppercase font-bold">隐含波动率 (IV)</div>
                    <div className="flex items-end gap-2">
                        <span className={`text-2xl font-mono font-bold ${scenario.iv > 40 ? 'text-purple-400' : 'text-slate-200'}`}>
                            {scenario.iv.toFixed(1)}%
                        </span>
                        {scenario.iv > 40 && <span className="text-[10px] text-purple-400 mb-1 border border-purple-500/50 px-1 rounded">极高</span>}
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1 uppercase font-bold">Put/Call Ratio</div>
                    <div className="flex items-end gap-2">
                        <span className={`text-2xl font-mono font-bold ${scenario.put_call_ratio > 1.2 ? 'text-rose-400' : (scenario.put_call_ratio < 0.8 ? 'text-emerald-400' : 'text-slate-200')}`}>
                            {scenario.put_call_ratio.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 mb-1">
                            {scenario.put_call_ratio > 1 ? '看跌主导' : '看涨主导'}
                        </span>
                    </div>
                </div>
              </div>

              {/* 3. Recommended Strategy */}
              <div className="border border-purple-500/30 bg-purple-900/10 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full"></div>
                
                <div className="flex items-center gap-2 mb-3">
                    <Icons.Target size={18} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-purple-200 uppercase">AI 推荐期权策略</h3>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xl font-bold text-white tracking-wide">{scenario.recommended_strategy.name}</div>
                    <div className="px-2 py-1 bg-rose-900/50 text-rose-400 text-[10px] font-bold border border-rose-500/30 rounded uppercase">
                        {scenario.recommended_strategy.risk_level} Risk
                    </div>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {scenario.recommended_strategy.desc}
                </p>
              </div>

              <div className="text-[10px] text-slate-600 text-center pt-4">
                免责声明：期权交易风险极高，可能导致本金全损。本推演仅供数学研究，不构成投资建议。
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};