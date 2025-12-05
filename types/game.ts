
import { BossType } from './map';
import { BoardThemeId } from './board';

export type Language = 'en' | 'vi';
export type PieceSetId = 'STANDARD' | 'SIMPLE';

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
  | 'SHOP'
  | 'REST_SITE'
  | 'EVENT_RESULT';
