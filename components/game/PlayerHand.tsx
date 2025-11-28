import React from 'react';
import { Card, Side } from '../../types';
import { MAX_CARDS_PLAYED_PER_TURN } from '../../constants';
import { CardComponent } from '../ui/CardComponent';

interface PlayerHandProps {
  hand: Card[];
  deckCount: number;
  selectedCardId: string | null;
  turn: Side;
  cardsPlayed: number;
  onCardClick: (card: Card) => void;
  onDeckClick: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ 
  hand, deckCount, selectedCardId, turn, cardsPlayed, onCardClick, onDeckClick 
}) => {
  return (
    <div className="h-56 bg-slate-900 border-t border-slate-700 flex flex-col relative z-20 shrink-0">
       <div className="flex-grow flex items-center px-4 space-x-4">
          
          {/* Cards Container */}
          <div className="flex-grow flex items-center overflow-x-auto hide-scrollbar space-x-4 h-full">
              {hand.length === 0 && (
                <div className="w-full text-center text-slate-500 italic">
                  Your hand is empty.
                </div>
              )}
              {hand.map((card) => (
                <CardComponent 
                  key={card.id} 
                  card={card} 
                  selected={selectedCardId === card.id} 
                  onClick={() => onCardClick(card)}
                  disabled={turn !== Side.WHITE}
                />
              ))}
          </div>

          {/* Deck Pile Button */}
          <div 
            onClick={onDeckClick}
            className="w-24 h-40 border-2 border-slate-600 bg-slate-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:-translate-y-1 transition-all shadow-lg shrink-0 ml-4 group"
          >
             <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🎴</div>
             <div className="font-bold text-lg text-white">{deckCount}</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-wider">Deck</div>
          </div>

       </div>
       
       <div className="h-8 bg-slate-800 text-center text-xs text-slate-400 flex items-center justify-center border-t border-slate-700">
          {selectedCardId 
            ? <span className="text-yellow-400 animate-pulse">Select a target on the board to cast spell</span> 
            : turn === Side.WHITE ? `Your Turn: Play cards (${MAX_CARDS_PLAYED_PER_TURN - cardsPlayed} left) or move a piece.` : "Enemy Turn..."}
       </div>
    </div>
  );
};