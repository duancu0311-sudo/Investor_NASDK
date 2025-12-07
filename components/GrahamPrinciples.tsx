import React from 'react';
import { Icons } from './Icons';

export const GrahamPrinciples: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Icons.BookOpen size={18} />
        <h3 className="font-serif font-bold italic text-sm">深渊狩猎法则</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">1</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">无聊是美德</strong> 
            好的投资大部分时间是等待。如果你的投资过程让你心跳加速，那你是在赌博。
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">2</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">市场是仆人</strong> 
            不要因为股价跌了就觉得公司出了问题，去读财报，不要读盘口。
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">3</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">日线狙击</strong> 
            不要接飞刀。RSI 超卖 + 安全边际才是击球区。倒金字塔建仓，永远不一次打光子弹。
          </p>
        </div>
      </div>
    </div>
  );
};