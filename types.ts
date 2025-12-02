

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
}

export enum TileEffect {
  NONE = 'NONE',
  HOLE = 'HOLE', // No piece can go in (but sliders can pass through)
  WALL = 'WALL', // No piece can go in or pass through
  FROZEN = 'FROZEN',   // Go in and cannot move in the next turn (Renamed from MUD)
  LAVA = 'LAVA'  // Died if go in
}

export interface Cell {
  position: Position;
  piece: Piece | null;
  highlight?: boolean; // For valid moves
  targetable?: boolean; // For card targeting
  tileEffect: TileEffect;
}

export enum CardType {
  SPAWN_QUEEN = 'SPAWN_QUEEN',
  SPAWN_ROOK = 'SPAWN_ROOK',
  SPAWN_BISHOP = 'SPAWN_BISHOP',
  SPAWN_KNIGHT = 'SPAWN_KNIGHT',
  SPAWN_PAWN = 'SPAWN_PAWN',
  
  SPAWN_FOOL = 'SPAWN_FOOL',
  SPAWN_SHIP = 'SPAWN_SHIP',
  SPAWN_ELEPHANT = 'SPAWN_ELEPHANT',
  SPAWN_DRAGON = 'SPAWN_DRAGON',
  SPAWN_DRAGON_LAVA = 'SPAWN_DRAGON_LAVA',
  SPAWN_DRAGON_ABYSS = 'SPAWN_DRAGON_ABYSS',
  SPAWN_DRAGON_FROZEN = 'SPAWN_DRAGON_FROZEN',

  SPAWN_CHANCELLOR = 'SPAWN_CHANCELLOR',
  SPAWN_ARCHBISHOP = 'SPAWN_ARCHBISHOP',
  SPAWN_MANN = 'SPAWN_MANN',
  SPAWN_AMAZON = 'SPAWN_AMAZON',
  SPAWN_CENTAUR = 'SPAWN_CENTAUR',
  SPAWN_ZEBRA = 'SPAWN_ZEBRA',
  SPAWN_CHAMPION = 'SPAWN_CHAMPION',

  EFFECT_SWITCH = 'EFFECT_SWITCH', // Switch 2 player pieces
  EFFECT_FREEZE = 'EFFECT_FREEZE', // Freeze random enemy
  EFFECT_LIMIT = 'EFFECT_LIMIT', // Limit enemy moves (implementation: reduce range or random skip?) -> Let's do: Enemy pieces move range = 1
  EFFECT_BORROW_ROOK = 'EFFECT_BORROW_ROOK',
  EFFECT_BORROW_KNIGHT = 'EFFECT_BORROW_KNIGHT',
  EFFECT_BORROW_BISHOP = 'EFFECT_BORROW_BISHOP',
  EFFECT_BACK_BASE = 'EFFECT_BACK_BASE', // Send own piece back to base row
  EFFECT_IMMORTAL = 'EFFECT_IMMORTAL', // Make own piece immortal for 1 turn
}

export interface Card {
  id: string;
  type: CardType;
  title: string;
  description: string;
  cost: number; 
}

export enum RelicType {
  LAST_WILL = 'LAST_WILL',
  NECROMANCY = 'NECROMANCY'
}

export interface Relic {
  type: RelicType;
  level: number;
}

export enum BossType {
  NONE = 'NONE',
  FROST_GIANT = 'FROST_GIANT',
  BLIZZARD_WITCH = 'BLIZZARD_WITCH',
  VOID_BRINGER = 'VOID_BRINGER',
  LAVA_TITAN = 'LAVA_TITAN',
  STONE_GOLEM = 'STONE_GOLEM',
  UNDEAD_LORD = 'UNDEAD_LORD'
}

export interface MapNode {
  id: string;
  level: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  next: string[];
  name?: string;
  bossType?: BossType;
}

export type Language = 'en' | 'vi';
export type BoardThemeId = 'CLASSIC' | 'FOREST' | 'OCEAN' | 'DARK';
export type PieceSetId = 'STANDARD' | 'SIMPLE';

export interface BoardTheme {
  name: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
}

export interface GameSettings {
  boardSize: number;
  enemyCount: number;
  playerCount: number;
  language: Language;
  theme: BoardThemeId;
  pieceSet: PieceSetId;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  customBossType: BossType;
}

export type GamePhase = 
  | 'SETTINGS'
  | 'GLOBAL_SETTINGS'
  | 'DECK_SELECTION'
  | 'MAP'
  | 'PLAYING' 
  | 'GAME_OVER_WIN' 
  | 'GAME_OVER_LOSS'
  | 'REWARD'
  | 'SHOP';