
import { Cell, PieceType, Side, BossType, Position, TileEffect } from '../types';
import { getValidMoves } from './gameLogic';
import { AI_SEARCH_DEPTH, AI_PIECE_VALUES, AI_WEIGHTS, BOSS_PERSONALITIES } from '../constants/aiConfig';

/**
 * Main function to get the best move for the AI.
 * Uses Minimax with Alpha-Beta Pruning.
 */
export const getBestEnemyMove = (
  board: Cell[][],
  activeBoss: BossType,
  lastPlayerMoveFrom: Position | null, // For En Passant/Fool calculations
  lastPlayerMoveTo: Position | null,
  lastMovedPieceType: PieceType | null
): { from: Position; to: Position } | null => {
  
  // Create a deep copy of the board to prevent mutation during simulation
  const boardClone = JSON.parse(JSON.stringify(board));
  
  let bestScore = -Infinity;
  let bestMove: { from: Position; to: Position } | null = null;
  let moves = getAllMoves(boardClone, Side.BLACK, lastPlayerMoveTo, lastMovedPieceType);

  // Optimization: Shuffle moves to prevent deterministic loops in equal states
  moves = moves.sort(() => Math.random() - 0.5);

  // Optimization: Sort moves to check captures first (Alpha-Beta pruning works best this way)
  moves.sort((a, b) => {
    const pieceA = board[a.to.row][a.to.col].piece;
    const pieceB = board[b.to.row][b.to.col].piece;
    const valA = pieceA ? AI_PIECE_VALUES[pieceA.type] : 0;
    const valB = pieceB ? AI_PIECE_VALUES[pieceB.type] : 0;
    return valB - valA;
  });

  // Run Minimax
  for (const move of moves) {
    const simulatedBoard = simulateMove(boardClone, move);
    
    // Pass enPassantTarget as null for simplicity in recursion, or calculate it if needed
    const score = minimax(
      simulatedBoard, 
      AI_SEARCH_DEPTH - 1, 
      false, 
      -Infinity, 
      Infinity, 
      activeBoss, 
      move.to, // New "last move" for Fool logic in deeper recursion
      boardClone[move.from.row][move.from.col].piece?.type || null
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

/**
 * Minimax Recursive Function
 */
const minimax = (
  board: Cell[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  activeBoss: BossType,
  lastMoveTo: Position | null,
  lastMovedPieceType: PieceType | null
): number => {
  
  // Leaf node: return static evaluation
  if (depth === 0) {
    return evaluateBoard(board, activeBoss, Side.BLACK);
  }

  // Check for Game Over states (King captured) inside evaluation or via move generation check
  if (isGameOver(board)) {
     // If we are maximizing (Black Turn) and game is over, it means Black lost in previous turn (White moved)
     // If we are minimizing (White Turn) and game is over, it means White lost (Black moved)
     return isMaximizing ? -AI_WEIGHTS.WIN_GAME : AI_WEIGHTS.WIN_GAME;
  }

  const side = isMaximizing ? Side.BLACK : Side.WHITE;
  const moves = getAllMoves(board, side, lastMoveTo, lastMovedPieceType);

  if (moves.length === 0) {
    // Stalemate or Checkmate logic could go here. For now, treat no moves as bad for current side.
    return isMaximizing ? -AI_WEIGHTS.WIN_GAME : AI_WEIGHTS.WIN_GAME;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const evalScore = minimax(
          simulatedBoard, 
          depth - 1, 
          false, 
          alpha, 
          beta, 
          activeBoss, 
          move.to, 
          board[move.from.row][move.from.col].piece?.type || null
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Prune
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      const evalScore = minimax(
          simulatedBoard, 
          depth - 1, 
          true, 
          alpha, 
          beta, 
          activeBoss, 
          move.to, 
          board[move.from.row][move.from.col].piece?.type || null
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Prune
    }
    return minEval;
  }
};

/**
 * Static Evaluation Function
 * Returns a score relative to Black (Positive = Good for Black)
 */
const evaluateBoard = (board: Cell[][], activeBoss: BossType, turn: Side): number => {
  let score = 0;
  const size = board.length;
  const center = size / 2;
  const bossStats = BOSS_PERSONALITIES[activeBoss] || BOSS_PERSONALITIES[BossType.NONE];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = board[r][c];
      const piece = cell.piece;

      if (piece) {
        // 1. Material Value
        const baseValue = AI_PIECE_VALUES[piece.type] || 10;
        let value = baseValue;

        // Boss aggression multiplier
        if (piece.side === Side.BLACK) value *= bossStats.defense; // Value my own pieces based on defense stat
        else value *= bossStats.aggression; // Value enemy pieces (as targets) based on aggression stat

        // 2. Positional Value (Control Center)
        const distFromCenter = Math.abs(r - center) + Math.abs(c - center);
        const positionScore = (size - distFromCenter) * AI_WEIGHTS.POSITION_CENTER;
        
        // 3. Tile Safety (Don't stand in Lava unless immune)
        if (cell.tileEffect === TileEffect.LAVA && piece.type !== PieceType.DRAGON && (piece.immortalTurns || 0) <= 0) {
            value -= AI_WEIGHTS.DANGER_TILE; // Massive penalty if I'm on lava, Massive bonus if Enemy is on lava
        }

        // Apply Score
        if (piece.side === Side.BLACK) {
          score += (value + positionScore);
        } else {
          score -= (value + positionScore);
        }
      }
    }
  }

  // 4. Mobility (Bonus for having more moves)
  // Calculating exact moves for every piece is expensive for evaluation function.
  // We skip this in the deepest leaf node for performance, or approximate it.
  
  return score;
};

/**
 * Helper: Generate all possible moves for a side
 */
const getAllMoves = (
    board: Cell[][], 
    side: Side, 
    lastEnPassantTarget: Position | null, // Simplified: treating moveTo as potential EP target
    lastMovedPieceType: PieceType | null
): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  const size = board.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const piece = board[r][c].piece;
      if (piece && piece.side === side && (piece.frozenTurns || 0) <= 0) {
        const validDestinations = getValidMoves(board, piece, { row: r, col: c }, lastEnPassantTarget, lastMovedPieceType);
        
        for (const dest of validDestinations) {
            moves.push({ from: { row: r, col: c }, to: dest });
        }
      }
    }
  }
  return moves;
};

