
import React from 'react';
import { Card, GameSettings } from '../../types';
import { CardComponent } from '../ui/CardComponent';
import { TRANSLATIONS } from '../../utils/locales';

interface RewardProps {
  rewardCards: Card[];
  onSelectReward: (card: Card) => void;
  settings: GameSettings;
}

export const Reward: React.FC<RewardProps> = ({ rewardCards, onSelectReward, settings }) => {
  const t = TRANSLATIONS[settings.language].game;
  
  return (
     <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-black text-yellow-400 mb-4 animate-bounce">{t.victory}!</h2>
        <p className="text-xl text-white mb-8">Choose a card to add to your deck</p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
           {rewardCards.map(card => (
             <div key={card.id} className="">
               <CardComponent 
                 card={card} 
                 selected={false} 
                 disabled={false} 
                 onClick={() => onSelectReward(card)} 
                 pieceSet={settings.pieceSet}
               />
             </div>
           ))}
        </div>
     </div>
  );
};
