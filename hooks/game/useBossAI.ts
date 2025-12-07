
import { Cell, TileEffect, BossType, Side, PieceType, Position } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { soundManager } from '../../utils/soundManager';

export const applyBossAbilities = (
    boardState: Cell[][], 
    activeBoss: BossType, 
    bossTiles: Position[], 
    turnCount: number
) => {
    if (activeBoss === BossType.NONE) return { board: boardState, newTiles: [] as Position[] };

    const size = boardState.length;
    const emptyTiles: Position[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!boardState[r][c].piece && boardState[r][c].tileEffect === TileEffect.NONE) {
          emptyTiles.push({ row: r, col: c });
        }
      }
    }

    if (activeBoss !== BossType.STONE_GOLEM) {
      bossTiles.forEach((pos) => {
        if (boardState[pos.row] && boardState[pos.row][pos.col]) {
          if (boardState[pos.row][pos.col].tileEffect !== TileEffect.NONE && boardState[pos.row][pos.col].tileEffect !== TileEffect.WALL) {
            boardState[pos.row][pos.col].tileEffect = TileEffect.NONE;
          }
        }
      });
    }

    const newTiles: Position[] = [];

    // Periodic bosses trigger on Turn 2, 12, 22... (Every 5 rounds starting from first enemy turn)
    const isPeriodicTurn = turnCount % 10 === 2;

    if (activeBoss === BossType.CHAOS_LORD && isPeriodicTurn) {
      if (emptyTiles.length > 0) {
        const spot = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        const chaosPool = [PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT, PieceType.PAWN];
        boardState[spot.row][spot.col].piece = {
          id: uuidv4(), type: chaosPool[Math.floor(Math.random() * chaosPool.length)], side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
        };
        soundManager.playSfx('spawn');
      }
    }

    if (activeBoss === BossType.MIND_CONTROLLER && isPeriodicTurn) {
      const playerPieces: Position[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.side === Side.WHITE && p.type !== PieceType.KING) playerPieces.push({ row: r, col: c });
        }
      }
      if (playerPieces.length > 0) {
        const victimPos = playerPieces[Math.floor(Math.random() * playerPieces.length)];
        boardState[victimPos.row][victimPos.col].piece!.side = Side.BLACK;
        soundManager.playSfx('spawn');
      }
    }

    if (activeBoss === BossType.UNDEAD_LORD && isPeriodicTurn) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.side === Side.BLACK && (p.immortalTurns || 0) > 100) p.immortalTurns = 0;
        }
      }
      const candidates: Position[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.side === Side.BLACK && p.type !== PieceType.KING) candidates.push({ row: r, col: c });
        }
      }
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        boardState[chosen.row][chosen.col].piece!.immortalTurns = 999;
        soundManager.playSfx('spawn');
      }
    }

    if (activeBoss === BossType.STONE_GOLEM) {
      if (isPeriodicTurn) {
        const wallCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < wallCount; i++) {
          if (emptyTiles.length === 0) break;
          const idx = Math.floor(Math.random() * emptyTiles.length);
          const pos = emptyTiles.splice(idx, 1)[0];
          boardState[pos.row][pos.col].tileEffect = TileEffect.WALL;
        }
        soundManager.playSfx('spawn');
      }
      return { board: boardState, newTiles: [] };
    }

    let effectToApply = TileEffect.NONE;
    if (activeBoss === BossType.BLIZZARD_WITCH) effectToApply = TileEffect.FROZEN;
    if (activeBoss === BossType.VOID_BRINGER) effectToApply = TileEffect.HOLE;
    if (activeBoss === BossType.LAVA_TITAN) effectToApply = TileEffect.LAVA;

    if (effectToApply !== TileEffect.NONE) {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        if (emptyTiles.length === 0) break;
        const idx = Math.floor(Math.random() * emptyTiles.length);
        const pos = emptyTiles.splice(idx, 1)[0];
        boardState[pos.row][pos.col].tileEffect = effectToApply;
        newTiles.push(pos);
      }
    }

    return { board: boardState, newTiles };
};
