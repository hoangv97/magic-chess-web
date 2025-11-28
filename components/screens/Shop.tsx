
import React from 'react';
import { Card, Relic, RelicType } from '../../types';
import { RELIC_INFO } from '../../constants';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';

interface ShopProps {
  gold: number;
  shopCards: Card[];
  shopRelics: Relic[];
  relics: Relic[]; // inventory
  onBuyCard: (card: Card) => void;
  onBuyRelic: (relic: Relic, index: number) => void;
  onNext: () => void;
}

export const Shop: React.FC<ShopProps> = ({ 
  gold, shopCards, shopRelics, relics, onBuyCard, onBuyRelic, onNext 
}) => {
  return (
     <div className="w-full h-full flex flex-col items-center p-8 bg-slate-900 overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Merchant's Camp</h2>
          <p className="text-slate-400">Spend your gold to reinforce your army.</p>
        </div>
        
        {/* Relic Shop Section */}
        {shopRelics.length > 0 && (
          <div className="mb-12 w-full max-w-4xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2">Ancient Relics</h3>
              <div className="flex gap-6 justify-center">
                  {shopRelics.map((relic, idx) => {
                       const info = RELIC_INFO[relic.type];
                       const existing = relics.find(r => r.type === relic.type);
                       const level = existing ? existing.level : 0;
                       const cost = info.basePrice * (level + 1);
                       
                       return (
                          <div key={idx} className="bg-slate-800 border border-purple-500/50 rounded-lg p-4 w-64 flex flex-col items-center hover:bg-slate-800/80 transition-colors shadow-lg shadow-purple-900/20">
                              <div className="text-5xl mb-2">{info.icon}</div>
                              <div className="font-bold text-white">{info.name}</div>
                              <div className="text-xs text-purple-300 uppercase font-bold mb-2">{existing ? `Upgrade to Lvl ${level + 1}` : "New Artifact"}</div>
                              <p className="text-xs text-slate-400 text-center mb-4 h-12 flex items-center justify-center">
                                  {info.description(level + 1)}
                              </p>
                              <Button 
                                  disabled={gold < cost}
                                  onClick={() => onBuyRelic(relic, idx)}
                                  className={`w-full ${gold >= cost ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-700'}`}
                              >
                                  Buy {cost}g
                              </Button>
                          </div>
                       );
                  })}
              </div>
          </div>
        )}

        {/* Cards Shop Section */}
        <div className="w-full max-w-4xl mb-12">
           <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-500/30 pb-2">Battle Cards</h3>
           <div className="flex flex-wrap gap-8 justify-center">
              {shopCards.map(card => (
              <div key={card.id} className="relative group">
                  <CardComponent 
                  card={card} 
                  selected={false} 
                  disabled={gold < card.cost} 
                  onClick={() => onBuyCard(card)}
                  showCost={true}
                  />
                  {gold < card.cost && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-red-500 font-bold rotate-12 border-2 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      TOO EXPENSIVE
                  </div>
                  )}
              </div>
              ))}
              {shopCards.length === 0 && <div className="text-slate-500 italic">Sold Out</div>}
           </div>
        </div>

        <Button 
          onClick={onNext} 
          className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 text-xl shadow-lg shadow-green-900/50"
        >
          Travel to Map &rarr;
        </Button>
     </div>
  );
};
