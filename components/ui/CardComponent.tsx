
import React from 'react';
import { Card, PieceSetId, PieceType, Side, CardType } from '../../types';
import { getCardIcon, getCardTheme, PIECE_VARIANT_STYLES } from '../../constants';
import { getPieceIcon } from '../assets/PieceSets';

interface CardComponentProps {
  card: Card;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  showCost?: boolean;
  customCost?: number; // Optional prop to override displayed cost
  isHidden?: boolean; // New prop for Illusionist boss logic
  pieceSet?: PieceSetId;
}

const getPieceInfoFromCard = (cardType: CardType): { type: PieceType, variant?: 'LAVA' | 'ABYSS' | 'FROZEN' } | null => {
  const str = cardType.toString();
  if (str === 'SPAWN_REVIVE') return null;
  if (!str.startsWith('SPAWN_') && !str.startsWith('EFFECT_BORROW_')) return null;

  if (cardType === CardType.SPAWN_DRAGON_LAVA) return { type: PieceType.DRAGON, variant: 'LAVA' };
  if (cardType === CardType.SPAWN_DRAGON_ABYSS) return { type: PieceType.DRAGON, variant: 'ABYSS' };
  if (cardType === CardType.SPAWN_DRAGON_FROZEN) return { type: PieceType.DRAGON, variant: 'FROZEN' };

  const pieceStr = str.replace('SPAWN_', '').replace('EFFECT_BORROW_', '');
  if (Object.values(PieceType).includes(pieceStr as PieceType)) {
    return { type: pieceStr as PieceType };
  }
  return null;
};

export const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  selected, 
  onClick, 
  disabled, 
  showCost = false, 
  customCost,
  isHidden = false,
  pieceSet = 'STANDARD'
}) => {
  const displayCost = customCost !== undefined ? customCost : card.cost;
  const isDiscounted = customCost !== undefined && customCost < card.cost;
  
  let theme = getCardTheme(card.type);
  
  if (isHidden) {
      theme = {
        border: 'border-slate-600',
        headerBg: 'bg-slate-700',
        bodyBg: 'bg-gradient-to-b from-slate-800 to-slate-900',
        ribbonBg: 'bg-slate-600',
        descBg: 'bg-slate-200',
        descText: 'text-slate-900',
        jewel: 'bg-cyan-500',
        glow: 'bg-cyan-400/30',
        typeLabel: 'UNIT'
      };
  }
  
  const displayTitle = isHidden ? "???" : card.title;
  const displayDesc = isHidden ? "Identity hidden..." : card.description;
  
  const pieceInfo = !isHidden ? getPieceInfoFromCard(card.type) : null;

  return (
    <div 
      onClick={() => !disabled && onClick()}
      className={`
        flex-shrink-0 w-32 h-44 border-[3px] rounded-xl flex flex-col relative cursor-pointer transition-all duration-200 select-none
        ${theme.border} ${theme.bodyBg}
        ${selected ? '-translate-y-4 shadow-[0_0_20px_rgba(250,204,21,0.6)] ring-2 ring-yellow-400 z-10' : 'hover:-translate-y-2 hover:shadow-xl'}
        ${disabled ? 'opacity-60 grayscale cursor-not-allowed' : ''}
      `}
    >
      {/* Cost Bubble */}
      {showCost && (
        <div className={`absolute -top-3 -left-3 w-9 h-9 rounded-full ${isDiscounted ? 'bg-green-500' : 'bg-yellow-400'} border-2 border-white flex items-center justify-center shadow-lg z-20`}>
          <div className={`text-white font-black drop-shadow-md ${isDiscounted ? 'flex flex-col items-center leading-none' : 'text-sm'}`}>
             {isDiscounted && <span className="text-[8px] line-through opacity-80">{card.cost}</span>}
             <span>${displayCost}</span>
          </div>
        </div>
      )}

      {/* Header (Title) */}
      <div className={`h-8 w-full ${theme.headerBg} flex items-center justify-center border-b ${theme.border} rounded-t-lg relative z-10`}>
        <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate px-2 drop-shadow-md">
          {displayTitle}
        </span>
      </div>

      {/* Portrait / Icon Area */}
      <div className="flex-grow relative flex items-center justify-center overflow-hidden">
         {/* Background Glow */}
         <div className={`absolute w-20 h-20 rounded-full blur-2xl ${theme.glow}`}></div>
         
         {/* Icon */}
         <div className="text-3xl z-10 drop-shadow-2xl transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
            {isHidden ? "?" : (
                pieceInfo ? (
                    <div className={`w-14 h-14 ${pieceInfo.variant ? PIECE_VARIANT_STYLES[pieceInfo.variant] : ''}`} style={{ filter: pieceInfo.variant ? undefined : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                        {getPieceIcon(pieceSet, Side.WHITE, pieceInfo.type)}
                    </div>
                ) : (
                    getCardIcon(card.type)
                )
            )}
         </div>
      </div>

      {/* Type Ribbon */}
      <div className={`w-full py-0.5 text-center ${theme.ribbonBg} text-white text-[8px] font-black uppercase tracking-[0.2em] relative z-10 shadow-sm border-y ${theme.border} border-opacity-50`}>
         {theme.typeLabel}
      </div>

      {/* Description Box */}
      <div className={`h-[4.5rem] w-full ${theme.descBg} p-2 flex flex-col items-center justify-center text-center rounded-b-lg relative border-t ${theme.border}`}>
         <p className={`text-[8px] font-bold leading-tight line-clamp-4 ${theme.descText} ${isHidden ? 'opacity-50 italic' : ''}`}>
            {displayDesc}
         </p>
         
         {/* Rarity Jewel */}
         <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 ${theme.jewel} border-2 border-white shadow-md z-20`}></div>
      </div>

    </div>
  );
};
