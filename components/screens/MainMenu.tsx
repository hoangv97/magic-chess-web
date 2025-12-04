








import React from 'react';
import { GameSettings, BossType } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface MainMenuProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  startCampaign: () => void;
  onCustomSetup: () => void;
  onOpenSettings: () => void;
  onOpenWiki: () => void;
  onCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ settings, setSettings, startCampaign, onCustomSetup, onOpenSettings, onOpenWiki, onCredits }) => {
  const t = TRANSLATIONS[settings.language].mainMenu;

  return (
    <div className="max-sm:mx-2 m-auto bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700 h-full max-h-[90vh] overflow-y-auto flex flex-col justify-center">
      <h2 className="text-4xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-center tracking-tighter drop-shadow-lg">{t.title}</h2>
      
      <div className="space-y-4">
        <Button 
           onClick={startCampaign}
           className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 text-xl shadow-purple-900/50"
        >
          {t.startCampaign}
        </Button>

        <Button 
          onClick={onCustomSetup} 
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 text-lg border border-slate-600"
        >
          {t.customGame}
        </Button>

        <div className="flex gap-4">
          <Button
            onClick={onOpenSettings}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 text-sm"
          >
            ⚙️ {t.settings}
          </Button>
          <Button
            onClick={onOpenWiki}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 text-sm"
          >
            📖 {t.wiki}
          </Button>
        </div>

        <Button
            onClick={onCredits}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-2 text-xs border border-slate-700 uppercase tracking-widest"
        >
            {t.credits}
        </Button>
      </div>
      
      <div className="mt-8 text-center text-[10px] text-slate-600">
        v1.2.0 • Chess Evolution
      </div>
    </div>
  );
};
