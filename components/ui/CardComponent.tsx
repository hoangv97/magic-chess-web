import React from 'react';
import { Card } from '../../types';

interface CardComponentProps {
  card: Card;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  showCost?: boolean;
  customCost?: number; // Optional prop to override displayed cost
}

export const CardComponent: React.FC<CardComponentProps> = ({ card, selected, onClick, disabled, showCost = false, customCost }) => {
  const displayCost = customCost !== undefined ? customCost : card.cost;
  const isDiscounted = customCost !== undefined && customCost < card.cost;

  return (
    <div 
      onClick={() => !disabled && onClick()}
      className={`
        flex-shrink-0 w-32 h-44 border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative
        ${selected ? 'border-yellow-400 bg-yellow-50 -translate-y-4 shadow-xl ring-2 ring-yellow-400 text-black' : 'border-gray-600 bg-slate-800 text-white hover:-translate-y-2 hover:shadow-lg'}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-center border-b border-gray-500 pb-1 mb-1 truncate">
        {card.title}
      </div>
      <div className="flex-grow flex items-center justify-center text-center">
        {/* Icon placeholder based on type */}
        <span className="text-3xl">
          {card.type.includes('SPAWN') && '⚔️'}
          {card.type.includes('IMMORTAL') && '🛡️'}
          {card.type.includes('SWITCH') && '🔄'}
          {card.type.includes('FREEZE') && '❄️'}
          {card.type.includes('LIMIT') && '🐌'}
          {card.type.includes('BORROW') && '🎭'}
          {card.type.includes('MIMIC') && '🎭'}
          {card.type.includes('BACK') && '↩️'}
          {card.type.includes('TRAP') && '☠️'}
          {card.type.includes('ASCEND') && '⏳'}
        </span>
      </div>
      <div className="text-[9px] text-center leading-tight opacity-90 mb-1">
        {card.description}
      </div>
      {showCost && (
        <div className={`absolute -top-2 -right-2 ${isDiscounted ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold rounded-full w-auto min-w-[2rem] h-8 px-1 flex items-center justify-center border-2 border-white shadow-sm text-xs z-10`}>
          {isDiscounted ? (
             <span className="flex flex-col items-center leading-none">
                <span className="line-through text-[8px] opacity-70">${card.cost}</span>
                <span>${displayCost}</span>
             </span>
          ) : (
             `$${displayCost}`
          )}
        </div>
      )}
    </div>
  );
};