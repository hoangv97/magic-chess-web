import { CardType, Card, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';
import { GAME_ICONS } from '../components/assets/GameIcons';

export const DECK_TEMPLATE: Omit<Card, 'id'|'title'|'description'>[] = [
  { type: CardType.SPAWN_QUEEN, cost: 120 },
  { type: CardType.SPAWN_ROOK, cost: 60 },
  { type: CardType.SPAWN_KNIGHT, cost: 50 },
  { type: CardType.SPAWN_BISHOP, cost: 50 },
  { type: CardType.SPAWN_PAWN, cost: 20 },
  { type: CardType.SPAWN_PAWN, cost: 20 },
  
  { type: CardType.SPAWN_FOOL, cost: 35 },
  { type: CardType.SPAWN_SHIP, cost: 45 },
  { type: CardType.SPAWN_ELEPHANT, cost: 30 },
  { type: CardType.SPAWN_DRAGON, cost: 75 },
  { type: CardType.SPAWN_DRAGON_LAVA, cost: 90 },
  { type: CardType.SPAWN_DRAGON_ABYSS, cost: 90 },
  { type: CardType.SPAWN_DRAGON_FROZEN, cost: 90 },

  { type: CardType.EFFECT_CONVERT_ENEMY, cost: 80 },
  { type: CardType.EFFECT_DUPLICATE, cost: 40 },
  { type: CardType.EFFECT_SELECT_DRAW, cost: 50 },

  { type: CardType.SPAWN_CHANCELLOR, cost: 85 },
  { type: CardType.SPAWN_ARCHBISHOP, cost: 85 },
  { type: CardType.SPAWN_MANN, cost: 110 },
  { type: CardType.SPAWN_AMAZON, cost: 160 },
  { type: CardType.SPAWN_CENTAUR, cost: 70 },
  { type: CardType.SPAWN_ZEBRA, cost: 60 },
  { type: CardType.SPAWN_CHAMPION, cost: 65 },

  { type: CardType.EFFECT_SWITCH, cost: 30 },
  { type: CardType.EFFECT_FREEZE, cost: 40 },
  { type: CardType.EFFECT_LIMIT, cost: 45 },
  { type: CardType.EFFECT_BORROW_ROOK, cost: 50 },
  { type: CardType.EFFECT_BORROW_KNIGHT, cost: 45 },
  { type: CardType.EFFECT_BORROW_BISHOP, cost: 45 },
  { type: CardType.EFFECT_BACK_BASE, cost: 15 },
  { type: CardType.EFFECT_IMMORTAL, cost: 70 },

  // New Cards
  { type: CardType.EFFECT_TRAP, cost: 40 },
  { type: CardType.SPAWN_REVIVE, cost: 100 },
  { type: CardType.EFFECT_AREA_FREEZE, cost: 60 },
  { type: CardType.EFFECT_MIMIC, cost: 75 },
  { type: CardType.EFFECT_ASCEND, cost: 35 },
  { type: CardType.EFFECT_IMMORTAL_LONG, cost: 120 },
  { type: CardType.EFFECT_PROMOTION_TILE, cost: 90 },
  { type: CardType.EFFECT_TELEPORT, cost: 80 },

  // Curses (Cost 0 usually means cannot buy/play normally, but we define a value for sorting)
  { type: CardType.CURSE_LAZY, cost: 0 },
  { type: CardType.CURSE_MOVE_TAX, cost: 0 },
  { type: CardType.CURSE_SPELL_TAX, cost: 0 },
  { type: CardType.CURSE_DECAY, cost: 0 },
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
  {
    id: "Elite",
    cards: [CardType.SPAWN_CHANCELLOR, CardType.SPAWN_ARCHBISHOP, CardType.SPAWN_MANN, CardType.SPAWN_AMAZON, CardType.SPAWN_CENTAUR, CardType.SPAWN_ZEBRA, CardType.SPAWN_CHAMPION]
  },
  {
    id: "Mystic",
    cards: [CardType.SPAWN_DRAGON, CardType.SPAWN_ELEPHANT, CardType.SPAWN_ELEPHANT, CardType.SPAWN_ELEPHANT, CardType.SPAWN_FOOL, CardType.SPAWN_SHIP, CardType.SPAWN_PAWN]
  },
  {
    id: "Elemental",
    cards: [CardType.SPAWN_DRAGON, CardType.SPAWN_DRAGON_LAVA, CardType.SPAWN_DRAGON_ABYSS, CardType.SPAWN_DRAGON_FROZEN, CardType.SPAWN_PAWN]
  },
];

export const getStarterDecks = (lang: Language) => {
  return STARTER_DECKS_CONFIG.map(deck => ({
    ...deck,
    name: TRANSLATIONS[lang].deckSelection.decks[deck.id as keyof typeof TRANSLATIONS['en']['deckSelection']['decks']]?.name || deck.id,
    description: TRANSLATIONS[lang].deckSelection.decks[deck.id as keyof typeof TRANSLATIONS['en']['deckSelection']['decks']]?.desc || '',
  }));
};

export const getCardIcon = (type: string) => {
  if (type.includes('REVIVE')) return GAME_ICONS.CARD_REVIVE;
  if (type.includes('CONVERT_ENEMY')) return '🎭';
  if (type.includes('DUPLICATE')) return '👯';
  if (type.includes('SPAWN')) return GAME_ICONS.CARD_SPAWN;
  if (type.includes('IMMORTAL')) return GAME_ICONS.CARD_IMMORTAL;
  if (type.includes('SWITCH')) return GAME_ICONS.CARD_SWITCH;
  if (type.includes('FREEZE')) return GAME_ICONS.CARD_FREEZE;
  if (type.includes('LIMIT')) return GAME_ICONS.CARD_LIMIT;
  if (type.includes('BORROW')) return GAME_ICONS.CARD_BORROW;
  if (type.includes('MIMIC')) return GAME_ICONS.STATUS_MIMIC;
  if (type.includes('BACK')) return GAME_ICONS.CARD_BACK;
  if (type.includes('TRAP')) return GAME_ICONS.CARD_TRAP;
  if (type.includes('ASCEND')) return GAME_ICONS.CARD_ASCEND;
  if (type.includes('CURSE')) return GAME_ICONS.CARD_CURSE;
  if (type.includes('PROMOTION')) return GAME_ICONS.CARD_PROMOTION;
  if (type.includes('TELEPORT')) return GAME_ICONS.CARD_TELEPORT;
  if (type.includes('SELECT_DRAW')) return '🔍';
  return GAME_ICONS.CARD_DEFAULT;
};

const CLASSIC_SPAWNS = ['SPAWN_PAWN', 'SPAWN_KNIGHT', 'SPAWN_BISHOP', 'SPAWN_ROOK', 'SPAWN_QUEEN'];

export const getCardTheme = (type: string) => {
  if (type.startsWith('CURSE_')) {
    return {
      border: 'border-green-600',
      headerBg: 'bg-green-900',
      bodyBg: 'bg-gradient-to-b from-green-950 to-black',
      ribbonBg: 'bg-green-800',
      descBg: 'bg-green-100',
      descText: 'text-green-950',
      jewel: 'bg-green-500',
      glow: 'bg-green-500/20',
      typeLabel: 'CURSE'
    };
  }

  const isUnit = type.startsWith('SPAWN') && type !== 'SPAWN_REVIVE';
  const isClassicUnit = isUnit && CLASSIC_SPAWNS.includes(type);
  const isLegendUnit = isUnit && !isClassicUnit;

  if (isLegendUnit) {
    return {
      border: 'border-purple-500', 
      headerBg: 'bg-[#502e66]',
      bodyBg: 'bg-gradient-to-b from-[#502e66] to-[#2d1b39]',
      ribbonBg: 'bg-purple-600',
      descBg: 'bg-[#f3e8ff]', 
      descText: 'text-[#3b0764]',
      jewel: 'bg-purple-400',
      glow: 'bg-purple-500/40',
      typeLabel: 'LEGEND'
    };
  } else if (isClassicUnit) {
    return {
      border: 'border-slate-600',
      headerBg: 'bg-slate-700',
      bodyBg: 'bg-gradient-to-b from-slate-800 to-slate-900',
      ribbonBg: 'bg-slate-600',
      descBg: 'bg-slate-200',
      descText: 'text-slate-900',
      jewel: 'bg-cyan-500',
      glow: 'bg-cyan-400/30',
      typeLabel: 'UNIT'
    };
  } else {
    // Spell
    return {
      border: 'border-red-900',
      headerBg: 'bg-[#7f1d1d]',
      bodyBg: 'bg-gradient-to-b from-[#450a0a] to-[#2b0505]', 
      ribbonBg: 'bg-[#991b1b]',
      descBg: 'bg-[#fef3c7]', 
      descText: 'text-[#450a0a]',
      jewel: 'bg-orange-500',
      glow: 'bg-orange-500/30',
      typeLabel: 'SPELL'
    };
  }
};