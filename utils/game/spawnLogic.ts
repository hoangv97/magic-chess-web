
import { v4 as uuidv4 } from 'uuid';
import { Cell, Side, PieceType, TileEffect } from '../../types';
import { soundManager } from '../soundManager';

export const spawnRelicPiece = (boardState: Cell[][], side: Side, type: PieceType) => {
    const size = boardState.length;
    const baseRows = side === Side.WHITE ? [size - 1, size - 2] : [0, 1];
    const validSpots: {row: number, col: number}[] = [];
    baseRows.forEach((r) => {
      for (let c = 0; c < size; c++) {
        const cell = boardState[r][c];
        if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) {
          validSpots.push({ row: r, col: c });
        }
      }
    });
    if (validSpots.length > 0) {
      const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
      boardState[spot.row][spot.col].piece = {
        id: uuidv4(), type: type, side: side, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
      };
      soundManager.playSfx('spawn');
    }
};
