
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';
import { Card, Relic, GameSettings } from '../../types';
import { getRelicInfo } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';

interface EventResultProps {
  title: string;
  description: string;
  rewardType: 'GOLD' | 'CARD' | 'RELIC' | 'NOTHING';
  rewardGold?: number;
  rewardCard?: Card;
  rewardRelic?: Relic;
  onContinue: () => void;
  settings: GameSettings;
}

export const EventResult: React.FC<EventResultProps> = ({ 
  title, description, rewardType, rewardGold, rewardCard, rewardRelic, onContinue, settings 
}) => {
  const t = TRANSLATIONS[settings.language].game;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-slate-800 p-8 rounded-xl border-2 border-purple-500/50 shadow-2xl text-center"
        >
           <h2 className="text-3xl font-black text-purple-300 mb-4">{title}</h2>
           <p className="text-slate-300 mb-8 text-lg">{description}</p>

           <div className="flex justify-center mb-8 min-h-[150px] items-center">
              {rewardType === 'GOLD' && (
                  <div className="text-center">
                      <div className="text-6xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-yellow-400">+{rewardGold} Gold</div>
                  </div>
              )}
              {rewardType === 'CARD' && rewardCard && (
                  <div className="scale-125">
                      <CardComponent card={rewardCard} selected={false} onClick={() => {}} disabled={false} />
                  </div>
              )}
              {rewardType === 'RELIC' && rewardRelic && (
                  <div className="text-center bg-slate-700 p-4 rounded-lg border border-purple-500">
                      <div className="text-6xl mb-2">{getRelicInfo(settings.language, rewardRelic.type).icon}</div>
                      <div className="font-bold text-white">{getRelicInfo(settings.language, rewardRelic.type).name}</div>
                  </div>
              )}
              {rewardType === 'NOTHING' && (
                  <div className="text-6xl opacity-50">🍃</div>
              )}
           </div>

           <Button onClick={onContinue} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 text-lg">
               {t.close}
           </Button>
        </motion.div>
    </div>
  );
};
