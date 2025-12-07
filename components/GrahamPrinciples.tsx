import React from 'react';
import { Icons } from './Icons';

export const GrahamPrinciples: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-blue-800">
        <Icons.BookOpen size={18} />
        <h3 className="font-serif font-bold italic text-sm">格雷厄姆法则</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">1</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">把股票看作生意</strong> 
            不要把股票仅仅看作代码，而是对实际企业的所有权。
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">2</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">市场先生</strong> 
            市场是你的仆人，而不是你的主人。利用他的愚蠢，而不是参与其中。
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 min-w-[20px] h-5 text-[10px] font-bold text-slate-500 border border-slate-300 rounded flex items-center justify-center bg-white shadow-sm">3</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5">安全边际</strong> 
            稳健投资的秘密。永远在计算中为错误留有余地。
          </p>
        </div>
      </div>
    </div>
  );
};