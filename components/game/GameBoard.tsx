
import React from 'react';
import { Cell, Side, Position, PieceType, CardType, TileEffect, GameSettings } from '../../types';
import { getTileEffectInfo, BOARD_THEMES } from '../../constants';
import { getPieceIcon } from '../assets/PieceSets';
import { TRANSLATIONS } from '../../utils/locales';

interface GameBoardProps {
  board: Cell[][];
  selectedPiecePos: Position | null;
  validMoves: Position[];
  lastMoveFrom: Position | null;
  lastMoveTo: Position | null;
  onSquareClick: (r: number, c: number) => void;
  onSquareRightClick: (r: number, c: number) => void;
  selectedCardId: string | null;
  cardTargetMode: { type: CardType, step: string } | null;
  settings: GameSettings;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, onSquareClick, onSquareRightClick, selectedCardId, cardTargetMode, settings 
}) => {
  const theme = BOARD_THEMES[settings.theme];
  const t = TRANSLATIONS[settings.language];

  const getCellSizeClass = () => {
     const size = board.length;
     if (size >= 10) return "w-10 h-10 sm:w-12 sm:h-12";
     return "w-12 h-12 sm:w-16 sm:h-16";
  };

  const getTileEffectStyle = (effect: TileEffect) => {
    switch (effect) {
        case TileEffect.HOLE: return "bg-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]";
        case TileEffect.WALL: return "bg-stone-600 border-4 border-stone-800 shadow-xl";
        case TileEffect.MUD: return "bg-[#5c4033] opacity-80 shadow-[inset_0_0_5px_rgba(0,0,0,0.5)]";
        case TileEffect.LAVA: return "bg-red-900 animate-pulse shadow-[inset_0_0_15px_rgba(255,100,0,0.5)]";
        default: return "";
    }
  };

  const getZoomByBoardLength = () => {
    if (board.length === 12) return .8;
    if (board.length === 11) return .85;
    if (board.length === 10) return .875;
    if (board.length === 9) return .9;
    return 1;
  }

  return (
    <div className={`flex-grow flex items-center justify-center p-4 overflow-auto ${theme.bg}`}>
       <div 
         className={`grid p-2 rounded shadow-2xl border-4 ${theme.border} bg-opacity-20`}
         style={{ 
           gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
           zoom: getZoomByBoardLength(),
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

             const isCardTarget = selectedCardId && cardTargetMode && (
                (cardTargetMode.type.includes('SPAWN') && r >= size - 2 && !cell.piece) ||
                (cardTargetMode.type.includes('SWITCH') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BORROW') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BACK') && cell.piece?.side === Side.WHITE && cell.piece.type !== PieceType.KING)
             );

             const tileClass = getTileEffectStyle(cell.tileEffect);
             const tileInfo = getTileEffectInfo(settings.language, cell.tileEffect);
             const hasTooltip = cell.piece || cell.tileEffect !== TileEffect.NONE;

             return (
               <div 
                 key={`${r}-${c}`}
                 onClick={() => onSquareClick(r, c)}
                 onContextMenu={(e) => { e.preventDefault(); onSquareRightClick(r, c); }}
                 className={`
                   ${getCellSizeClass()} flex items-center justify-center relative select-none group
                   ${isDark ? theme.dark : theme.light}
                   ${isSelected ? 'ring-inset ring-4 ring-yellow-400' : ''}
                   ${isCardTarget ? 'ring-inset ring-4 ring-blue-500 cursor-copy' : ''}
                   ${(isLastFrom || isLastTo) ? 'after:absolute after:inset-0 after:bg-yellow-500/30' : ''}
                   ${isValid ? 'cursor-pointer' : ''}
                   ${tileClass ? tileClass : ''}
                   ${cell.tileEffect === TileEffect.WALL || cell.tileEffect === TileEffect.HOLE ? 'z-10' : ''}
                 `}
               >
                 {(c === 0) && <span className={`absolute left-0.5 top-0.5 text-[8px] opacity-50`}>{size - r}</span>}
                 {(r === size - 1) && <span className={`absolute right-0.5 bottom-0 text-[8px] opacity-50`}>{String.fromCharCode(97 + c)}</span>}

                 {isValid && !cell.piece && <div className="w-3 h-3 rounded-full bg-black/20" />}
                 {isValid && cell.piece && <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />}

                 {cell.tileEffect === TileEffect.WALL && <span className="absolute text-2xl">🧱</span>}
                 {cell.tileEffect === TileEffect.HOLE && <span className="absolute text-2xl">🕳️</span>}

                 {hasTooltip && (
                   <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50 hidden group-hover:block pointer-events-none shadow-lg border border-slate-700">
                      {cell.piece ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-yellow-400">
                              {cell.piece.side === Side.WHITE ? t.game.mainMenu.replace('Main Menu', 'Player') : 'Enemy'} {t.pieces[cell.piece.type]}
                          </span>
                          {(cell.piece.frozenTurns || 0) > 0 && <span className="text-blue-300">{t.tooltips.frozen.replace('{0}', String(cell.piece.frozenTurns))}</span>}
                          {cell.piece.tempMoveOverride && <span className="text-purple-300">{t.tooltips.movesLike.replace('{0}', t.pieces[cell.piece.tempMoveOverride])}</span>}
                          {cell.tileEffect !== TileEffect.NONE && <span className="text-[9px] text-slate-400">{t.tooltips.on} {tileInfo.name}</span>}
                        </div>
                      ) : (
                        <div className="font-bold text-orange-400">{tileInfo.name}</div>
                      )}
                      <div className="text-[8px] text-slate-500 mt-1">{t.tooltips.rightClick}</div>
                   </div>
                 )}

                 {cell.piece && (
                   <div className={`
                     w-4/5 h-4/5 transition-transform duration-200 z-20
                     ${(cell.piece.frozenTurns || 0) > 0 ? 'brightness-50 grayscale opacity-80' : ''}
                   `}>
                     {getPieceIcon(settings.pieceSet, cell.piece.side, cell.piece.type)}
                     {(cell.piece.frozenTurns || 0) > 0 && <div className="absolute -top-1 -right-1 text-base">❄️</div>}
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
