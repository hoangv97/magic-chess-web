
import React from 'react';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';
import { GameSettings } from '../../types'; // Import type if needed, but we might just use default en if not passed

// Assuming we can't easily change props drilling everywhere without user request,
// I'll check if I can access settings. The GameHeader uses this, and GameHeader has settings.
// I'll update GameHeader to pass settings to OptionsModal? No, OptionsModal is rendered inside GameHeader.
// GameHeader has 'settings' prop. So I can pass it.

interface OptionsModalProps {
  onContinue: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
  settings?: GameSettings; // Made optional to prevent break if not passed immediately, but logic will fallback
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ onContinue, onSettings, onMainMenu, settings }) => {
  const language = settings ? settings.language : 'en';
  const t = TRANSLATIONS[language].modals.options;

  return (
    <div className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div 
        className="bg-slate-800 border-2 border-slate-600 rounded-xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black text-white text-center mb-4 uppercase tracking-widest">{t.title}</h2>
        
        <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-500 text-white py-3">
          {t.continue}
        </Button>
        
        <Button onClick={onSettings} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3">
          {t.settings}
        </Button>
        
        <Button onClick={onMainMenu} className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 py-3">
          {t.mainMenu}
        </Button>
      </div>
    </div>
  );
};
