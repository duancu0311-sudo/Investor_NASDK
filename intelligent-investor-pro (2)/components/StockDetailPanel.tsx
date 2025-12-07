import React, { useEffect, useState } from 'react';
import { StockData } from '../types';
import { getMasterWisdom } from '../services/marketService';
import { Icons } from './Icons';
import { OptionAnalysisPanel } from './OptionAnalysisPanel';

interface StockDetailPanelProps {
  stock: StockData | null;
  onClose: () => void;
}

export const StockDetailPanel: React.FC<StockDetailPanelProps> = ({ stock, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [showOptionPanel, setShowOptionPanel] = useState(false);

  useEffect(() => {
    if (stock) {
        requestAnimationFrame(() => setAnimateIn(true));
        setShowOptionPanel(false); // Reset when stock changes
    } else {
        setAnimateIn(false);
    }
  }, [stock]);

  if (!stock) return null;

  const wisdom = getMasterWisdom(stock);
  const isSafe = stock.margin_of_safety > 0;
  const translateClass = animateIn ? 'translate-x-0' : 'translate-x-full';

  // 护城河判断
  const isRoicGood = stock.roic >= 15;
  const isDebtGood = stock.debt_to_ebitda <= 3;

  return (
    <>
      {showOptionPanel && (
        <OptionAnalysisPanel stock={stock} onClose={() => setShowOptionPanel(false)} />
      )}
      
      <div className={`fixed inset-y-0 right-0 w-full md:w-[540px] bg-[#fdfdfd] shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-slate-200 overflow-y-auto ${translateClass}`}>
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{stock.symbol}</h2>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${isRoicGood && isDebtGood ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {isRoicGood && isDebtGood ? '优质皇冠' : stock.sector}
              </span>
              {stock.region === 'CN' && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                  A股
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">{stock.name} • 价格 {stock.current_price.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 pb-12">
          
          {/* 1. 核心估值卡片 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icons.Target size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">内在价值 (IV)</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">安全边际</span>
              </div>
              <div className="flex justify-between items-end mb-6">
                  <span className="text-3xl font-bold text-blue-700 font-mono">${stock.fair_value.toFixed(0)}</span>
                  <span className={`text-3xl font-bold font-mono ${stock.margin_of_safety > 30 ? 'text-emerald-600' : (stock.margin_of_safety < 0 ? 'text-rose-600' : 'text-slate-700')}`}>
                      {stock.margin_of_safety.toFixed(1)}%
                  </span>
              </div>

              {/* 核心公式进度条 */}
              <div className="h-6 bg-slate-200 rounded-full overflow-hidden flex shadow-inner relative">
                  {/* 标记线 */}
                  <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-slate-400 z-20" title="30% Margin"></div>
                  <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-400 z-20" title="50% Margin"></div>
                  
                  {/* 实际进度 */}
                  <div 
                      className={`h-full transition-all duration-500 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min((stock.current_price / stock.fair_value) * 100, 100)}%` }}
                  ></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <span>0.0x (免费)</span>
                  <span className="text-emerald-600">0.5x (上帝礼物)</span>
                  <span className="text-blue-600">0.7x (击球区)</span>
                  <span>1.0x (价值)</span>
              </div>
            </div>
          </div>

          {/* 2. 护城河体检 (Moat) */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Icons.ShieldCheck size={20} className="text-slate-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. 护城河筛选 (The Moat)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isRoicGood ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">资本回报率 (ROIC)</div>
                  <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold font-mono ${isRoicGood ? 'text-emerald-700' : 'text-rose-700'}`}>{stock.roic.toFixed(1)}%</span>
                      <span className="text-xs font-bold mb-1 text-slate-400">Target &gt; 15%</span>
                  </div>
              </div>
              <div className={`p-4 rounded-xl border ${isDebtGood ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">债务 / EBITDA</div>
                  <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold font-mono ${isDebtGood ? 'text-emerald-700' : 'text-rose-700'}`}>{stock.debt_to_ebitda.toFixed(1)}x</span>
                      <span className="text-xs font-bold mb-1 text-slate-400">Target &lt; 3.0</span>
                  </div>
              </div>
            </div>
          </div>

          {/* 3. 价值狙击手 & 末日推演 */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Icons.Activity size={20} className="text-slate-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">2. 狙击手 & 末日推演</h3>
            </div>
            
            {/* 日线战术面板 */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-md relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                  <div>
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">日线战术信号</div>
                      <div className="text-xl font-bold text-white">{wisdom.sentiment}</div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">RSI (14)</div>
                      <div className={`text-2xl font-mono font-bold ${stock.rsi < 30 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {stock.rsi.toFixed(1)}
                      </div>
                  </div>
               </div>

               {/* 倒金字塔建议 */}
               <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                      <span className="text-slate-400">现货建仓建议</span>
                      <span className="font-bold text-emerald-400">{wisdom.execution.stage} - {wisdom.execution.allocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b border-slate-700 pb-2">
                      <span className="text-slate-400">臭单挂单价 (Stink Bid)</span>
                      <span className="font-mono text-amber-400">${wisdom.stink_bid_price.toFixed(2)}</span>
                  </div>
               </div>

               {/* 末日按钮 */}
               <button 
                onClick={() => setShowOptionPanel(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all group-hover:shadow-purple-500/25"
               >
                 <Icons.Zap size={18} className="text-yellow-300" />
                 启动末日模拟 (期权预测)
               </button>
            </div>
          </div>

          {/* 4. 大师心法 (Wisdom) */}
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
               <Icons.Brain size={24} className="text-purple-600 mt-1" />
               <div>
                  <h4 className="font-bold text-purple-900 text-sm uppercase mb-2">大师心理心法</h4>
                  <p className="text-sm font-serif italic text-purple-800 leading-relaxed mb-3">
                      "{wisdom.quote}"
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                      {wisdom.analysis}
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};