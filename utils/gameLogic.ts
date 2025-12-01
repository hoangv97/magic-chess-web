



import { Cell, Piece, PieceType, Side, Position, TileEffect } from '../types';
import { TEST_GENERATE_SPECIAL_TILES } from '../constants';

export const generateBoard = (size: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      let effect = TileEffect.NONE;
      
      if (TEST_GENERATE_SPECIAL_TILES) {
        // Avoid spawn areas for Kings (approximate)
        if (r > 1 && r < size - 2) {
          const rand = Math.random();
          if (rand < 0.05) effect = TileEffect.HOLE;
          else if (rand < 0.10) effect = TileEffect.WALL;
          else if (rand < 0.15) effect = TileEffect.FROZEN;
          else if (rand < 0.20) effect = TileEffect.LAVA;
        }
      }

      row.push({
        position: { row: r, col: c },
        piece: null,
        tileEffect: effect
      });
    }
    board.push(row);
  }
  return board;
};

export const isValidPos = (pos: Position, size: number) => {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size;
};

export const getPieceAt = (board: Cell[][], pos: Position): Piece | null => {
  if (!isValidPos(pos, board.length)) return null;
  return board[pos.row][pos.col].piece;
};

// Simplified movement logic
export const getValidMoves = (
  board: Cell[][],
  piece: Piece,
  currentPos: Position,
  enPassantTarget: Position | null = null,
  ignoreCheck: boolean = false 
): Position[] => {
  if ((piece.frozenTurns || 0) > 0) return [];

  const moves: Position[] = [];
  const size = board.length;
  const direction = piece.side === Side.WHITE ? -1 : 1; // White moves UP (-1), Black moves DOWN (+1)

  // Use override type if available (from Borrow card)
  const effectiveType = piece.tempMoveOverride || piece.type;

  const isMoveableTo = (r: number, c: number): boolean => {
     if (!isValidPos({row: r, col: c}, size)) return false;
     const tile = board[r][c];
     if (tile.tileEffect === TileEffect.WALL) return false;
     if (tile.tileEffect === TileEffect.HOLE) return false; // Cannot land on hole
     // Cannot capture immortal pieces
     if (tile.piece && tile.piece.side !== piece.side && (tile.piece.immortalTurns || 0) > 0) return false;
     return true;
  };

  const addMove = (r: number, c: number): boolean => {
    // Returns true if we should continue searching in this direction (for sliding pieces)
    if (!isValidPos({ row: r, col: c }, size)) return false;
    
    const cell = board[r][c];
    
    // WALL blocks movement and line of sight
    if (cell.tileEffect === TileEffect.WALL) return false;

    const target = cell.piece;
    if (target) {
      if (target.side !== piece.side) {
        // Can capture? Only if not HOLE and not IMMORTAL
        if (cell.tileEffect !== TileEffect.HOLE && !(target.immortalTurns && target.immortalTurns > 0)) {
           moves.push({ row: r, col: c }); 
        }
      }
      return false; // Blocked by piece (enemy or friendly)
    }
    
    // HOLE: Cannot land, but if we are here (and not blocked by piece/wall), we can pass through (return true)
    if (cell.tileEffect !== TileEffect.HOLE) {
        moves.push({ row: r, col: c }); // Empty and valid
    }
    
    return true;
  };

  if (effectiveType === PieceType.PAWN) {
    // Forward 1
    const fwdR = currentPos.row + direction;
    if (isValidPos({ row: fwdR, col: currentPos.col }, size)) {
       const cell = board[fwdR][currentPos.col];
       if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) {
           moves.push({ row: fwdR, col: currentPos.col });
           
           // Forward 2
           const startRow = piece.side === Side.WHITE ? size - 2 : 1;
           if (!piece.hasMoved && currentPos.row === startRow) {
              const fwd2R = currentPos.row + (direction * 2);
              if (isValidPos({ row: fwd2R, col: currentPos.col }, size)) {
                  const cell2 = board[fwd2R][currentPos.col];
                  if (!cell2.piece && cell2.tileEffect !== TileEffect.WALL && cell2.tileEffect !== TileEffect.HOLE) {
                     moves.push({ row: fwd2R, col: currentPos.col });
                  }
              }
           }
       }
    }

    // Capture (Diagonal) including En Passant
    [[fwdR, currentPos.col - 1], [fwdR, currentPos.col + 1]].forEach(([r, c]) => {
      if (isValidPos({ row: r, col: c }, size)) {
        const cell = board[r][c];
        if (cell.tileEffect === TileEffect.WALL || cell.tileEffect === TileEffect.HOLE) return;

        const target = cell.piece;
        // Normal Capture
        if (target && target.side !== piece.side) {
          if (!(target.immortalTurns && target.immortalTurns > 0)) {
             moves.push({ row: r, col: c });
          }
        } 
        // En Passant Capture
        else if (enPassantTarget && enPassantTarget.row === r && enPassantTarget.col === c) {
           // Check if the pawn being captured is immortal (needs board check, assumed simpler here for now)
           // But En Passant captures the piece 'behind' movement.
           // For simplicity, let's assume if you can EP, you can. 
           // Technically should check if victim is immortal.
           const victimRow = r - direction;
           const victim = board[victimRow][c].piece;
           if (victim && !(victim.immortalTurns && victim.immortalTurns > 0)) {
               moves.push({ row: r, col: c });
           }
        }
      }
    });
  }

  const directions: number[][] = [];
  if (effectiveType === PieceType.ROOK || effectiveType === PieceType.QUEEN) {
    directions.push([0, 1], [0, -1], [1, 0], [-1, 0]);
  }
  if (effectiveType === PieceType.BISHOP || effectiveType === PieceType.QUEEN) {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  }
  if (effectiveType === PieceType.KING) {
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      const r = currentPos.row + dr;
      const c = currentPos.col + dc;
      if (isMoveableTo(r, c)) {
         // Special check for King move - simple addMove logic might need isMoveableTo wrapper?
         // addMove handles capture logic inside.
         // But isMoveableTo checks obstacle logic before even trying.
         // Let's rely on addMove but double check blocking.
         addMove(r, c);
      }
    });
  }
  
  // Sliding moves logic for Rook, Bishop, Queen
  if (effectiveType === PieceType.ROOK || effectiveType === PieceType.BISHOP || effectiveType === PieceType.QUEEN) {
    directions.forEach(([dr, dc]) => {
      let r = currentPos.row + dr;
      let c = currentPos.col + dc;
      while (addMove(r, c)) {
        r += dr;
        c += dc;
      }
    });
  }

  if (effectiveType === PieceType.KNIGHT) {
    const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    jumps.forEach(([dr, dc]) => {
        const r = currentPos.row + dr;
        const c = currentPos.col + dc;
        if (isMoveableTo(r, c)) {
            addMove(r, c);
        }
    });
  }
  
  return moves;
};
