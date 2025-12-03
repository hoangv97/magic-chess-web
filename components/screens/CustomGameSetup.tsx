
import React from 'react';
import { GameSettings, BossType } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface CustomGameSetupProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  onStart: () => void;
  onBack: () => void;
}

export const CustomGameSetup: React.FC<CustomGameSetupProps> = ({ settings, setSettings, onStart, onBack }) => {
  const t = TRANSLATIONS[settings.language].customSetup;
  const bosses = Object.values(BossType);
  const bossNames = TRANSLATIONS[settings.language].bosses;

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
        <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">{t.title}</h2>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-slate-300">{t.boardSize}: <span className="text-yellow-400">{settings.boardSize}x{settings.boardSize}</span></label>
          <input 
            type="range" min="6" max="12" value={settings.boardSize}
            onChange={(e) => setSettings({...settings, boardSize: parseInt(e.target.value)})}
            className="w-full accent-yellow-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
             <span>6x6</span><span>12x12</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-slate-300">{t.enemies}: <span className="text-red-400">{settings.enemyCount}</span></label>
          <input 
            type="range" min="1" max="12" value={settings.enemyCount}
            onChange={(e) => setSettings({...settings, enemyCount: parseInt(e.target.value)})}
            className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-slate-300">{t.playerCount}: <span className="text-blue-400">{settings.playerCount}</span></label>
          <input 
            type="range" min="1" max="12" value={settings.playerCount}
            onChange={(e) => setSettings({...settings, playerCount: parseInt(e.target.value)})}
            className="w-full accent-blue-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-bold mb-2 text-slate-300">{t.selectBoss}</label>
          <select 
            value={settings.customBossType} 
            onChange={(e) => setSettings({...settings, customBossType: e.target.value as BossType})}
            className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:border-yellow-500"
          >
            {bosses.map(b => (
               <option key={b} value={b}>{bossNames[b].name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
            <Button 
                onClick={onStart} 
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 text-lg shadow-lg shadow-green-900/50"
            >
                {t.start}
            </Button>
            <Button onClick={onBack} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-3">
                {t.back}
            </Button>
        </div>
      </div>
    </div>
  );
};
