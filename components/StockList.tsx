import React from 'react';
import { StockData, StockListType } from '../types';
import { Icons } from './Icons';

interface StockListProps {
  title: string;
  data: StockData[];
  type: 'opportunity' | 'risk';
  onSelect: (stock: StockData) => void;
}

const MarginBar: React.FC<{ margin: number; price: number; value: number }> = ({ margin, price, value }) => {
  const isSafe = margin > 0;
  // Visual scaling for the bar
  const percentage = Math.min(Math.abs(margin), 100); 
  
  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px] ml-auto">
      <div className="flex justify-between text-[10px] font-mono opacity-80">
        <span className="text-slate-500">P:${price.toFixed(0)}</span>
        <span className="text-blue-600 font-bold">V:${value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden w-full">
        {/* Center line */}
        <div className="absolute left-0 w-full h-full flex items-center">
            <div 
                className={`h-full rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(percentage * 2, 100)}%` }} 
            />
        </div>
      </div>
    </div>
  );
};

export const StockList: React.FC<StockListProps> = ({ title, data, type, onSelect }) => {
  const isOpp = type === StockListType.OPPORTUNITY;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-slate-100 flex justify-between items-center ${isOpp ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isOpp ? <Icons.ShieldCheck size={18} /> : <Icons.AlertTriangle size={18} />}
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isOpp ? 'text-emerald-900' : 'text-rose-900'}`}>{title}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {isOpp ? '买入区间 (折价)' : '危险区间 (溢价)'}
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
            {data.length} 项
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100 tracking-wider">
            <tr>
              <th className="pb-3 pl-5 pt-4">公司</th>
              <th className="pb-3 text-right pt-4 hidden sm:table-cell">价格 / 价值</th>
              <th className="pb-3 text-right pr-5 pt-4">边际</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((stock) => {
              const isSafe = stock.margin_of_safety > 0;
              return (
                <tr 
                    key={stock.symbol} 
                    onClick={() => onSelect(stock)} 
                    className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer active:bg-slate-100"
                >
                  <td className="py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${isSafe ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{stock.symbol}</div>
                        <div className="text-xs text-slate-500 font-medium">{stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right hidden sm:table-cell align-middle">
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-slate-700 font-medium">${stock.current_price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">FV: ${stock.fair_value.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-5 text-right align-middle">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-bold font-mono text-xs ${isSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isSafe ? '-' : '+'}{Math.abs(stock.margin_of_safety).toFixed(1)}%
                      </span>
                      <MarginBar margin={stock.margin_of_safety} price={stock.current_price} value={stock.fair_value} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};