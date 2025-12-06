
import React from 'react';
import { Button } from '../ui/Button';

interface OptionsModalProps {
  onContinue: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ onContinue, onSettings, onMainMenu }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div 
        className="bg-slate-800 border-2 border-slate-600 rounded-xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black text-white text-center mb-4 uppercase tracking-widest">Options</h2>
        
        <Button onClick={onContinue} className="w-full bg-green-600 hover:bg-green-500 text-white py-3">
          Continue
        </Button>
        
        <Button onClick={onSettings} className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3">
          Settings
        </Button>
        
        <Button onClick={onMainMenu} className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 py-3">
          Main Menu
        </Button>
      </div>
    </div>
  );
};
