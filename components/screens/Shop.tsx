
import React from 'react';
import { Card, Relic, GameSettings, RelicType } from '../../types';
import { getRelicInfo } from '../../constants';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';
import { TRANSLATIONS } from '../../utils/locales';

interface ShopProps {
  gold: number;
  shopCards: Card[];
  shopRelics: Relic[];
  relics: Relic[]; 
  onBuyCard: (card: Card) => void;
  onBuyRelic: (relic: Relic, index: number) => void;
  onNext: () => void;
  settings: GameSettings;
}

export const Shop: React.FC<ShopProps> = ({ 
  gold, shopCards, shopRelics, relics, onBuyCard, onBuyRelic, onNext, settings 
}) => {
  const t = TRANSLATIONS[settings.language].shop;

  // Check for discount relics
  const hasCardDiscount = relics.some(r => r.type === RelicType.DISCOUNT_CARD);
  const hasRelicDiscount = relics.some(r => r.type === RelicType.DISCOUNT_RELIC);

  return (
     <div className="w-full h-full flex flex-col items-center p-8 bg-slate-900 overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-slate-400">{t.desc}</p>
        </div>
        
        {shopRelics.length > 0 && (
          <div className="mb-12 w-full max-w-7xl">
              <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2 flex items-center justify-between">
                  <span>{t.relics}</span>
                  {hasRelicDiscount && <span className="text-sm bg-green-600 text-white px-2 py-1 rounded animate-pulse">50% OFF!</span>}
              </h3>
              <div className="flex flex-wrap gap-6 justify-center">
                  {shopRelics.map((relic, idx) => {
                       const info = getRelicInfo(settings.language, relic.type);
                       const existing = relics.find(r => r.type === relic.type);
                       const level = existing ? existing.level : 0;
                       
                       let baseCost = info.basePrice * (level + 1);
                       if (hasRelicDiscount) {
                           baseCost = Math.floor(baseCost * 0.5);
                       }
                       const cost = baseCost;
                       
                       return (
                          <div key={idx} className="bg-slate-800 border border-purple-500/50 rounded-lg p-4 w-64 flex flex-col items-center hover:bg-slate-800/80 transition-colors shadow-lg shadow-purple-900/20">
                              <div className="text-5xl mb-2">{info.icon}</div>
                              <div className="font-bold text-white">{info.name}</div>
                              <div className="text-xs text-purple-300 uppercase font-bold mb-2">{existing ? `${t.upgrade} ${level + 1}` : t.newArtifact}</div>
                              <p className="text-xs text-slate-400 text-center mb-4 h-12 flex items-center justify-center">
                                  {info.description(level + 1)}
                              </p>
                              <Button 
                                  disabled={gold < cost}
                                  onClick={() => onBuyRelic(relic, idx)}
                                  className={`w-full ${gold >= cost ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-700'}`}
                              >
                                  {t.buy} {cost}g
                              </Button>
                          </div>
                       );
                  })}
              </div>
          </div>
        )}

        <div className="w-full max-w-7xl mb-12">
           <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-500/30 pb-2 flex items-center justify-between">
               <span>{t.cards}</span>
               {hasCardDiscount && <span className="text-sm bg-green-600 text-white px-2 py-1 rounded animate-pulse">50% OFF!</span>}
           </h3>
           <div className="flex flex-wrap gap-8 justify-center">
              {shopCards.map(card => {
                  let finalCost = card.cost;
                  if (hasCardDiscount) {
                      finalCost = Math.floor(card.cost * 0.5);
                  }

                  return (
                    <div key={card.id} className="relative group">
                        <CardComponent 
                        card={card} 
                        selected={false} 
                        disabled={gold < finalCost} 
                        onClick={() => onBuyCard(card)}
                        showCost={true}
                        customCost={finalCost}
                        />
                        {gold < finalCost && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-red-500 font-bold rotate-12 border-2 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {t.tooExpensive}
                        </div>
                        )}
                    </div>
                  );
              })}
              {shopCards.length === 0 && <div className="text-slate-500 italic">{t.soldOut}</div>}
           </div>
        </div>

        <Button 
          onClick={onNext} 
          className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 text-xl shadow-lg shadow-green-900/50"
        >
          {t.next} &rarr;
        </Button>
     </div>
  );
};
