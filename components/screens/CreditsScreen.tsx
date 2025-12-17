
import React from 'react';
import { GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface CreditsScreenProps {
  settings: GameSettings;
  onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ settings, onBack }) => {
  const t = TRANSLATIONS[settings.language].credits;

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-700 flex flex-col items-center text-center">
        <h2 className="text-3xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-tighter uppercase">
            {t.title}
        </h2>

        <div className="space-y-6 mb-8 w-full">
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">{t.dev}</h3>
                <p className="text-white text-lg font-medium">AI Studio</p>
            </div>

            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">{t.art}</h3>
                <p className="text-white text-lg font-medium">{t.assets}</p>
                <p className="text-slate-400 text-xs mt-1">{t.assetsSub}</p>
            </div>

            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-1">{t.music}</h3>
                <p className="text-white text-lg font-medium">{t.musicSub}</p>
            </div>

            <div className="p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.thanks}</h3>
                <p className="text-slate-300 text-sm">{t.thanksPlaying}</p>
            </div>
        </div>

        <Button onClick={onBack} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3">
            {t.back}
        </Button>
      </div>
    </div>
  );
};
