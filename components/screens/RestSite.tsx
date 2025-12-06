
import React, { useState } from 'react';
import { Card, GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';
import { CardComponent } from '../ui/CardComponent';
import { getDeckTemplate } from '../../constants';
import { getRandomCards } from '../../utils/random';

interface RestSiteProps {
  deck: Card[];
  onTrade: (cardToRemove: Card, newCards: Card[]) => void;
  onRemove: (cardToRemove: Card) => void;
  onLeave: () => void;
  settings: GameSettings;
}

export const RestSite: React.FC<RestSiteProps> = ({ deck, onTrade, onRemove, onLeave, settings }) => {
  const t = TRANSLATIONS[settings.language].restSite;
  const [mode, setMode] = useState<'MAIN' | 'TRADE' | 'REMOVE' | 'TRADE_CONFIRM'>('MAIN');
  const [tradeCards, setTradeCards] = useState<Card[]>([]);
  const [cardToTrade, setCardToTrade] = useState<Card | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const handleTradeSelect = (card: Card) => {
      const template = getDeckTemplate(settings.language);
      const newCards = getRandomCards(3, template, deck);
      
      setCardToTrade(card);
      setTradeCards(newCards);
      setSelectedRewardId(null);
      setMode('TRADE_CONFIRM');
  };

  const confirmTrade = () => {
      if (cardToTrade && selectedRewardId) {
          const rewardCard = tradeCards.find(c => c.id === selectedRewardId);
          if (rewardCard) {
            onTrade(cardToTrade, [rewardCard]);
          }
      }
  };

  if (mode === 'MAIN') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533575276332-98c442475e72?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="z-10 bg-slate-800/90 p-12 rounded-xl border border-orange-500/50 shadow-2xl max-w-5xl w-full text-center">
          <div className="text-6xl mb-6">🔥</div>
          <h2 className="text-4xl font-black text-orange-400 mb-4">{t.title}</h2>
          <p className="text-slate-300 mb-8 text-lg">{t.desc}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 transition-colors cursor-pointer group" onClick={() => setMode('TRADE')}>
               <div className="text-3xl mb-2">⚖️</div>
               <h3 className="text-xl font-bold text-white mb-2">{t.tradeTitle}</h3>
               <p className="text-sm text-slate-400 group-hover:text-slate-200">{t.tradeDesc}</p>
            </div>
            
            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-red-400 transition-colors cursor-pointer group" onClick={() => setMode('REMOVE')}>
               <div className="text-3xl mb-2">🗑️</div>
               <h3 className="text-xl font-bold text-white mb-2">{t.removeTitle}</h3>
               <p className="text-sm text-slate-400 group-hover:text-slate-200">{t.removeDesc}</p>
            </div>
          </div>

          <Button onClick={onLeave} className="mt-8 bg-slate-700 hover:bg-slate-600 text-slate-300 px-8 py-3">
            {t.leave}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'TRADE_CONFIRM' && cardToTrade) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 z-50">
            <div className="max-w-6xl w-full bg-slate-800/95 p-8 rounded-xl border-2 border-yellow-500/50 shadow-2xl flex flex-col items-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Confirm Trade</h2>
                <p className="text-slate-400 mb-8">Select 1 card to add to your deck</p>
                
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    {/* Giving */}
                    <div className="flex flex-col items-center">
                        <p className="text-red-400 font-bold mb-4 uppercase tracking-widest">Giving</p>
                        <CardComponent 
                            card={cardToTrade} 
                            selected={false} 
                            onClick={() => {}} 
                            disabled={true} 
                            pieceSet={settings.pieceSet}
                        />
                    </div>

                    <div className="text-4xl text-slate-500">
                        &rarr;
                    </div>

                    {/* Receiving */}
                    <div className="flex flex-col items-center">
                        <p className="text-green-400 font-bold mb-4 uppercase tracking-widest">Choose 1 to Receive</p>
                        <div className="flex gap-4">
                            {tradeCards.map(card => (
                                <div key={card.id} className="relative">
                                    <CardComponent 
                                        card={card} 
                                        selected={selectedRewardId === card.id} 
                                        onClick={() => setSelectedRewardId(card.id)} 
                                        disabled={false} 
                                        pieceSet={settings.pieceSet}
                                    />
                                    {selectedRewardId === card.id && (
                                        <div className="absolute -bottom-8 left-0 right-0 text-center text-green-400 font-bold text-sm animate-bounce">
                                            SELECTED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => setMode('TRADE')} className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-3">
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmTrade} 
                        disabled={!selectedRewardId}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 text-lg font-bold shadow-lg shadow-yellow-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Trade
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  const selectionTitle = mode === 'TRADE' ? t.tradeSelect : t.removeSelect;

  return (
    <div className="w-full h-full flex flex-col p-8 bg-slate-900 z-50">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">{selectionTitle}</h2>
          <Button onClick={() => setMode('MAIN')} className="bg-slate-700 hover:bg-slate-600 text-white">
             {TRANSLATIONS[settings.language].settings.back}
          </Button>
       </div>
       <div className="flex-grow">
          <div className="flex flex-wrap gap-6 justify-center">
             {deck.map((card) => (
                <div key={card.id} className="relative group">
                   <CardComponent 
                     card={card} 
                     selected={false} 
                     onClick={() => mode === 'TRADE' ? handleTradeSelect(card) : onRemove(card)} 
                     disabled={false} 
                     pieceSet={settings.pieceSet}
                   />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                      <span className={`font-bold uppercase border-2 px-2 py-1 rounded ${mode === 'TRADE' ? 'text-yellow-400 border-yellow-400' : 'text-red-500 border-red-500'}`}>
                         {mode === 'TRADE' ? t.actionTrade : t.actionRemove}
                      </span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
