
import { CardType, Card, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';

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
