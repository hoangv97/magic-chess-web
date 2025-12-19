import React, { useMemo } from 'react';
import { Card, BossType, PieceSetId, GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';
import { shuffleArray } from '../../utils/random';
import { TRANSLATIONS } from '../../utils/locales';

interface DeckModalProps {
  deck: Card[];
  onClose: () => void;
  activeBoss?: BossType;
  pieceSet?: PieceSetId;
  shouldShuffle?: boolean;
  settings?: GameSettings; // Pass settings to access language
  isPickMode?: boolean;
  onSelect?: (card: Card) => void;
}

export const DeckModal: React.FC<DeckModalProps & { settings?: GameSettings }> = ({ 
  deck, onClose, activeBoss, pieceSet, shouldShuffle = false, settings, isPickMode = false, onSelect 
}) => {
  const isUnitCard = (type: string) => type.startsWith('SPAWN') && type !== 'SPAWN_REVIVE';
  const language = settings ? settings.language : 'en';
  const t = TRANSLATIONS[language].modals.deck;

  // Shuffle deck for display so player doesn't know the exact order of drawing if shouldShuffle is true
  const displayDeck = useMemo(() => (shouldShuffle && !isPickMode) ? shuffleArray(deck) : deck, [deck, shouldShuffle, isPickMode]);

  return (
     <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-white">
               {isPickMode ? t.pick : (shouldShuffle ? `${t.remaining} (${deck.length})` : `${t.list} (${deck.length})`)}
           </h2>
           {!isPickMode && <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white">{t.close}</Button>}
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-wrap gap-4 justify-center">
             {displayDeck.length === 0 && <p className="text-slate-500 italic">{t.empty}</p>}
             {displayDeck.map((card, i) => (
                <div key={i} className={`transition-all ${isPickMode ? 'hover:scale-110 hover:shadow-2xl cursor-pointer' : 'opacity-80 hover:opacity-100'}`}>
                   <CardComponent 
                     card={card} 
                     selected={false} 
                     onClick={() => isPickMode && onSelect ? onSelect(card) : {}} 
                     disabled={false} 
                     isHidden={activeBoss === BossType.ILLUSIONIST && isUnitCard(card.type)}
                     pieceSet={pieceSet}
                   />
                </div>
             ))}
          </div>
        </div>
     </div>
  );
};