/**
 * Helper: Simulate a move on a cloned board
 * Returns the new board state
 */
const simulateMove = (board: Cell[][], move: { from: Position; to: Position }): Cell[][] => {
  // We assume board is already a clone or we clone it here. 
  // Since minimax calls this recursively, we need a fresh copy for this branch.
  const newBoard = JSON.parse(JSON.stringify(board)); // Simple deep copy
  
  const piece = newBoard[move.from.row][move.from.col].piece;
  if (!piece) return newBoard; // Should not happen

  // Handle Capture
  // Logic simplified: we don't need to handle complex on-death effects (like Hydra spawns) 
  // inside the AI simulation unless we want perfect prediction. 
  // For Depth 2 search, basic material capture is sufficient.

  // Update Piece Position
  newBoard[move.to.row][move.to.col].piece = { ...piece, hasMoved: true };
  newBoard[move.from.row][move.from.col].piece = null;

  // Handle Walls breaking (Elephant/Ship)
  if (newBoard[move.to.row][move.to.col].tileEffect === TileEffect.WALL) {
      if (piece.type === PieceType.ELEPHANT || piece.type === PieceType.SHIP) {
          newBoard[move.to.row][move.to.col].tileEffect = TileEffect.NONE;
      }
  }

  return newBoard;
};

/**
 * Helper: Check if Kings exist
 */
const isGameOver = (board: Cell[][]): boolean => {
    let whiteKing = false;
    let blackKing = false;
    
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board.length; c++) {
            const p = board[r][c].piece;
            if (p?.type === PieceType.KING) {
                if (p.side === Side.WHITE) whiteKing = true;
                if (p.side === Side.BLACK) blackKing = true;
            }
        }
    }
    return !whiteKing || !blackKing;
};
