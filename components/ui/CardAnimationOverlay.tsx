
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, GameSettings } from '../../types';
import { CardComponent } from './CardComponent';

interface CardAnimationOverlayProps {
  cards: Card[];
  onComplete: (cardId: string) => void;
  settings: GameSettings;
}

export const CardAnimationOverlay: React.FC<CardAnimationOverlayProps> = ({ cards, onComplete, settings }) => {
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Approximate deck position (Bottom Right inside PlayerHand)
    // Screen center is (0,0) in Framer Motion absolute positioning from center
    // We want to move to bottom right.
    const deckX = (window.innerWidth / 2) - 80; // 80px from right edge
    const deckY = (window.innerHeight / 2) - 100; // 100px from bottom edge (PlayerHand height is ~224px)
    setTarget({ x: deckX, y: deckY });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {cards.map((card) => {
            const isCurse = card.type.toString().startsWith('CURSE_');
            const glowColor = isCurse ? 'bg-purple-600' : 'bg-yellow-400';
            
            return (
                <motion.div
                    key={card.id}
                    layoutId={`anim-card-${card.id}`}
                    initial={{ scale: 0, opacity: 0, y: 0, x: 0, rotate: -720 }}
                    animate={{ 
                        scale: [0, 1.5, 1.5, 0.1], 
                        opacity: [0, 1, 1, 0],
                        y: [0, 0, 0, target.y],
                        x: [0, 0, 0, target.x],
                        rotate: [0, -10, 10, 0]
                    }}
                    transition={{ 
                        duration: 2, 
                        times: [0, 0.2, 0.6, 1],
                        ease: "easeInOut"
                    }}
                    onAnimationComplete={() => onComplete(card.id)}
                    className="absolute flex flex-col items-center"
                >
                    <div className="relative">
                        <div className={`absolute inset-0 ${glowColor} rounded-xl blur-xl opacity-60 animate-pulse`}></div>
                        <CardComponent 
                            card={card} 
                            selected={false} 
                            onClick={() => {}} 
                            disabled={false} 
                            pieceSet={settings.pieceSet}
                        />
                    </div>
                    {isCurse && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: [0, 1, 0], y: [20, 0, -20] }}
                            transition={{ duration: 1.5, times: [0, 0.2, 1] }}
                            className="absolute top-full mt-4 text-3xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                        >
                            Curse Added!
                        </motion.div>
                    )}
                </motion.div>
            );
        })}
      </AnimatePresence>
    </div>
  );
};
