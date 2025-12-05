
import { Piece, Position } from './piece';

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

export type BoardThemeId = 'CLASSIC' | 'FOREST' | 'OCEAN' | 'DARK';

export interface BoardTheme {
  name: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
}
