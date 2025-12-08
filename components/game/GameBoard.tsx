




import React from 'react';
import { Cell, Side, Position, PieceType, CardType, TileEffect, GameSettings, BossType } from '../../types';
import { BOARD_THEMES } from '../../constants';
import { BoardSquare } from './board/BoardSquare';

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
  turnCount: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, onSquareClick, onSquareDoubleClick, selectedCardId, cardTargetMode, settings, selectedEnemyPos, enemyValidMoves, checkState, activeBoss, turnCount
}) => {
  const theme = BOARD_THEMES[settings.theme];

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

  // Bosses with every-5-turns effect
  const periodicBosses = [BossType.STONE_GOLEM, BossType.UNDEAD_LORD, BossType.CHAOS_LORD, BossType.MIND_CONTROLLER, BossType.CURSE_WEAVER];

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
             const isSelected = selectedPiecePos?.row === r && selectedPiecePos?.col === c;
             const isEnemySelected = selectedEnemyPos?.row === r && selectedEnemyPos?.col === c;
             
             const isValid = validMoves.some(m => m.row === r && m.col === c);
             const isEnemyValid = enemyValidMoves.some(m => m.row === r && m.col === c);

             const isLastFrom = lastMoveFrom?.row === r && lastMoveFrom?.col === c;
             const isLastTo = lastMoveTo?.row === r && lastMoveTo?.col === c;
             const size = board.length;

             const isCardTarget = !!(selectedCardId && cardTargetMode && (
                (cardTargetMode.type.includes('SPAWN') && r >= size - 2 && !cell.piece) ||
                (cardTargetMode.type.includes('SWITCH') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('BORROW') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('IMMORTAL') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('MIMIC') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('AREA_FREEZE') && cell.piece?.side === Side.WHITE) ||
                (cardTargetMode.type.includes('ASCEND') && cell.piece?.side === Side.WHITE && cell.piece.type === PieceType.PAWN) ||
                (cardTargetMode.type.includes('BACK') && cell.piece?.side === Side.WHITE && cell.piece.type !== PieceType.KING)
             ));

             const isKing = cell.piece?.type === PieceType.KING;
             const isUnderCheck = !!(isKing && checkState && (
               (cell.piece?.side === Side.WHITE && checkState.white) ||
               (cell.piece?.side === Side.BLACK && checkState.black)
             ));
             
             const isBossPiece = activeBoss && activeBoss !== BossType.NONE && isKing && cell.piece?.side === Side.BLACK;
             
             // Calculate Countdown for Periodic Bosses
             // Triggers on Enemy Turn 2, 12, 22... (Every 5 full rounds starting from first enemy turn)
             let bossCountdown: number | null = null;
             if (!!isBossPiece && activeBoss && periodicBosses.includes(activeBoss)) {
                 const diff = (turnCount - 2) % 10;
                 const normalizedDiff = diff < 0 ? diff + 10 : diff;
                 // If diff is 0, it's the active turn (2, 12, 22). 
                 const turnsUntil = normalizedDiff === 0 ? 0 : 10 - normalizedDiff;
                 bossCountdown = Math.ceil(turnsUntil / 2);
             }

             return (
               <BoardSquare 
                 key={`${r}-${c}`}
                 cell={cell}
                 r={r}
                 c={c}
                 size={size}
                 isSelected={isSelected}
                 isEnemySelected={isEnemySelected}
                 isCardTarget={isCardTarget}
                 isLastFrom={isLastFrom}
                 isLastTo={isLastTo}
                 isValid={isValid}
                 isEnemyValid={isEnemyValid}
                 isUnderCheck={isUnderCheck}
                 isBossPiece={!!isBossPiece}
                 bossCountdown={bossCountdown}
                 theme={theme}
                 settings={settings}
                 onSquareClick={onSquareClick}
                 onSquareDoubleClick={onSquareDoubleClick}
                 getTileEffectStyle={getTileEffectStyle}
                 activeBoss={activeBoss}
               />
             );
           })
         ))}
       </div>
    </div>
  );
};
