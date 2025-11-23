import React from 'react';
import { PieceType, CardType, Card } from './types';

export const PIECE_ICONS: Record<PieceType, React.ReactNode> = {
  [PieceType.KING]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l1.5 3h3l-1.5 3 1.5 4h-9l1.5-4-1.5-3h3z" opacity="0.4"/>
      <path d="M12 .75a1 1 0 0 1 1 1v2.5h2.5a1 1 0 1 1 0 2h-1.3l.8 2.2a1 1 0 0 1-.94 1.35H9.94a1 1 0 0 1-.94-1.35l.8-2.2h-1.3a1 1 0 1 1 0-2H11V1.75a1 1 0 0 1 1-1zM16 19v-2H8v2h8zm2 2H6v2h12v-2z" />
    </svg>
  ),
  [PieceType.QUEEN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l2.5 4h3.5l-2 3 2 5h-12l2-5-2-3h3.5z"/>
      <circle cx="12" cy="4" r="1.5" />
      <path d="M7 19v-2h10v2H7zm-2 2h14v2H5v-2z" />
    </svg>
  ),
  [PieceType.ROOK]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M6 4v4h3v-2h2v2h2v-2h2v2h3V4H6zm0 13v-9h12v9H6zm-1 2h14v2H5v-2zm-1 2h16v2H4v-2z" />
    </svg>
  ),
  [PieceType.BISHOP]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      <path d="M8 10l-1 9h10l-1-9H8zm-2 11h12v2H6v-2z" />
    </svg>
  ),
  [PieceType.KNIGHT]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M17 5c0-1.7-1.3-3-3-3h-2l-1 3-3 .5V9h2v3l-2 2v2h6v-2h2V9h2V5h-1zm-4 4h-2V7h2v2zM6 21v-2h12v2H6z" />
    </svg>
  ),
  [PieceType.PAWN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="6" r="3" />
      <path d="M12 10c-2.7 0-5 2-5 5v2h10v-2c0-3-2.3-5-5-5zm-5 9h10v2H7v-2z" />
    </svg>
  ),
};

export const DECK_TEMPLATE: Omit<Card, 'id'>[] = [
  { type: CardType.SPAWN_QUEEN, title: "Summon Queen", description: "Spawn a Queen on your base rows." },
  { type: CardType.SPAWN_ROOK, title: "Summon Rook", description: "Spawn a Rook on your base rows." },
  { type: CardType.SPAWN_KNIGHT, title: "Summon Knight", description: "Spawn a Knight on your base rows." },
  { type: CardType.SPAWN_BISHOP, title: "Summon Bishop", description: "Spawn a Bishop on your base rows." },
  { type: CardType.SPAWN_PAWN, title: "Summon Pawn", description: "Spawn a Pawn on your base rows." },
  { type: CardType.SPAWN_PAWN, title: "Summon Pawn", description: "Spawn a Pawn on your base rows." },
  { type: CardType.EFFECT_SWITCH, title: "Swap Tactics", description: "Switch positions of two of your pieces." },
  { type: CardType.EFFECT_FREEZE, title: "Glacial Glare", description: "Freeze a random enemy piece for one turn." },
  { type: CardType.EFFECT_LIMIT, title: "Muddy Terrain", description: "Limit enemy movement range to 1 tile next turn." },
  { type: CardType.EFFECT_BORROW_ROOK, title: "Rook's Spirit", description: "Target piece moves like a Rook this turn." },
  { type: CardType.EFFECT_BORROW_KNIGHT, title: "Knight's Leap", description: "Target piece moves like a Knight this turn." },
  { type: CardType.EFFECT_BORROW_BISHOP, title: "Bishop's Sight", description: "Target piece moves like a Bishop this turn." },
  { type: CardType.EFFECT_BACK_BASE, title: "Recall", description: "Return one of your pieces to the base row." },
];