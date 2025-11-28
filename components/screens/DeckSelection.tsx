import React from 'react';
import { STARTER_DECKS, DECK_TEMPLATE } from '../../constants';

interface DeckSelectionProps {
  onSelectDeck: (index: number) => void;
}

export const DeckSelection: React.FC<DeckSelectionProps> = ({ onSelectDeck }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900">
       <h2 className="text-3xl font-bold mb-2 text-white">Choose Your Army</h2>
       <p className="text-slate-400 mb-8">Select a starter deck to begin your campaign.</p>
       <div className="flex flex-wrap gap-6 justify-center">
          {STARTER_DECKS.map((starter, idx) => (
            <div key={idx} 
                 onClick={() => onSelectDeck(idx)}
                 className="w-64 bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 hover:scale-105 transition-all cursor-pointer rounded-xl p-6 flex flex-col shadow-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{starter.name}</h3>
                <p className="text-sm text-slate-300 mb-4 h-10">{starter.description}</p>
                <div className="space-y-1 bg-slate-900/50 p-2 rounded">
                  {starter.cards.map((c, i) => (
                     <div key={i} className="text-xs text-slate-400 flex items-center">
                        <span className="mr-2 text-yellow-600">▪</span> 
                        {DECK_TEMPLATE.find(t => t.type === c)?.title}
                     </div>
                  ))}
                </div>
            </div>
          ))}
       </div>
    </div>
  );
};