import React from 'react';
import { motion } from 'framer-motion';
import { GamePhase, GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface GameOverProps {
  phase: GamePhase;
  isCampaign: boolean;
  onMainMenu: () => void;
  onRestartCampaign: () => void;
  settings: GameSettings;
}

export const GameOver: React.FC<GameOverProps> = ({ phase, isCampaign, onMainMenu, onRestartCampaign, settings }) => {
  if (phase !== 'GAME_OVER_WIN' && phase !== 'GAME_OVER_LOSS') return null;
  const t = TRANSLATIONS[settings.language].game;
  const isWin = phase === 'GAME_OVER_WIN';
  
  return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       // Changed bg-black/50 to bg-black/30 for transparency so user can see board
       className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center pointer-events-auto"
     >
       <motion.div 
         initial={{ scale: 0.8, y: 50, opacity: 0 }}
         animate={{ scale: 1, y: 0, opacity: 1 }}
         transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
         className="text-center p-8 bg-slate-800/90 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm max-w-md w-full mx-4"
       >
         <h2 className={`text-6xl font-black mb-4 ${isWin ? 'text-green-400' : 'text-red-500'} drop-shadow-lg`}>
           {isWin ? t.victory : t.defeat}
         </h2>
         <p className="text-slate-200 mb-8 text-xl font-bold">
           {isWin ? (isCampaign ? t.victoryDescCampaign : t.victoryDescCustom) : (isCampaign ? t.defeatDescCampaign : t.defeatDescCustom)}
         </p>
         <div className="flex gap-4 justify-center">
           <Button onClick={onMainMenu} className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-xl shadow-lg">
             {t.mainMenu}
           </Button>
           {phase === 'GAME_OVER_LOSS' && isCampaign && (
              <Button onClick={onRestartCampaign} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 text-xl shadow-lg">
                {t.restartCampaign}
              </Button>
           )}
         </div>
       </motion.div>
     </motion.div>
  );
};