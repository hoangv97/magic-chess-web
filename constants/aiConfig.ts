
import { PieceType, BossType } from '../types';

/**
 * AI CONFIGURATION
 * These constants determine how the enemy "thinks".
 */

// Search Depth: Higher = Smarter but slower.
// 2 is standard for a responsive web app without web workers.
// 3 allows for basic tactics but might lag slightly on large boards.
export const AI_SEARCH_DEPTH = 2;

// Value of pieces for the AI to prioritize capturing/protecting
export const AI_PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.KING]: 20000, // Losing King is losing game
  [PieceType.QUEEN]: 900,
  [PieceType.AMAZON]: 1200, // Very strong
  [PieceType.CHANCELLOR]: 800,
  [PieceType.ARCHBISHOP]: 800,
  [PieceType.MANN]: 900, // Moves like Queen
  [PieceType.ROOK]: 500,
  [PieceType.SHIP]: 400,
  [PieceType.BISHOP]: 330,
  [PieceType.KNIGHT]: 320,
  [PieceType.UNICORN]: 320,
  [PieceType.ZEBRA]: 310,
  [PieceType.GIRAFFE]: 300,
  [PieceType.CENTAUR]: 300,
  [PieceType.CHAMPION]: 350,
  [PieceType.WIZARD]: 350,
  [PieceType.DRAGON]: 700, // Strong unit
  [PieceType.PAWN]: 100,
  [PieceType.COMMONER]: 100,
  [PieceType.ELEPHANT]: 150, // Limited movement
  [PieceType.FOOL]: 200,     // Unpredictable
};

// Strategic multipliers
export const AI_WEIGHTS = {
  MATERIAL: 1.0,        // Raw piece value
  MOBILITY: 10.0,       // Number of available moves (encourages activity)
  POSITION_CENTER: 5.0, // Controlling the center of the board
  KING_SAFETY: 2.0,     // Keeping the king away from edges/threats (simplified)
  DANGER_TILE: -500.0,  // Penalty for ending turn on Lava
  WIN_GAME: 100000,     // Score for checkmate
};

// Boss Personality Modifiers
// Adjusts the base evaluation based on who the active boss is.
export const BOSS_PERSONALITIES: Record<BossType, { aggression: number; defense: number }> = {
  [BossType.NONE]: { aggression: 1.0, defense: 1.0 },
  [BossType.BLOOD_KING]: { aggression: 1.5, defense: 0.8 }, // Highly aggressive, spawns on kill
  [BossType.STONE_GOLEM]: { aggression: 0.8, defense: 1.5 }, // Defensive
  [BossType.FROST_GIANT]: { aggression: 1.0, defense: 1.2 },
  [BossType.BLIZZARD_WITCH]: { aggression: 1.2, defense: 1.0 },
  [BossType.VOID_BRINGER]: { aggression: 1.2, defense: 1.0 },
  [BossType.LAVA_TITAN]: { aggression: 1.3, defense: 1.0 },
  [BossType.UNDEAD_LORD]: { aggression: 1.0, defense: 1.3 }, // Wants to survive to use ability
  [BossType.CHAOS_LORD]: { aggression: 1.2, defense: 0.8 },
  [BossType.MIRROR_MAGE]: { aggression: 1.0, defense: 1.0 },
  [BossType.SOUL_EATER]: { aggression: 1.4, defense: 1.0 }, // Wants to kill to eat cards
  [BossType.HYDRA]: { aggression: 1.1, defense: 0.5 }, // Doesn't care if units die (they respawn)
  [BossType.MIND_CONTROLLER]: { aggression: 1.0, defense: 1.2 },
  [BossType.SILENCER]: { aggression: 1.1, defense: 1.0 },
  [BossType.ILLUSIONIST]: { aggression: 1.0, defense: 1.0 },
};
