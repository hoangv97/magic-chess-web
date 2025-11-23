import { Cell, Piece, PieceType, Side, Position } from '../types';

export const generateBoard = (size: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        position: { row: r, col: c },
        piece: null,
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
  ignoreCheck: boolean = false // Simplified: we won't strictly enforce 'cannot move into check' for this arcade version to keep flow fast
): Position[] => {
  if (piece.isFrozen) return [];

  const moves: Position[] = [];
  const size = board.length;
  const direction = piece.side === Side.WHITE ? -1 : 1; // White moves UP (-1), Black moves DOWN (+1)

  // Use override type if available (from Borrow card)
  const effectiveType = piece.tempMoveOverride || piece.type;

  const addMove = (r: number, c: number): boolean => {
    // Returns true if we should continue searching in this direction (for sliding pieces)
    if (!isValidPos({ row: r, col: c }, size)) return false;
    const target = board[r][c].piece;
    
    if (target) {
      if (target.side !== piece.side) {
        moves.push({ row: r, col: c }); // Capture
      }
      return false; // Blocked
    }
    
    moves.push({ row: r, col: c }); // Empty
    return true;
  };

  if (effectiveType === PieceType.PAWN) {
    // Forward 1
    const fwdR = currentPos.row + direction;
    if (isValidPos({ row: fwdR, col: currentPos.col }, size) && !board[fwdR][currentPos.col].piece) {
      moves.push({ row: fwdR, col: currentPos.col });
    }
    // Capture
    [[fwdR, currentPos.col - 1], [fwdR, currentPos.col + 1]].forEach(([r, c]) => {
      if (isValidPos({ row: r, col: c }, size)) {
        const target = board[r][c].piece;
        if (target && target.side !== piece.side) {
          moves.push({ row: r, col: c });
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
    // King acts like Queen but distance 1
    // We treat King separately below, but if borrowed type is King (unlikely), handle normally
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      addMove(currentPos.row + dr, currentPos.col + dc);
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
    jumps.forEach(([dr, dc]) => addMove(currentPos.row + dr, currentPos.col + dc));
  }
  
  // Original King Type Logic (moves 1 in any direction) - Redundant if covered above, but safe to keep specific logic if needed
  if (piece.type === PieceType.KING && !piece.tempMoveOverride) {
     [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
       addMove(currentPos.row + dr, currentPos.col + dc);
     });
  }

  return moves;
};
