import React from 'react';
import { GamePhase } from '../../types';
import { Button } from '../ui/Button';

interface GameOverProps {
  phase: GamePhase;
  isCampaign: boolean;
  onMainMenu: () => void;
  onRestartCampaign: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ phase, isCampaign, onMainMenu, onRestartCampaign }) => {
  if (phase !== 'GAME_OVER_WIN' && phase !== 'GAME_OVER_LOSS') return null;
  
  return (
     <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
       <div className="text-center p-8 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl">
         <h2 className={`text-6xl font-black mb-4 ${phase === 'GAME_OVER_WIN' ? 'text-green-400' : 'text-red-500'}`}>
           {phase === 'GAME_OVER_WIN' ? 'VICTORY' : 'DEFEAT'}
         </h2>
         <p className="text-slate-300 mb-8 text-xl">
           {phase === 'GAME_OVER_WIN' ? (isCampaign ? 'The enemy army has been annihilated!' : 'You have won!') : (isCampaign ? 'Your army is depleted.' : 'You have lost.')}
         </p>
         <div className="flex gap-4 justify-center">
           <Button onClick={onMainMenu} className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-xl">
             Main Menu
           </Button>
           {phase === 'GAME_OVER_LOSS' && isCampaign && (
              <Button onClick={onRestartCampaign} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 text-xl">
                Restart Campaign
              </Button>
           )}
         </div>
       </div>
     </div>
  );
};