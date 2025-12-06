
import React from 'react';
import { Card, BossType, PieceSetId } from '../../types';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';

interface DeckModalProps {
  deck: Card[];
  onClose: () => void;
  activeBoss?: BossType;
  pieceSet?: PieceSetId;
}

export const DeckModal: React.FC<DeckModalProps> = ({ deck, onClose, activeBoss, pieceSet }) => {
  const isUnitCard = (type: string) => type.startsWith('SPAWN') && type !== 'SPAWN_REVIVE';

  return (
     <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-white">Your Remaining Deck ({deck.length})</h2>
           <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white">Close</Button>
        </div>
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-wrap gap-4 justify-center">
             {deck.length === 0 && <p className="text-slate-500 italic">Deck is empty.</p>}
             {deck.map((card, i) => (
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
