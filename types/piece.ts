
export enum PieceType {
  KING = 'KING',
  QUEEN = 'QUEEN',
  ROOK = 'ROOK',
  BISHOP = 'BISHOP',
  KNIGHT = 'KNIGHT',
  PAWN = 'PAWN',
  ELEPHANT = 'ELEPHANT',
  GIRAFFE = 'GIRAFFE',
  UNICORN = 'UNICORN',
  ZEBRA = 'ZEBRA',
  MANN = 'MANN',
  CENTAUR = 'CENTAUR',
  COMMONER = 'COMMONER',
  CHAMPION = 'CHAMPION',
  WIZARD = 'WIZARD',
  FOOL = 'FOOL',
  ARCHBISHOP = 'ARCHBISHOP',
  CHANCELLOR = 'CHANCELLOR',
  AMAZON = 'AMAZON',
  DRAGON = 'DRAGON',
  SHIP = 'SHIP',
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
  frozenTurns?: number; // Replaced boolean with counter. 0 = not frozen.
  immortalTurns?: number; // If > 0, cannot be captured
  variant?: 'LAVA' | 'ABYSS' | 'FROZEN'; // For Elemental Dragons
  
  // New Mechanics
  trapped?: boolean; // Suicide mode: kills attacker
  mimic?: boolean; // Transforms into enemy on kill
  ascendedTurns?: number; // Turns until death for Ascend card
}
