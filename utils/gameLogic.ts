import { Cell, Piece, PieceType, Side, Position, TileEffect, BossType } from '../types';
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
  lastMovedPieceType: PieceType | null = null,
  activeBoss: BossType = BossType.NONE
): Position[] => {
  if ((piece.frozenTurns || 0) > 0) return [];

  // Infinite recursion check for Fool copying Fool (shouldn't happen in standard play but good safety)
  if (piece.type === PieceType.FOOL && lastMovedPieceType === PieceType.FOOL) return [];

  const moves: Position[] = [];
  const size = board.length;
  const direction = piece.side === Side.WHITE ? -1 : 1; // White moves UP (-1), Black moves DOWN (+1)

  // Use override type if available (from Borrow card)
  let effectiveType = piece.tempMoveOverride || piece.type;

  // Boss Restrictions
  if (piece.side === Side.WHITE) {
      if (activeBoss === BossType.KNIGHT_SNARE && effectiveType === PieceType.KNIGHT) return [];
      if (activeBoss === BossType.ROOK_BREAKER && effectiveType === PieceType.ROOK) return [];
      if (activeBoss === BossType.BISHOP_BANE && effectiveType === PieceType.BISHOP) return [];
  }

  // Fool Logic: Mimic last moved piece type
  if (effectiveType === PieceType.FOOL) {
      if (lastMovedPieceType) {
          effectiveType = lastMovedPieceType;
      } else {
          return []; // Cannot move if no enemy moved yet
      }
  }

  // Ship & Elephant can enter walls (to break them)
  const canBreakWall = piece.type === PieceType.SHIP || piece.type === PieceType.ELEPHANT;
  
  // Dragons (and variants) can enter Abyss/Lava without dying immediately (handled in executeMove, here we just allow validity)
  const ignoresTerrain = piece.type === PieceType.DRAGON;

  // Ship cannot capture
  const canCapture = piece.type !== PieceType.SHIP;

  const isMoveableTo = (r: number, c: number): boolean => {
     if (!isValidPos({row: r, col: c}, size)) return false;
     const tile = board[r][c];
     
     if (tile.tileEffect === TileEffect.WALL && !canBreakWall) return false;
     
     if (tile.tileEffect === TileEffect.HOLE && !ignoresTerrain) {
         // Sliders usually skip over holes in logic below, but strictly 'landing' on hole is normally bad
         // But here we define valid moves. 'HOLE' usually means you can't land.
         // Unless you are a dragon.
         return false; 
     }
     
     // Cannot capture immortal pieces
     if (tile.piece && tile.piece.side !== piece.side && (tile.piece.immortalTurns || 0) > 0) return false;
     
     return true;
  };

  const addMove = (r: number, c: number): boolean => {
    // Returns true if we should continue searching in this direction (for sliding pieces)
    if (!isValidPos({ row: r, col: c }, size)) return false;
    
    const cell = board[r][c];
    
    // WALL blocks movement unless we can break it
    if (cell.tileEffect === TileEffect.WALL) {
        if (canBreakWall) {
            moves.push({ row: r, col: c });
        }
        return false; // Stop sliding at wall (either blocked or break it)
    }

    const target = cell.piece;
    if (target) {
      if (target.side !== piece.side) {
        // Can capture? 
        if (canCapture && cell.tileEffect !== TileEffect.HOLE && !(target.immortalTurns && target.immortalTurns > 0)) {
           moves.push({ row: r, col: c }); 
        }
      }
      return false; // Blocked by piece (enemy or friendly)
    }
    
    // HOLE: Cannot land unless ignoresTerrain.
    if (cell.tileEffect !== TileEffect.HOLE || ignoresTerrain) {
        moves.push({ row: r, col: c }); // Empty and valid
    }
    
    return true;
  };

  // Movement Capability Flags
  const hasPawnMoves = effectiveType === PieceType.PAWN || effectiveType === PieceType.ZEBRA || effectiveType === PieceType.CHAMPION;
  const hasRookMoves = effectiveType === PieceType.ROOK || effectiveType === PieceType.QUEEN || effectiveType === PieceType.SHIP || effectiveType === PieceType.CHANCELLOR || effectiveType === PieceType.MANN || effectiveType === PieceType.AMAZON;
  const hasBishopMoves = effectiveType === PieceType.BISHOP || effectiveType === PieceType.QUEEN || effectiveType === PieceType.ARCHBISHOP || effectiveType === PieceType.MANN || effectiveType === PieceType.AMAZON || effectiveType === PieceType.CHAMPION;
  const hasKnightMoves = effectiveType === PieceType.KNIGHT || effectiveType === PieceType.DRAGON || effectiveType === PieceType.CHANCELLOR || effectiveType === PieceType.ARCHBISHOP || effectiveType === PieceType.AMAZON || effectiveType === PieceType.CENTAUR || effectiveType === PieceType.ZEBRA;
  const hasKingMoves = effectiveType === PieceType.KING || effectiveType === PieceType.CENTAUR;

  if (hasPawnMoves) {
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
    if (canCapture) {
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
            const victimRow = r - direction;
            const victim = board[victimRow][c].piece;
            if (victim && !(victim.immortalTurns && victim.immortalTurns > 0)) {
                moves.push({ row: r, col: c });
            }
            }
        }
        });
    }
  }

  // Elephant: Forward 1 only (uses direction), can break wall.
  if (effectiveType === PieceType.ELEPHANT) {
      const fwdR = currentPos.row + direction;
      // Capture forward or move forward or break wall forward
      if (isValidPos({ row: fwdR, col: currentPos.col }, size)) {
          const cell = board[fwdR][currentPos.col];
          if (cell.tileEffect === TileEffect.WALL) {
              moves.push({ row: fwdR, col: currentPos.col }); // Break wall
          } else if (cell.tileEffect !== TileEffect.HOLE) {
              if (cell.piece) {
                  if (cell.piece.side !== piece.side && !(cell.piece.immortalTurns && cell.piece.immortalTurns > 0)) {
                      moves.push({ row: fwdR, col: currentPos.col }); // Capture
                  }
              } else {
                  moves.push({ row: fwdR, col: currentPos.col }); // Move
              }
          }
      }
  }

  const directions: number[][] = [];
  if (hasRookMoves) {
    directions.push([0, 1], [0, -1], [1, 0], [-1, 0]);
  }
  if (hasBishopMoves) {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  }
  if (hasKingMoves) {
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      const r = currentPos.row + dr;
      const c = currentPos.col + dc;
      if (isMoveableTo(r, c)) {
         addMove(r, c);
      }
    });
  }
  
  // Sliding moves logic for Rook, Bishop, Queen, Ship etc
  if (hasRookMoves || hasBishopMoves) {
    directions.forEach(([dr, dc]) => {
      let r = currentPos.row + dr;
      let c = currentPos.col + dc;
      while (addMove(r, c)) {
        r += dr;
        c += dc;
      }
    });
  }

  if (hasKnightMoves) {
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