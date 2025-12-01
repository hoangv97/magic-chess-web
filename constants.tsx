import React from 'react';
import { PieceType, CardType, Card, RelicType, MapNode, TileEffect, BoardThemeId, BoardTheme, Language } from './types';
import { TRANSLATIONS } from './utils/locales';

export const TEST_GENERATE_SPECIAL_TILES = true;

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  CLASSIC: { name: 'Classic', light: 'bg-[#f0d9b5]', dark: 'bg-[#b58863]', bg: 'bg-[#1a1c23]', border: 'border-[#2a2018]' },
  FOREST: { name: 'Forest', light: 'bg-[#eeeed2]', dark: 'bg-[#769656]', bg: 'bg-[#1b2b1b]', border: 'border-[#334c33]' },
  OCEAN: { name: 'Ocean', light: 'bg-[#dee3e6]', dark: 'bg-[#4b7399]', bg: 'bg-[#0f172a]', border: 'border-[#1e293b]' },
  DARK: { name: 'Dark', light: 'bg-[#7c818c]', dark: 'bg-[#444952]', bg: 'bg-[#18181b]', border: 'border-[#27272a]' }
};

export const DECK_TEMPLATE: Omit<Card, 'id'|'title'|'description'>[] = [
  { type: CardType.SPAWN_QUEEN, cost: 120 },
  { type: CardType.SPAWN_ROOK, cost: 60 },
  { type: CardType.SPAWN_KNIGHT, cost: 50 },
  { type: CardType.SPAWN_BISHOP, cost: 50 },
  { type: CardType.SPAWN_PAWN, cost: 20 },
  { type: CardType.SPAWN_PAWN, cost: 20 },
  { type: CardType.EFFECT_SWITCH, cost: 30 },
  { type: CardType.EFFECT_FREEZE, cost: 40 },
  { type: CardType.EFFECT_LIMIT, cost: 45 },
  { type: CardType.EFFECT_BORROW_ROOK, cost: 50 },
  { type: CardType.EFFECT_BORROW_KNIGHT, cost: 45 },
  { type: CardType.EFFECT_BORROW_BISHOP, cost: 45 },
  { type: CardType.EFFECT_BACK_BASE, cost: 15 },
];

export const getDeckTemplate = (lang: Language) => {
  return DECK_TEMPLATE.map(card => ({
    ...card,
    title: TRANSLATIONS[lang].cards[card.type].title,
    description: TRANSLATIONS[lang].cards[card.type].desc
  }));
};

export const STARTER_DECKS_CONFIG = [
  {
    id: "Fortress",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_KNIGHT, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    id: "Divine",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_BISHOP, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    id: "Skirmish",
    cards: [CardType.SPAWN_KNIGHT, CardType.SPAWN_BISHOP, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN, CardType.SPAWN_PAWN]
  },
  {
    id: "Experiment",
    cards: [CardType.SPAWN_ROOK, CardType.SPAWN_BISHOP, CardType.SPAWN_KNIGHT, CardType.SPAWN_QUEEN, CardType.SPAWN_PAWN]
  },
];

export const getStarterDecks = (lang: Language) => {
  return STARTER_DECKS_CONFIG.map(deck => ({
    ...deck,
    name: TRANSLATIONS[lang].deckSelection.decks[deck.id as keyof typeof TRANSLATIONS['en']['deckSelection']['decks']]?.name || deck.id,
    description: TRANSLATIONS[lang].deckSelection.decks[deck.id as keyof typeof TRANSLATIONS['en']['deckSelection']['decks']]?.desc || '',
  }));
};

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
  [PieceType.ELEPHANT]: 15,
  [PieceType.GIRAFFE]: 25,
  [PieceType.UNICORN]: 30,
  [PieceType.ZEBRA]: 25,
  [PieceType.MANN]: 20,
  [PieceType.CENTAUR]: 35,
  [PieceType.COMMONER]: 15,
  [PieceType.CHAMPION]: 40,
  [PieceType.WIZARD]: 35,
  [PieceType.FOOL]: 10,
  [PieceType.ARCHBISHOP]: 50,
  [PieceType.CHANCELLOR]: 50,
  [PieceType.AMAZON]: 75,
  [PieceType.DRAGON]: 40,
  [PieceType.SHIP]: 20,
};

export const RELIC_INFO: Record<RelicType, { basePrice: number; icon: string }> = {
  [RelicType.LAST_WILL]: { 
    basePrice: 150, 
    icon: "⚰️"
  },
  [RelicType.NECROMANCY]: { 
    basePrice: 250, 
    icon: "💀"
  }
};

export const getRelicInfo = (lang: Language, type: RelicType) => {
  const base = RELIC_INFO[type];
  const trans = TRANSLATIONS[lang].relics[type];
  return {
    ...base,
    name: trans.name,
    description: (lvl: number) => {
        const piece = TRANSLATIONS[lang].pieces[RELIC_LEVEL_REWARDS[Math.min(lvl, 5)]];
        return trans.desc.replace('{0}', piece);
    }
  };
};

export const RELIC_LEVEL_REWARDS: Record<number, PieceType> = {
  1: PieceType.PAWN,
  2: PieceType.KNIGHT,
  3: PieceType.BISHOP,
  4: PieceType.ROOK,
  5: PieceType.QUEEN
};

export const getTileEffectInfo = (lang: Language, type: TileEffect) => {
  return TRANSLATIONS[lang].tiles[type];
};

export const TILE_EFFECT_INFO: Record<TileEffect, { name: string; desc: string }> = {
  [TileEffect.NONE]: { name: "Grass", desc: "Standard terrain. No special effects." },
  [TileEffect.HOLE]: { name: "Abyss", desc: "A deep chasm. Pieces cannot stand here, but sliding pieces can pass over." },
  [TileEffect.WALL]: { name: "Stone Wall", desc: "A solid obstacle. Pieces cannot enter or pass through." },
  [TileEffect.MUD]: { name: "Mud Puddle", desc: "Sticky terrain. Entering this tile freezes piece for next turn." },
  [TileEffect.LAVA]: { name: "Magma Pool", desc: "Deadly heat. Entering this tile destroys the piece." }
};