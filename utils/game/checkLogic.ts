
import { Cell, Side, PieceType, Position, Card } from '../../types';
import { getValidMoves } from '../gameLogic';

export const calculateCheckState = (boardState: Cell[][]) => {
    const isSideInCheck = (side: Side): boolean => {
      let kingPos: Position | null = null;
      const size = boardState.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.type === PieceType.KING && p.side === side) {
            kingPos = { row: r, col: c };
            break;
          }
        }
        if (kingPos) break;
      }
      if (!kingPos) return false;
      const enemySide = side === Side.WHITE ? Side.BLACK : Side.WHITE;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.side === enemySide) {
            const moves = getValidMoves(boardState, p, { row: r, col: c }, null, null);
            if (moves.some((m) => m.row === kingPos!.row && m.col === kingPos!.col)) return true;
          }
        }
      }
      return false;
    };
    return { white: isSideInCheck(Side.WHITE), black: isSideInCheck(Side.BLACK) };
};

export const checkLossCondition = (currentBoard: Cell[][], currentDeck: Card[], currentHand: Card[]) => {
    let whitePieces = 0;
    let whiteKing = false;
    currentBoard.forEach((row) => row.forEach((cell) => {
        if (cell.piece?.side === Side.WHITE) {
          if (cell.piece.type === PieceType.KING) whiteKing = true;
          else whitePieces++;
        }
    }));
    if (!whiteKing) return true;
    if (currentDeck.length === 0 && currentHand.length === 0 && whitePieces === 0) return true;
    return false;
};

export const checkWinCondition = (currentBoard: Cell[][]) => {
    let blackPieces = 0;
    let blackKing = false;
    currentBoard.forEach((row) => row.forEach((cell) => {
        if (cell.piece?.side === Side.BLACK) {
          if (cell.piece.type === PieceType.KING) blackKing = true;
          else blackPieces++;
        }
    }));
    if (!blackKing) return true;
    if (blackPieces === 0) return true;
    return false;
};
