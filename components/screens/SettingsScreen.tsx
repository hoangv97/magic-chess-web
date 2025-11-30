
import React from 'react';
import { GameSettings, BoardThemeId, PieceSetId, Language } from '../../types';
import { BOARD_THEMES } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';
import { Button } from '../ui/Button';

interface SettingsScreenProps {
  settings: GameSettings;
  setSettings: (s: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings, onBack }) => {
  const t = TRANSLATIONS[settings.language].settings;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-700">
        <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">{t.title}</h2>

        {/* Language */}
        <div className="mb-6">
          <label className="block text-slate-300 font-bold mb-2">{t.language}</label>
          <div className="flex gap-4">
             <Button 
                onClick={() => updateSetting('language', 'en')} 
                className={`flex-1 ${settings.language === 'en' ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}
             >
               English
             </Button>
             <Button 
                onClick={() => updateSetting('language', 'vi')} 
                className={`flex-1 ${settings.language === 'vi' ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}
             >
               Tiếng Việt
             </Button>
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-slate-300 font-bold mb-2">{t.theme}</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map(themeId => (
               <Button
                 key={themeId}
                 onClick={() => updateSetting('theme', themeId)}
                 className={`text-sm py-3 ${settings.theme === themeId ? 'ring-2 ring-yellow-400' : ''}`}
               >
                 <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border border-gray-500 ${BOARD_THEMES[themeId].light}`}></div>
                   <div className={`w-4 h-4 rounded-full border border-gray-500 ${BOARD_THEMES[themeId].dark}`}></div>
                   <span className={settings.theme === themeId ? 'text-yellow-400' : 'text-slate-300'}>{t.themes[themeId]}</span>
                 </div>
               </Button>
            ))}
          </div>
        </div>

        {/* Piece Set */}
        <div className="mb-8">
          <label className="block text-slate-300 font-bold mb-2">{t.pieceSet}</label>
          <div className="flex gap-4">
             <Button 
                onClick={() => updateSetting('pieceSet', 'STANDARD')} 
                className={`flex-1 ${settings.pieceSet === 'STANDARD' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
             >
               {t.pieceSets.STANDARD}
             </Button>
          </div>
        </div>

        <Button onClick={onBack} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3">
           {t.back}
        </Button>
      </div>
    </div>
  );
};
