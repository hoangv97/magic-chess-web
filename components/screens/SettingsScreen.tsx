
import React, { useState } from 'react';
import { GameSettings, BoardThemeId, PieceSetId, Language } from '../../types';
import { BOARD_THEMES } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';
import { Button } from '../ui/Button';
import { soundManager } from '../../utils/soundManager';
import { PiecePreviewModal } from '../modals/PiecePreviewModal';

interface SettingsScreenProps {
  settings: GameSettings;
  setSettings: (s: GameSettings) => void;
  onBack: () => void;
  onReset?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings, onBack, onReset }) => {
  const t = TRANSLATIONS[settings.language].settings;
  const [showPreview, setShowPreview] = useState(false);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (key === 'soundVolume' || key === 'soundEnabled') {
        soundManager.updateSettings(newSettings);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-700 max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">{t.title}</h2>

        {/* Sound Settings */}
        <div className="mb-6 bg-slate-700/50 p-4 rounded-lg">
             <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                 🔊 {t.sound}
             </h3>
             
             <div className="flex items-center justify-between mb-4">
                 <label className="text-slate-300 text-sm font-bold">{t.enableSound}</label>
                 <div 
                   onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                   className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.soundEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                 >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
             </div>

             <div className="mb-2">
                 <label className="text-slate-300 text-sm font-bold mb-2 block">{t.volume} {Math.round(settings.soundVolume * 100)}%</label>
                 <input 
                   type="range" min="0" max="1" step="0.1" 
                   value={settings.soundVolume}
                   onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                   className="w-full accent-green-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                 />
             </div>
        </div>

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

        <div className="flex flex-col gap-4">
            <Button onClick={() => setShowPreview(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 font-bold shadow-lg shadow-indigo-900/50">
               {t.preview}
            </Button>

            {onReset && (
                <Button onClick={onReset} className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 py-2 text-sm">
                {t.reset}
                </Button>
            )}
            <Button onClick={onBack} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3">
            {t.back}
            </Button>
        </div>
      </div>

      {showPreview && (
        <PiecePreviewModal 
            settings={settings} 
            onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};
