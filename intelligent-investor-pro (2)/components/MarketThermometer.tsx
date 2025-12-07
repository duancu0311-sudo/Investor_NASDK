import React from 'react';
import { StockData } from '../types';
import { Icons } from './Icons';

interface MarketThermometerProps {
  data: StockData[];
}

export const MarketThermometer: React.FC<MarketThermometerProps> = ({ data }) => {
  const avgMargin = data.reduce((acc, curr) => acc + curr.margin_of_safety, 0) / (data.length || 1);
  
  let status = "理性均衡";
  let color = "text-slate-600";
  
  if (avgMargin > 10) { 
    status = "恐慌 (机遇)"; 
    color = "text-emerald-600"; 
  } else if (avgMargin < -10) { 
    status = "贪婪 (风险)"; 
    color = "text-rose-600"; 
  } else if (avgMargin < 0) {
    status = "昂贵";
    color = "text-amber-600";
  }

  // Calculate pointer position (clamped 0-100)
  // Center is 50%. avgMargin > 0 moves left (Fear/Good), < 0 moves right (Greed/Bad)
  // -30 => 100% (Right), 30 => 0% (Left) 
  // Formula: 50 - (avgMargin * 1.66)
  const pointerPosition = Math.max(5, Math.min(95, 50 - (avgMargin * 1.5)));

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
            <Icons.Activity size={14} /> 市场温度计
          </h3>
          <p className={`text-xl font-bold ${color}`}>{status}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-medium uppercase">平均边际</div>
          <div className={`text-xl font-mono font-bold ${avgMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {avgMargin > 0 ? '+' : ''}{avgMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="relative h-4 bg-slate-100 rounded-full mt-4 overflow-hidden flex border border-slate-200">
        <div className="w-1/3 h-full bg-gradient-to-r from-emerald-200 to-emerald-400 opacity-80"></div> 
        <div className="w-1/3 h-full bg-slate-200 opacity-50"></div> 
        <div className="w-1/3 h-full bg-gradient-to-r from-rose-400 to-rose-200 opacity-80"></div> 
        
        <div 
            className="absolute h-6 w-1 bg-slate-800 shadow-md transition-all duration-700 ease-out top-1/2 -translate-y-1/2 z-10" 
            style={{ left: `${pointerPosition}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase font-medium">
        <span>低估</span>
        <span>合理</span>
        <span>高估</span>
      </div>
    </div>
  );
};