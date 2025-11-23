export enum PieceType {
  KING = 'KING',
  QUEEN = 'QUEEN',
  ROOK = 'ROOK',
  BISHOP = 'BISHOP',
  KNIGHT = 'KNIGHT',
  PAWN = 'PAWN'
}

export enum Side {
  WHITE = 'WHITE', // Player
  BLACK = 'BLACK'  // Enemy
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  side: Side;
  hasMoved: boolean;
  tempMoveOverride?: PieceType; // For "Borrow" card
  isFrozen?: boolean; // For "Freeze" card
}

export interface Cell {
  position: Position;
  piece: Piece | null;
  highlight?: boolean; // For valid moves
  targetable?: boolean; // For card targeting
}

export enum CardType {
  SPAWN_QUEEN = 'SPAWN_QUEEN',
  SPAWN_ROOK = 'SPAWN_ROOK',
  SPAWN_BISHOP = 'SPAWN_BISHOP',
  SPAWN_KNIGHT = 'SPAWN_KNIGHT',
  SPAWN_PAWN = 'SPAWN_PAWN',
  EFFECT_SWITCH = 'EFFECT_SWITCH', // Switch 2 player pieces
  EFFECT_FREEZE = 'EFFECT_FREEZE', // Freeze random enemy
  EFFECT_LIMIT = 'EFFECT_LIMIT', // Limit enemy moves (implementation: reduce range or random skip?) -> Let's do: Enemy pieces move range = 1
  EFFECT_BORROW_ROOK = 'EFFECT_BORROW_ROOK',
  EFFECT_BORROW_KNIGHT = 'EFFECT_BORROW_KNIGHT',
  EFFECT_BORROW_BISHOP = 'EFFECT_BORROW_BISHOP',
  EFFECT_BACK_BASE = 'EFFECT_BACK_BASE', // Send own piece back to base row
}

export interface Card {
  id: string;
  type: CardType;
  title: string;
  description: string;
  cost?: number; // Potential future feature
}

export interface GameSettings {
  boardSize: number;
  enemyCount: number;
  playerCount: number;
}

export type GamePhase = 'SETTINGS' | 'PLAYING' | 'GAME_OVER_WIN' | 'GAME_OVER_LOSS';