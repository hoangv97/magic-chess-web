
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Side, Position, PieceType, TileEffect, BossType } from '../../../types';
import { getTileEffectInfo, PIECE_VARIANT_STYLES } from '../../../constants';
import { getPieceIcon } from '../../assets/PieceSets';
import { TRANSLATIONS } from '../../../utils/locales';
import { GAME_ICONS } from '../../assets/GameIcons';

const MotionDiv = motion.div as any;

interface BoardSquareProps {
  cell: Cell;
  r: number;
  c: number;
  size: number;
  isSelected: boolean;
  isEnemySelected: boolean;
  isCardTarget: boolean;
  isLastFrom: boolean;
  isLastTo: boolean;
  isValid: boolean;
  isEnemyValid: boolean;
  isUnderCheck: boolean;
  isBossPiece: boolean;
  bossCountdown?: number | null;
  theme: any;
  settings: any;
  onSquareClick: (r: number, c: number) => void;
  onSquareDoubleClick: (r: number, c: number) => void;
  getTileEffectStyle: (effect: TileEffect) => string;
  activeBoss?: BossType; // Passed from parent if available
}

export const BoardSquare: React.FC<BoardSquareProps> = ({
  cell, r, c, size, isSelected, isEnemySelected, isCardTarget, isLastFrom, isLastTo,
  isValid, isEnemyValid, isUnderCheck, isBossPiece, bossCountdown, theme, settings,
  onSquareClick, onSquareDoubleClick, getTileEffectStyle, activeBoss
}) => {
  const t = TRANSLATIONS[settings.language];
  const isDark = (r + c) % 2 === 1;
  
  const getCellSizeClass = () => {
     if (size >= 10) return "w-10 h-10 sm:w-12 sm:h-12";
     return "w-12 h-12 sm:w-16 sm:h-16";
  };

  const tileInfo = getTileEffectInfo(settings.language, cell.tileEffect);
  const hasTooltip = cell.piece || cell.tileEffect !== TileEffect.NONE;
  const tooltipPositionClass = r < 2 ? 'top-full mt-1' : 'bottom-full mb-1';

  const variantStyle = cell.piece?.variant ? PIECE_VARIANT_STYLES[cell.piece.variant] : '';

  // Logic for The Faceless boss disguise
  // If boss is The Faceless, and piece is Black, and not King -> Display as Pawn
  let displayType = cell.piece?.type;
  let displayTooltipName = cell.piece ? t.pieces[cell.piece.type] : '';
  
  if (activeBoss === BossType.THE_FACELESS && cell.piece?.side === Side.BLACK && cell.piece.type !== PieceType.KING) {
      displayType = PieceType.PAWN;
      displayTooltipName = t.pieces[PieceType.PAWN] + " (?)";
  }

  return (
    <div 
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
           <MotionDiv
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.5 }}
             transition={{ duration: 0.3 }}
             className={`absolute inset-0 pointer-events-none ${getTileEffectStyle(cell.tileEffect)}`}
           >
              {cell.tileEffect === TileEffect.WALL && <span className="absolute inset-0 flex items-center justify-center text-2xl">{GAME_ICONS.TILE_WALL}</span>}
              {cell.tileEffect === TileEffect.FROZEN && <span className="absolute inset-0 flex items-center justify-center text-xl opacity-50">{GAME_ICONS.STATUS_FROZEN}</span>}
              {cell.tileEffect === TileEffect.PROMOTION && <span className="absolute inset-0 flex items-center justify-center text-xl opacity-70 animate-pulse">{GAME_ICONS.TILE_PROMOTION}</span>}
           </MotionDiv>
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
             <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-red-600 text-white px-1 rounded">{GAME_ICONS.CHECK_BADGE}</span>
         </div>
      )}

      {/* Boss Countdown Badge */}
      {bossCountdown !== undefined && bossCountdown !== null && (
          <div className={`absolute -top-3 -right-2 z-50 flex items-center justify-center bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-lg ${bossCountdown === 1 ? 'animate-bounce' : ''}`}>
              <span className="mr-0.5">{GAME_ICONS.STATUS_ASCENDED}</span>{bossCountdown}
          </div>
      )}

      {hasTooltip && (
        <div className={`absolute ${tooltipPositionClass} left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-[100] hidden group-hover:block pointer-events-none shadow-lg border border-slate-700`}>
           {cell.piece ? (
             <div className="flex flex-col items-center gap-1">
               <span className="font-bold text-yellow-400">
                   {cell.piece.side === Side.WHITE ? '' : ''} {displayTooltipName}
               </span>
               {(cell.piece.variant) && <span className="text-orange-300 font-bold">Element: {cell.piece.variant}</span>}
               {(cell.piece.frozenTurns || 0) > 0 && <span className="text-blue-300">{t.tooltips.frozen.replace('{0}', String(cell.piece.frozenTurns))}</span>}
               {(cell.piece.immortalTurns || 0) > 0 && <span className="text-yellow-300">{t.tooltips.immortal.replace('{0}', String(cell.piece.immortalTurns! > 100 ? '∞' : cell.piece.immortalTurns))}</span>}
               {cell.piece.trapped && <span className="text-red-400 font-bold">Suicide Mode (Trap)</span>}
               {cell.piece.mimic && <span className="text-purple-400 font-bold">Mimic</span>}
               {cell.piece.ascendedTurns && <span className="text-cyan-400 font-bold">Ascended ({cell.piece.ascendedTurns} left)</span>}
               
               {cell.piece.tempMoveOverride && <span className="text-purple-300">{t.tooltips.movesLike.replace('{0}', t.pieces[cell.piece.tempMoveOverride])}</span>}
               {isBossPiece && <span className="text-red-500 font-bold uppercase">{t.tooltips.bossAbility}</span>}
               {bossCountdown !== undefined && bossCountdown !== null && <span className="text-red-300 italic">Ability in {bossCountdown} turns</span>}
               {cell.tileEffect !== TileEffect.NONE && <span className="text-[9px] text-slate-400">{t.tooltips.on} {tileInfo.name}</span>}
             </div>
           ) : (
             <div className="font-bold text-orange-400">{tileInfo.name}</div>
           )}
           <div className="text-[8px] text-slate-500 mt-1">Double-click for info</div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {cell.piece && displayType && (
          <MotionDiv
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
            <MotionDiv
              key={displayType}
              initial={{ scale: 0.5, rotateY: 180, filter: "brightness(2)" }}
              animate={{ scale: 1, rotateY: 0, filter: "brightness(1)" }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-full h-full relative"
              style={{ filter: variantStyle }}
            >
               {getPieceIcon(settings.pieceSet, cell.piece.side, displayType)}
               {isBossPiece && (
                   <div className="absolute -top-3 -right-3 text-2xl drop-shadow-md z-30">
                       {GAME_ICONS.BOSS_BADGE}
                   </div>
               )}
               
               {/* Elemental Icons */}
               {cell.piece.variant === 'LAVA' && (
                   <div className="absolute -bottom-1 -right-1 text-xs bg-red-900 text-white rounded-full w-4 h-4 flex items-center justify-center border border-orange-500 shadow-md z-30" title="Lava Element">
                     {GAME_ICONS.ELEMENT_LAVA}
                   </div>
               )}
               {cell.piece.variant === 'ABYSS' && (
                   <div className="absolute -bottom-1 -right-1 text-xs bg-black text-white rounded-full w-4 h-4 flex items-center justify-center border border-purple-500 shadow-md z-30" title="Abyss Element">
                     {GAME_ICONS.ELEMENT_ABYSS}
                   </div>
               )}
               {cell.piece.variant === 'FROZEN' && (
                   <div className="absolute -bottom-1 -right-1 text-xs bg-cyan-700 text-white rounded-full w-4 h-4 flex items-center justify-center border border-cyan-300 shadow-md z-30" title="Frozen Element">
                     {GAME_ICONS.ELEMENT_FROZEN}
                   </div>
               )}
            </MotionDiv>

            <AnimatePresence>
              {(cell.piece.frozenTurns || 0) > 0 && (
                 <MotionDiv 
                   initial={{ scale: 0, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                   exit={{ scale: 0, opacity: 0 }}
                   className="absolute -top-1 -right-1 text-base drop-shadow-md"
                   transition={{ duration: 0.3 }}
                 >
                   {GAME_ICONS.STATUS_FROZEN}
                 </MotionDiv>
              )}
              {(cell.piece.immortalTurns || 0) > 0 && (
                 <MotionDiv 
                   initial={{ scale: 0, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0, opacity: 0 }}
                   className="absolute -top-2 -left-2 text-lg drop-shadow-md bg-white rounded-full w-6 h-6 flex items-center justify-center border border-yellow-500 z-40"
                   transition={{ duration: 0.3 }}
                 >
                   {GAME_ICONS.STATUS_IMMORTAL}
                 </MotionDiv>
              )}
              {cell.piece.trapped && (
                 <MotionDiv 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   className="absolute -bottom-1 -left-1 text-sm drop-shadow-md bg-black rounded-full w-5 h-5 flex items-center justify-center border border-red-500 z-40"
                 >
                   {GAME_ICONS.STATUS_TRAP}
                 </MotionDiv>
              )}
              {cell.piece.mimic && (
                 <MotionDiv 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   className="absolute -top-2 right-1/2 translate-x-1/2 text-sm drop-shadow-md bg-purple-800 rounded-full w-5 h-5 flex items-center justify-center border border-purple-400 z-40"
                 >
                   {GAME_ICONS.STATUS_MIMIC}
                 </MotionDiv>
              )}
              {(cell.piece.ascendedTurns || 0) > 0 && (
                 <MotionDiv 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   className="absolute top-1/2 -right-3 -translate-y-1/2 text-[10px] font-bold bg-cyan-800 text-white rounded px-1 border border-cyan-400 z-40"
                 >
                   {GAME_ICONS.STATUS_ASCENDED}{cell.piece.ascendedTurns}
                 </MotionDiv>
              )}
              {cell.piece.tempMoveOverride && (
                 <MotionDiv 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm"
                 >
                   {GAME_ICONS.STATUS_MOVES_LIKE}
                 </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        )}
      </AnimatePresence>
      
      {isValid && (
         <MotionDiv 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="absolute w-2 h-2 bg-green-500/50 rounded-full pointer-events-none"
         />
      )}
    </div>
  );
};