import React from 'react';
import { PieceType, CardType, Card } from './types';

export const PIECE_ICONS: Record<PieceType, React.ReactNode> = {
  [PieceType.KING]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2c-.5 0-1 .4-1 1v2H9c-.6 0-1 .4-1 1v1h2v1.5c-2.3.5-4.2 2.4-4.8 5.1h13.6c-.6-2.7-2.5-4.6-4.8-5.1V7h2V6c0-.6-.4-1-1-1h-2V3c0-.6-.4-1-1-1zM7 16v2h10v-2H7zm-2 3v2h14v-2H5z"/>
    </svg>
  ),
  [PieceType.QUEEN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l2.5 5h4L17 11l1.5 4h-13l1.5-4-1.5-4h4L12 2zm-5 14h10v2H7v-2zm-1 3h12v2H6v-2z"/>
      <circle cx="12" cy="7.5" r="1" />
    </svg>
  ),
  [PieceType.ROOK]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5 5v4h2v7H5v2h14v-2h-2V9h2V5h-3v2h-2V5h-2v2H9V5H5zm-1 14v2h16v-2H4z"/>
    </svg>
  ),
  [PieceType.BISHOP]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2c-1.9 0-3.5 1.6-3.5 3.5 0 1.4.8 2.6 2 3.2V15h3V8.7c1.2-.6 2-1.8 2-3.2C15.5 3.6 13.9 2 12 2zm0 2l1 2h-2l1-2zm-3 12v2h6v-2H9zm-2 3v2h10v-2H7z"/>
    </svg>
  ),
  [PieceType.KNIGHT]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M14.5 5c0-1.7-1.3-3-3-3h-2l-1 3-2 1v3h2v4l-2 1v2h5v-2h2v-4h1V5h-.5zm-3.5 2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM6 19v2h12v-2H6z"/>
    </svg>
  ),
  [PieceType.PAWN]: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 4c-1.4 0-2.5 1.1-2.5 2.5S10.6 9 12 9s2.5-1.1 2.5-2.5S13.4 4 12 4zm-1.5 6v5H9v2h6v-2h-1.5v-5h-3zm-3 8v2h10v-2H7z"/>
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

export const PIECE_GOLD_VALUES: Record<PieceType, number> = {
  [PieceType.KING]: 100,
  [PieceType.QUEEN]: 50,
  [PieceType.BISHOP]: 25,
  [PieceType.KNIGHT]: 20,
  [PieceType.ROOK]: 15,
  [PieceType.PAWN]: 10,
};