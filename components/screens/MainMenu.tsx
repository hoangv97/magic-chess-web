






import React from 'react';
import { GameSettings, BossType } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface MainMenuProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  startCampaign: () => void;
  initGame: (customMode: boolean) => void;
  onOpenSettings: () => void;
  onOpenWiki: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ settings, setSettings, startCampaign, initGame, onOpenSettings, onOpenWiki }) => {
  const t = TRANSLATIONS[settings.language].mainMenu;
  const bosses = Object.values(BossType);
  const bossNames = TRANSLATIONS[settings.language].bosses;

  return (
    <div className="max-sm:mx-2 m-auto bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700 h-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">{t.newGame}</h2>
      
      <Button 
         onClick={startCampaign}
         className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 text-xl mb-4 shadow-purple-900/50"
      >
        {t.startCampaign}
      </Button>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={onOpenSettings}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3"
        >
          ⚙️ {t.settings}
        </Button>
        <Button
          onClick={onOpenWiki}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3"
        >
          📖 {t.wiki}
        </Button>
      </div>
      
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
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-slate-300">{t.enemies}: {settings.enemyCount}</label>
        <input 
          type="range" min="1" max="10" value={settings.enemyCount}
          onChange={(e) => setSettings({...settings, enemyCount: parseInt(e.target.value)})}
          className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-slate-300">{t.playerCount}: {settings.playerCount}</label>
        <input 
          type="range" min="1" max="10" value={settings.playerCount}
          onChange={(e) => setSettings({...settings, playerCount: parseInt(e.target.value)})}
          className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-slate-300">{t.selectBoss}</label>
        <select 
          value={settings.customBossType} 
          onChange={(e) => setSettings({...settings, customBossType: e.target.value as BossType})}
          className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600"
        >
          {bosses.map(b => (
             <option key={b} value={b}>{bossNames[b].name}</option>
          ))}
        </select>
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