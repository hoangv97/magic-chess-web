
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';
import { Card, Relic, GameSettings } from '../../types';
import { getRelicInfo } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';
import { soundManager } from '../../utils/soundManager';

interface EventResultProps {
  title: string;
  description: string;
  rewardType: 'GOLD' | 'CARD' | 'RELIC' | 'NOTHING' | 'PICK_CARD';
  rewardGold?: number;
  rewardCard?: Card;
  rewardRelic?: Relic;
  choiceCards?: Card[];
  onContinue: (selectedCard?: Card) => void;
  settings: GameSettings;
}

const CardBack = ({ onClick }: { onClick: () => void }) => (
    <motion.div 
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-32 h-44 border-2 border-slate-600 bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer shadow-lg relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] opacity-50"></div>
        <div className="text-4xl text-slate-500 font-black group-hover:text-yellow-500 transition-colors z-10">?</div>
        <div className="absolute inset-0 border-4 border-slate-700 rounded-lg opacity-50"></div>
    </motion.div>
);

export const EventResult: React.FC<EventResultProps> = ({ 
  title, description, rewardType, rewardGold, rewardCard, rewardRelic, choiceCards, onContinue, settings 
}) => {
  const t = TRANSLATIONS[settings.language].game;
  
  // Mystery Pick State
  const [revealed, setRevealed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Card | null>(null);

  const handleMysteryClick = (card: Card) => {
      if (!revealed) {
          soundManager.playSfx('draw');
          setRevealed(true);
      }
      setSelectedChoice(card);
      soundManager.playSfx('click');
  };

  const handleContinue = () => {
      if (rewardType === 'PICK_CARD') {
          if (selectedChoice) onContinue(selectedChoice);
      } else {
          onContinue();
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border-2 border-purple-500/50 shadow-2xl text-center max-h-screen overflow-y-auto"
        >
           <h2 className="text-3xl font-black text-purple-300 mb-4">{title}</h2>
           <p className="text-slate-300 mb-8 text-lg whitespace-pre-wrap">{description}</p>

           <div className="flex flex-col items-center justify-center mb-8 min-h-[150px]">
              {rewardType === 'GOLD' && (
                  <div className="text-center">
                      <div className="text-6xl mb-2">💰</div>
                      <div className="text-2xl font-bold text-yellow-400">+{rewardGold} Gold</div>
                  </div>
              )}
              
              {rewardType === 'CARD' && rewardCard && (
                  <div className="scale-125">
                      <CardComponent 
                        card={rewardCard} 
                        selected={false} 
                        onClick={() => {}} 
                        disabled={false} 
                        pieceSet={settings.pieceSet}
                      />
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

              {rewardType === 'PICK_CARD' && choiceCards && (
                  <div className="flex gap-4 items-center justify-center">
                      <AnimatePresence mode='wait'>
                          {!revealed ? (
                              <motion.div 
                                key="backs"
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0, rotateY: 90 }}
                                transition={{ duration: 0.3 }}
                                className="flex gap-4"
                              >
                                  {choiceCards.map((card, idx) => (
                                      <motion.div 
                                        key={`back-${idx}`}
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: idx * 0.2 }}
                                      >
                                        <CardBack onClick={() => handleMysteryClick(card)} />
                                      </motion.div>
                                  ))}
                              </motion.div>
                          ) : (
                              <motion.div 
                                key="fronts"
                                initial={{ opacity: 0, rotateY: -90 }} 
                                animate={{ opacity: 1, rotateY: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex gap-4"
                              >
                                  {choiceCards.map((card) => (
                                      <div key={card.id} className="relative">
                                          <CardComponent 
                                            card={card} 
                                            selected={selectedChoice?.id === card.id} 
                                            onClick={() => {}} 
                                            disabled={false} 
                                            pieceSet={settings.pieceSet}
                                          />
                                          {selectedChoice?.id === card.id && (
                                              <div className="absolute -bottom-8 left-0 right-0 text-green-400 font-bold text-sm animate-bounce">
                                                  SELECTED
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              )}
           </div>

           <Button 
             onClick={handleContinue} 
             disabled={rewardType === 'PICK_CARD' && !selectedChoice}
             className={`px-8 py-3 text-lg transition-all ${
                 rewardType === 'PICK_CARD' && !selectedChoice 
                 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                 : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50'
             }`}
           >
               {rewardType === 'PICK_CARD' ? (selectedChoice ? 'Confirm Selection' : 'Choose a Card') : t.close}
           </Button>
        </motion.div>
    </div>
  );
};
