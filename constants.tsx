
import React from 'react';
import { PieceType, CardType, Card, RelicType, MapNode } from './types';

export const PIECE_ICONS: Record<PieceType, React.ReactNode> = {
  [PieceType.KING]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="currentColor" />
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12H13.5c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7" fill="currentColor" />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
      </g>
    </svg>
  ),
  [PieceType.QUEEN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="currentColor" stroke="none">
          <circle cx="6" cy="12" r="2.75" />
          <circle cx="14" cy="9" r="2.75" />
          <circle cx="22.5" cy="8" r="2.75" />
          <circle cx="31" cy="9" r="2.75" />
          <circle cx="39" cy="12" r="2.75" />
        </g>
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14.5V25l-7-11 2 12zM11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="currentColor" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0" fill="currentColor" />
      </g>
    </svg>
  ),
  [PieceType.ROOK]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5c0 2.857-2.243 5.357-5 5.357h-7c-2.757 0-5-2.5-5-5.357V17" fill="currentColor" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" fill="none" stroke="currentColor" strokeLinejoin="miter" />
      </g>
    </svg>
  ),
  [PieceType.BISHOP]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="currentColor" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 9.108-4.36 5.37-11.45C9.64 22.45 15 9 22.5 9c7.5 0 12.86 13.45 8.13 15.55C26.892 31.64 32.61 35.03 36 36" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter" />
      </g>
    </svg>
  ),
  [PieceType.KNIGHT]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="currentColor" />
        <path d="M24 18c.38 2.32-2.43 2.65-1.97 5.03C20.48 24.32 25.53 24 25.53 24v-8.7z" fill="currentColor" />
        <path d="M15.13 38.67C12.3 35.58 10.9 30 15 23.95c1.3-3.66 4.67-4.16 4.67-4.16" />
        <g fill="currentColor" stroke="none">
          <circle cx="21" cy="14" r="1.5" />
          <circle cx="27" cy="12" r="1.5" />
        </g>
      </g>
    </svg>
  ),
  [PieceType.PAWN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-current stroke-black stroke-[1.5]">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="currentColor" strokeLinecap="round" />
    </svg>
  ),
};

export const DECK_TEMPLATE: Omit<Card, 'id'>[] = [
  { type: CardType.SPAWN_QUEEN, title: "Summon Queen", description: "Spawn a Queen on your base rows.", cost: 120 },
  { type: CardType.SPAWN_ROOK, title: "Summon Rook", description: "Spawn a Rook on your base rows.", cost: 60 },
  { type: CardType.SPAWN_KNIGHT, title: "Summon Knight", description: "Spawn a Knight on your base rows.", cost: 50 },
  { type: CardType.SPAWN_BISHOP, title: "Summon Bishop", description: "Spawn a Bishop on your base rows.", cost: 50 },
  { type: CardType.SPAWN_PAWN, title: "Summon Pawn", description: "Spawn a Pawn on your base rows.", cost: 20 },
  { type: CardType.SPAWN_PAWN, title: "Summon Pawn", description: "Spawn a Pawn on your base rows.", cost: 20 },
  { type: CardType.EFFECT_SWITCH, title: "Swap Tactics", description: "Switch positions of two of your pieces.", cost: 30 },
  { type: CardType.EFFECT_FREEZE, title: "Glacial Glare", description: "Freeze a random enemy piece for one turn.", cost: 40 },
  { type: CardType.EFFECT_LIMIT, title: "Muddy Terrain", description: "Limit enemy movement range to 1 tile next turn.", cost: 45 },
  { type: CardType.EFFECT_BORROW_ROOK, title: "Rook's Spirit", description: "Target piece moves like a Rook this turn.", cost: 50 },
  { type: CardType.EFFECT_BORROW_KNIGHT, title: "Knight's Leap", description: "Target piece moves like a Knight this turn.", cost: 45 },
  { type: CardType.EFFECT_BORROW_BISHOP, title: "Bishop's Sight", description: "Target piece moves like a Bishop this turn.", cost: 45 },
  { type: CardType.EFFECT_BACK_BASE, title: "Recall", description: "Return one of your pieces to the base row.", cost: 15 },
];

export const STARTER_DECKS = [
  {
    name: "Fortress",
    description: "Defensive power with a heavy Rook.",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_KNIGHT, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    name: "Divine",
    description: "Diagonal control with a Bishop.",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_BISHOP, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    name: "Skirmish",
    description: "Agile movement with Knight and Bishop.",
    cards: [CardType.SPAWN_KNIGHT, CardType.SPAWN_BISHOP, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    name: "Experiment",
    description: "Experimental deck for strategic testing.",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_BISHOP, CardType.SPAWN_KNIGHT, CardType.SPAWN_QUEEN, CardType.SPAWN_PAWN]
  }
];

export const MAX_CARDS_IN_HAND = 7;
export const MAX_CARDS_PLAYED_PER_TURN = 3;
export const REWARD_CARDS = 3;
export const CARDS_IN_SHOP = 5;
export const RELICS_IN_SHOP = 2;

export const PIECE_GOLD_VALUES: Record<PieceType, number> = {
  [PieceType.KING]: 100,
  [PieceType.QUEEN]: 50,
  [PieceType.BISHOP]: 25,
  [PieceType.KNIGHT]: 20,
  [PieceType.ROOK]: 15,
  [PieceType.PAWN]: 10,
};

export const RELIC_INFO: Record<RelicType, { name: string; basePrice: number; icon: string, description: (lvl: number) => string }> = {
  [RelicType.LAST_WILL]: { 
    name: "Martyr's Sigil", 
    basePrice: 150, 
    icon: "⚰️",
    description: (lvl) => `Spawn a ${RELIC_LEVEL_REWARDS[Math.min(lvl, 5)]} on base row when your piece dies.`
  },
  [RelicType.NECROMANCY]: { 
    name: "Soul Harvester", 
    basePrice: 250, 
    icon: "💀",
    description: (lvl) => `Spawn a ${RELIC_LEVEL_REWARDS[Math.min(lvl, 5)]} on base row when an enemy dies.`
  }
};

export const RELIC_LEVEL_REWARDS: Record<number, PieceType> = {
  1: PieceType.PAWN,
  2: PieceType.KNIGHT,
  3: PieceType.BISHOP,
  4: PieceType.ROOK,
  5: PieceType.QUEEN
};
