
import React from 'react';
import { Relic, GameSettings } from '../../types';
import { getRelicInfo } from '../../constants';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface RelicDetailModalProps {
  relic: Relic;
  onClose: () => void;
  onSell: (relic: Relic) => void;
  settings: GameSettings;
}

export const RelicDetailModal: React.FC<RelicDetailModalProps> = ({ relic, onClose, onSell, settings }) => {
  const info = getRelicInfo(settings.language, relic.type);
  const t = TRANSLATIONS[settings.language].modals.relicDetail;
  
  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center">
         <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 max-w-sm w-full shadow-2xl relative">
             <div className="text-6xl text-center mb-4">{info.icon}</div>
             <h3 className="text-2xl font-bold text-center text-white mb-1">{info.name}</h3>
             <p className="text-purple-400 text-center font-bold mb-4">{t.level} {relic.level}</p>
             <p className="text-slate-300 text-center mb-8">
                 {info.description(relic.level)}
             </p>
             
             <div className="flex gap-4">
                 <Button onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-500">{t.close}</Button>
                 <Button onClick={() => onSell(relic)} className="flex-1 bg-red-600 hover:bg-red-500">
                     {t.sell} (+{Math.floor(info.basePrice * relic.level * 0.5)}g)
                 </Button>
             </div>
         </div>
    </div>
  );
};
