
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
}

// Assuming settings is passed or we default to 'en' if not available in props.
// Ideally, DeckModal should receive settings. If not, we might need to update parent usage or assume a default.
// Based on current architecture, we should update usage sites.
// For now, I'll update the signature but handle missing settings gracefully if possible, or assume it's passed.
// Update: checking usage in GameScreen and CampaignGame, it seems we need to pass settings.

export const DeckModal: React.FC<DeckModalProps & { settings?: GameSettings }> = ({ deck, onClose, activeBoss, pieceSet, shouldShuffle = false, settings }) => {
  const isUnitCard = (type: string) => type.startsWith('SPAWN') && type !== 'SPAWN_REVIVE';
  const language = settings ? settings.language : 'en';
  const t = TRANSLATIONS[language].modals.deck;

  // Shuffle deck for display so player doesn't know the exact order of drawing if shouldShuffle is true
  const displayDeck = useMemo(() => shouldShuffle ? shuffleArray(deck) : deck, [deck, shouldShuffle]);

  return (
     <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-white">
               {shouldShuffle ? `${t.remaining} (${deck.length})` : `${t.list} (${deck.length})`}
           </h2>
           <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white">{t.close}</Button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-wrap gap-4 justify-center">
             {displayDeck.length === 0 && <p className="text-slate-500 italic">{t.empty}</p>}
             {displayDeck.map((card, i) => (
                <div key={i} className="opacity-80 hover:opacity-100 transition-opacity">
                   <CardComponent 
                     card={card} 
                     selected={false} 
                     onClick={() => {}} 
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
