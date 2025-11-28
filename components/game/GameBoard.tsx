import React from 'react';
import { Cell, Side, Position, PieceType, CardType } from '../../types';
import { PIECE_ICONS } from '../../constants';

interface GameBoardProps {
  board: Cell[][];
  selectedPiecePos: Position | null;
  validMoves: Position[];
  lastMoveFrom: Position | null;
  lastMoveTo: Position | null;
  onSquareClick: (r: number, c: number) => void;
  selectedCardId: string | null;
  cardTargetMode: { type: CardType, step: string } | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, onSquareClick, selectedCardId, cardTargetMode 
}) => {
  const getCellSizeClass = () => {
     const size = board.length;
     if (size >= 10) return "w-10 h-10 sm:w-12 sm:h-12";
     return "w-12 h-12 sm:w-16 sm:h-16";
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-[#1a1c23] overflow-auto">
       <div 
         className="grid bg-[#3d2e23] p-2 rounded shadow-2xl border-4 border-[#2a2018]"
         style={{ 
           gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))` 
         }}
       >
         {board.map((row, r) => (
           row.map((cell, c) => {
             const isDark = (r + c) % 2 === 1;
             const isSelected = selectedPiecePos?.row === r && selectedPiecePos?.col === c;
             const isValid = validMoves.some(m => m.row === r && m.col === c);
             const isLastFrom = lastMoveFrom?.row === r && lastMoveFrom?.col === c;
             const isLastTo = lastMoveTo?.row === r && lastMoveTo?.col === c;
             const size = board.length;

             // Card Targeting Highlight
             const isCardTarget = selectedCardId && cardTargetMode && (
                (cardTargetMode.type.includes('SPAWN') && r >= size - 2 && !cell.piece) ||
                (cardTargetMode.type.includes('SWITCH') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BORROW') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BACK') && cell.piece?.side === Side.WHITE && cell.piece.type !== PieceType.KING)
             );

             return (
               <div 
                 key={`${r}-${c}`}
                 onClick={() => onSquareClick(r, c)}
                 className={`
                   ${getCellSizeClass()} flex items-center justify-center relative select-none
                   ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'}
                   ${isSelected ? 'ring-inset ring-4 ring-yellow-400' : ''}
                   ${isCardTarget ? 'ring-inset ring-4 ring-blue-500 cursor-copy' : ''}
                   ${(isLastFrom || isLastTo) ? 'after:absolute after:inset-0 after:bg-yellow-500/30' : ''}
                   ${isValid ? 'cursor-pointer' : ''}
                 `}
               >
                 {(c === 0) && <span className={`absolute left-0.5 top-0.5 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{size - r}</span>}
                 {(r === size - 1) && <span className={`absolute right-0.5 bottom-0 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{String.fromCharCode(97 + c)}</span>}

                 {isValid && !cell.piece && <div className="w-3 h-3 rounded-full bg-black/20" />}
                 {isValid && cell.piece && <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />}

                 {cell.piece && (
                   <div className={`
                     w-4/5 h-4/5 transition-transform duration-200
                     ${cell.piece.side === Side.WHITE ? 'text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)]' : 'text-black drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]'}
                     ${cell.piece.isFrozen ? 'brightness-50 grayscale opacity-80' : ''}
                   `}>
                     {PIECE_ICONS[cell.piece.type]}
                     {cell.piece.isFrozen && <div className="absolute -top-1 -right-1 text-base">❄️</div>}
                     {cell.piece.tempMoveOverride && <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-white">✨</div>}
                   </div>
                 )}
               </div>
             );
           })
         ))}
       </div>
    </div>
  );
};