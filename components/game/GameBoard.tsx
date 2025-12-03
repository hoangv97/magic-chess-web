
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Side, Position, PieceType, CardType, TileEffect, GameSettings, BossType } from '../../types';
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
  onSquareDoubleClick: (r: number, c: number) => void;
  selectedCardId: string | null;
  cardTargetMode: { type: CardType, step: string } | null;
  settings: GameSettings;
  selectedEnemyPos: Position | null;
  enemyValidMoves: Position[];
  checkState?: { white: boolean, black: boolean };
  activeBoss?: BossType;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, onSquareClick, onSquareDoubleClick, selectedCardId, cardTargetMode, settings, selectedEnemyPos, enemyValidMoves, checkState, activeBoss
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
        case TileEffect.FROZEN: return "bg-cyan-300 opacity-80 shadow-[inset_0_0_5px_rgba(255,255,255,0.8)]";
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
             const isEnemySelected = selectedEnemyPos?.row === r && selectedEnemyPos?.col === c;
             
             const isValid = validMoves.some(m => m.row === r && m.col === c);
             const isEnemyValid = enemyValidMoves.some(m => m.row === r && m.col === c);

             const isLastFrom = lastMoveFrom?.row === r && lastMoveFrom?.col === c;
             const isLastTo = lastMoveTo?.row === r && lastMoveTo?.col === c;
             const size = board.length;

             const isCardTarget = selectedCardId && cardTargetMode && (
                (cardTargetMode.type.includes('SPAWN') && r >= size - 2 && !cell.piece) ||
                (cardTargetMode.type.includes('SWITCH') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BORROW') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('IMMORTAL') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('MIMIC') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('AREA_FREEZE') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('ASCEND') && cell.piece?.side === Side.WHITE && cell.piece.type === PieceType.PAWN) ||
                (cardTargetMode.type.includes('BACK') && cell.piece?.side === Side.WHITE && cell.piece.type !== PieceType.KING)
             );

             const tileInfo = getTileEffectInfo(settings.language, cell.tileEffect);
             const hasTooltip = cell.piece || cell.tileEffect !== TileEffect.NONE;
             const tooltipPositionClass = r < 2 ? 'top-full mt-1' : 'bottom-full mb-1';

             const isKing = cell.piece?.type === PieceType.KING;
             const isUnderCheck = isKing && checkState && (
               (cell.piece?.side === Side.WHITE && checkState.white) ||
               (cell.piece?.side === Side.BLACK && checkState.black)
             );
             
             const isBossPiece = activeBoss && activeBoss !== BossType.NONE && isKing && cell.piece?.side === Side.BLACK;

             const variantStyle = cell.piece?.variant === 'LAVA' ? 'drop-shadow-[0_0_5px_rgba(255,50,0,0.8)] sepia(1) hue-rotate(-50deg) saturate(3)' :
                                  cell.piece?.variant === 'ABYSS' ? 'drop-shadow-[0_0_5px_rgba(100,0,255,0.8)] invert(0.8) hue-rotate(240deg)' :
                                  cell.piece?.variant === 'FROZEN' ? 'drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] brightness(1.5) hue-rotate(180deg)' : '';

             return (
               <div 
                 key={`${r}-${c}`}
                 onClick={() => onSquareClick(r, c)}
                 onDoubleClick={() => onSquareDoubleClick(r, c)}
                 onContextMenu={(e) => e.preventDefault()}
                 className={`
                   ${getCellSizeClass()} flex items-center justify-center relative select-none group
                   ${isDark ? theme.dark : theme.light}
                   ${isSelected ? 'ring-inset ring-4 ring-yellow-400' : ''}
                   ${isEnemySelected ? 'ring-inset ring-4 ring-red-600' : ''}
                   ${isCardTarget ? 'ring-inset ring-4 ring-blue-500 cursor-copy' : ''}
                   ${(isLastFrom || isLastTo) ? 'after:absolute after:inset-0 after:bg-yellow-500/30' : ''}
                   ${isValid ? 'cursor-pointer' : ''}
                   ${cell.tileEffect === TileEffect.WALL || cell.tileEffect === TileEffect.HOLE ? 'z-10' : ''}
                   hover:z-[60]
                 `}
               >
                 <AnimatePresence>
                    {cell.tileEffect !== TileEffect.NONE && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 pointer-events-none ${getTileEffectStyle(cell.tileEffect)}`}
                      >
                         {cell.tileEffect === TileEffect.WALL && <span className="absolute inset-0 flex items-center justify-center text-2xl">🧱</span>}
                         {cell.tileEffect === TileEffect.FROZEN && <span className="absolute inset-0 flex items-center justify-center text-xl opacity-50">❄️</span>}
                      </motion.div>
                    )}
                 </AnimatePresence>

                 {(c === 0) && <span className={`absolute left-0.5 top-0.5 text-[8px] opacity-50`}>{size - r}</span>}
                 {(r === size - 1) && <span className={`absolute right-0.5 bottom-0 text-[8px] opacity-50`}>{String.fromCharCode(97 + c)}</span>}

                 {isValid && !cell.piece && <div className="w-3 h-3 rounded-full bg-black/20" />}
                 {isValid && cell.piece && <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />}

                 {isEnemyValid && !cell.piece && <div className="w-3 h-3 rounded-full bg-red-600/40" />}
                 {isEnemyValid && cell.piece && <div className="absolute inset-0 border-4 border-red-800 rounded-full opacity-70" />}

                 {isUnderCheck && (
                    <div className="absolute inset-0 bg-red-600/50 animate-pulse z-10 border-4 border-red-600">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-red-600 text-white px-1 rounded">CHECK!</span>
                    </div>
                 )}

                 {hasTooltip && (
                   <div className={`absolute ${tooltipPositionClass} left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-[100] hidden group-hover:block pointer-events-none shadow-lg border border-slate-700`}>
                      {cell.piece ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-yellow-400">
                              {cell.piece.side === Side.WHITE ? '' : ''} {t.pieces[cell.piece.type]}
                          </span>
                          {(cell.piece.variant) && <span className="text-orange-300 font-bold">Element: {cell.piece.variant}</span>}
                          {(cell.piece.frozenTurns || 0) > 0 && <span className="text-blue-300">{t.tooltips.frozen.replace('{0}', String(cell.piece.frozenTurns))}</span>}
                          {(cell.piece.immortalTurns || 0) > 0 && <span className="text-yellow-300">{t.tooltips.immortal.replace('{0}', String(cell.piece.immortalTurns! > 100 ? '∞' : cell.piece.immortalTurns))}</span>}
                          {cell.piece.trapped && <span className="text-red-400 font-bold">Suicide Mode (Trap)</span>}
                          {cell.piece.mimic && <span className="text-purple-400 font-bold">Mimic</span>}
                          {cell.piece.ascendedTurns && <span className="text-cyan-400 font-bold">Ascended ({cell.piece.ascendedTurns} left)</span>}
                          
                          {cell.piece.tempMoveOverride && <span className="text-purple-300">{t.tooltips.movesLike.replace('{0}', t.pieces[cell.piece.tempMoveOverride])}</span>}
                          {isBossPiece && <span className="text-red-500 font-bold uppercase">{t.tooltips.bossAbility}</span>}
                          {cell.tileEffect !== TileEffect.NONE && <span className="text-[9px] text-slate-400">{t.tooltips.on} {tileInfo.name}</span>}
                        </div>
                      ) : (
                        <div className="font-bold text-orange-400">{tileInfo.name}</div>
                      )}
                      <div className="text-[8px] text-slate-500 mt-1">Double-click for info</div>
                   </div>
                 )}

                 <AnimatePresence mode="popLayout">
                   {cell.piece && (
                     <motion.div
                       layoutId={cell.piece.id}
                       key={cell.piece.id}
                       initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                       animate={{ opacity: 1, scale: 1, rotate: 0 }}
                       exit={{ 
                         opacity: 0, 
                         scale: 0.2, 
                         rotate: 180, 
                         filter: "hue-rotate(90deg) grayscale(100%) blur(2px)",
                         transition: { duration: 0.4 } 
                       }}
                       transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 25,
                          layout: { duration: 0.25 }
                       }}
                       className={`
                         w-4/5 h-4/5 z-20 relative
                         ${(cell.piece.frozenTurns || 0) > 0 ? 'brightness-50 grayscale opacity-80' : ''}
                       `}
                     >
                       <motion.div
                         key={cell.piece.type}
                         initial={{ scale: 0.5, rotateY: 180, filter: "brightness(2)" }}
                         animate={{ scale: 1, rotateY: 0, filter: "brightness(1)" }}
                         transition={{ duration: 0.5, type: "spring" }}
                         className="w-full h-full relative"
                         style={{ filter: variantStyle }}
                       >
                          {getPieceIcon(settings.pieceSet, cell.piece.side, cell.piece.type)}
                          {isBossPiece && (
                              <div className="absolute -top-3 -right-3 text-2xl drop-shadow-md z-30">
                                  👿
                              </div>
                          )}
                          
                          {/* Elemental Icons */}
                          {cell.piece.variant === 'LAVA' && (
                              <div className="absolute -bottom-1 -right-1 text-xs bg-red-900 text-white rounded-full w-4 h-4 flex items-center justify-center border border-orange-500 shadow-md z-30" title="Lava Element">
                                🔥
                              </div>
                          )}
                          {cell.piece.variant === 'ABYSS' && (
                              <div className="absolute -bottom-1 -right-1 text-xs bg-black text-white rounded-full w-4 h-4 flex items-center justify-center border border-purple-500 shadow-md z-30" title="Abyss Element">
                                🌀
                              </div>
                          )}
                          {cell.piece.variant === 'FROZEN' && (
                              <div className="absolute -bottom-1 -right-1 text-xs bg-cyan-700 text-white rounded-full w-4 h-4 flex items-center justify-center border border-cyan-300 shadow-md z-30" title="Frozen Element">
                                ❄️
                              </div>
                          )}
                       </motion.div>

                       <AnimatePresence>
                         {(cell.piece.frozenTurns || 0) > 0 && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -top-1 -right-1 text-base drop-shadow-md"
                              transition={{ duration: 0.3 }}
                            >
                              ❄️
                            </motion.div>
                         )}
                         {(cell.piece.immortalTurns || 0) > 0 && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -top-2 -left-2 text-lg drop-shadow-md bg-white rounded-full w-6 h-6 flex items-center justify-center border border-yellow-500 z-40"
                              transition={{ duration: 0.3 }}
                            >
                              🛡️
                            </motion.div>
                         )}
                         {cell.piece.trapped && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="absolute -bottom-1 -left-1 text-sm drop-shadow-md bg-black rounded-full w-5 h-5 flex items-center justify-center border border-red-500 z-40"
                            >
                              ☠️
                            </motion.div>
                         )}
                         {cell.piece.mimic && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="absolute -top-2 right-1/2 translate-x-1/2 text-sm drop-shadow-md bg-purple-800 rounded-full w-5 h-5 flex items-center justify-center border border-purple-400 z-40"
                            >
                              🎭
                            </motion.div>
                         )}
                         {(cell.piece.ascendedTurns || 0) > 0 && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="absolute top-1/2 -right-3 -translate-y-1/2 text-[10px] font-bold bg-cyan-800 text-white rounded px-1 border border-cyan-400 z-40"
                            >
                              ⏳{cell.piece.ascendedTurns}
                            </motion.div>
                         )}
                         {cell.piece.tempMoveOverride && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm"
                            >
                              ✨
                            </motion.div>
                         )}
                       </AnimatePresence>
                     </motion.div>
                   )}
                 </AnimatePresence>
                 
                 {isValid && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute w-2 h-2 bg-green-500/50 rounded-full pointer-events-none"
                    />
                 )}
               </div>
             );
           })
         ))}
       </div>
    </div>
  );
};
