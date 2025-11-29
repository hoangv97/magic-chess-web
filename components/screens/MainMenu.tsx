
import React from 'react';
import { GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface MainMenuProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  startCampaign: () => void;
  initGame: (customMode: boolean) => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ settings, setSettings, startCampaign, initGame, onOpenSettings }) => {
  const t = TRANSLATIONS[settings.language].mainMenu;

  return (
    <div className="m-auto bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
      <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">{t.newGame}</h2>
      
      <Button 
         onClick={startCampaign}
         className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 text-xl mb-4 shadow-purple-900/50"
      >
        {t.startCampaign}
      </Button>

      <Button
        onClick={onOpenSettings}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 mb-6"
      >
        ⚙️ {t.settings}
      </Button>
      
      <div className="border-t border-slate-700 my-6"></div>
      
      <h3 className="text-sm uppercase text-slate-500 font-bold mb-4 text-center">{t.customGame}</h3>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-slate-300">{t.boardSize}: {settings.boardSize}</label>
        <input 
          type="range" min="6" max="12" value={settings.boardSize}
          onChange={(e) => setSettings({...settings, boardSize: parseInt(e.target.value)})}
          className="w-full accent-yellow-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-slate-300">{t.enemies}: {settings.enemyCount}</label>
        <input 
          type="range" min="1" max="10" value={settings.enemyCount}
          onChange={(e) => setSettings({...settings, enemyCount: parseInt(e.target.value)})}
          className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <Button 
        onClick={() => initGame(false)} 
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3"
      >
        {t.startCustom}
      </Button>
    </div>
  );
};
