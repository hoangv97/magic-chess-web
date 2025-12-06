

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Side, GameSettings, BossType } from '../../types';
import { MAX_CARDS_PLAYED_PER_TURN } from '../../constants';
import { CardComponent } from '../ui/CardComponent';
import { TRANSLATIONS } from '../../utils/locales';

interface PlayerHandProps {
  hand: Card[];
  deckCount: number;
  selectedCardId: string | null;
  turn: Side;
  cardsPlayed: number;
  onCardClick: (card: Card) => void;
  onDeckClick: () => void;
  settings: GameSettings;
  activeBoss?: BossType;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ 
  hand, deckCount, selectedCardId, turn, cardsPlayed, onCardClick, onDeckClick, settings, activeBoss 
}) => {
  const t = TRANSLATIONS[settings.language].game;

  const isUnitCard = (type: string) => type.startsWith('SPAWN') && type !== 'SPAWN_REVIVE';

  return (
    <div className="h-56 bg-slate-900 border-t border-slate-700 flex flex-col relative z-20 shrink-0">
       <div className="flex-grow flex items-center px-4 space-x-4">
          
          <div className="max-sm:space-x-2 flex-grow flex items-center overflow-x-auto hide-scrollbar space-x-4 h-full pl-2">
              {hand.length === 0 && (
                <div className="w-full text-center text-slate-500 italic">
                  {t.emptyHand}
                </div>
              )}
              <AnimatePresence mode='popLayout'>
                {hand.map((card, index) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, x: 200, y: 50, scale: 0.2, rotate: 15 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -100, scale: 0.5, transition: { duration: 0.3 } }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 30,
                      delay: index * 0.1 // Stagger effect if multiple cards drawn at once
                    }}
                    className="flex-shrink-0"
                  >
                    <CardComponent 
                      card={card} 
                      selected={selectedCardId === card.id} 
                      onClick={() => onCardClick(card)}
                      disabled={turn !== Side.WHITE}
                      isHidden={activeBoss === BossType.ILLUSIONIST && isUnitCard(card.type)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
          </div>

          <div 
            onClick={onDeckClick}
            className="max-sm:w-16 max-sm:h-32 w-24 h-40 border-2 border-slate-600 bg-slate-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:-translate-y-1 transition-all shadow-lg shrink-0 ml-4 group relative overflow-hidden"
          >
             {/* Simple deck visual effect */}
             <div className="absolute top-1 left-1 right-1 bottom-1 border border-slate-700 rounded opacity-50"></div>
             <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-700 rounded opacity-30"></div>
             
             <div className="text-3xl mb-1 group-hover:scale-110 transition-transform z-10">🎴</div>
             <div className="font-bold text-lg text-white z-10">{deckCount}</div>
             <div className="mt-3 text-[10px] text-slate-400 uppercase tracking-wider z-10">{t.deck}</div>
          </div>

       </div>
       
       <div className="h-8 bg-slate-800 text-center text-xs text-slate-400 flex items-center justify-center border-t border-slate-700">
          {selectedCardId 
            ? <span className="text-yellow-400 animate-pulse">{t.selectTarget}</span> 
            : turn === Side.WHITE ? `${t.yourTurn} (${MAX_CARDS_PLAYED_PER_TURN - cardsPlayed} left)` : t.enemyTurn}
       </div>
    </div>
  );
};