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
  enPassantTarget: Position | null = null,
  ignoreCheck: boolean = false 
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
      
      // Forward 2 (Initial move)
      const startRow = piece.side === Side.WHITE ? size - 2 : 1; // Correct start row based on board generation logic (spawns in top/bottom 2 rows usually, but standard chess is specific. We allow 2-step from "start" position if hasn't moved)
      if (!piece.hasMoved && currentPos.row === startRow) {
          const fwd2R = currentPos.row + (direction * 2);
          if (isValidPos({ row: fwd2R, col: currentPos.col }, size) && !board[fwd2R][currentPos.col].piece) {
             moves.push({ row: fwd2R, col: currentPos.col });
          }
      }
    }

    // Capture (Diagonal) including En Passant
    [[fwdR, currentPos.col - 1], [fwdR, currentPos.col + 1]].forEach(([r, c]) => {
      if (isValidPos({ row: r, col: c }, size)) {
        const target = board[r][c].piece;
        
        // Normal Capture
        if (target && target.side !== piece.side) {
          moves.push({ row: r, col: c });
        } 
        // En Passant Capture
        else if (enPassantTarget && enPassantTarget.row === r && enPassantTarget.col === c) {
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
  
  if (piece.type === PieceType.KING && !piece.tempMoveOverride) {
     [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
       addMove(currentPos.row + dr, currentPos.col + dc);
     });
  }

  return moves;
};