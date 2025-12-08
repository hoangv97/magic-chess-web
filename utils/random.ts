
import { v4 as uuidv4 } from 'uuid';
import { Card, CardType, Relic, RelicType, Language } from '../types';
import { RELIC_INFO } from '../constants/relics';
import { TRANSLATIONS } from './locales';

// Weights config
const DUPLICATE_CARD_PENALTY = 0.5; // Multiplier per copy in deck
const OWNED_RELIC_PENALTY = 0.1; // Multiplier if already owned

/**
 * Selects an item from an array based on a weight function.
 */
export const getWeightedRandomItem = <T>(items: T[], getWeight: (item: T) => number): T => {
  const weights = items.map(getWeight);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    if (randomValue < weights[i]) {
      return items[i];
    }
    randomValue -= weights[i];
  }
  
  return items[items.length - 1];
};

/**
 * Returns a list of random cards based on rarity (cost) and current deck composition.
 * Higher Cost = Rarer (Lower Weight).
 * More copies in deck = Rarer (Lower Weight).
 */
export const getRandomCards = (
  count: number,
  cardTemplates: Omit<Card, 'id'>[], // Templates should have titles/descriptions but can have dummy IDs or no IDs
  currentDeck: Card[]
): Card[] => {
  const result: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    const selected = getWeightedRandomItem(cardTemplates, (template) => {
        // Base weight based on rarity/cost (Higher cost = Lower weight)
        // Assuming costs range from ~15 to ~160
        // Formula: Weight starts high for low cost, drops for high cost.
        // Cost 20 -> Weight ~180. Cost 160 -> Weight ~40.
        // Curses have cost 0, so they would be very common if included here, but usually passed cardTemplates excludes them.
        let weight = Math.max(20, 200 - template.cost);
        
        // Adjust based on current deck (diminishing returns for duplicates)
        const countInDeck = currentDeck.filter(c => c.type === template.type).length;
        if (countInDeck > 0) {
            weight *= Math.pow(DUPLICATE_CARD_PENALTY, countInDeck);
        }
        
        return weight;
    });
    
    // Return a fresh copy with a new ID
    result.push({ ...selected, id: uuidv4() });
  }
  
  return result;
};

/**
 * Returns a single random relic based on price and ownership.
 * Higher Price = Rarer.
 * Owned = Significantly Rarer.
 */
export const getRandomRelic = (
  relicTypes: RelicType[],
  currentRelics: Relic[]
): Relic => {
    const selectedType = getWeightedRandomItem(relicTypes, (type) => {
        const info = RELIC_INFO[type];
        // Base weight from price (Higher price = Lower weight)
        // Prices range from ~100 to ~400
        // Weight: Price 100 -> 400. Price 400 -> 100.
        let weight = Math.max(50, 500 - info.basePrice);
        
        // Owned penalty: If player has this relic, reduce chance significantly
        const isOwned = currentRelics.some(r => r.type === type);
        if (isOwned) {
            weight *= OWNED_RELIC_PENALTY;
        }
        
        return weight;
    });
    
    // If owned, we assume the game logic handles leveling up.
    // If not owned, it starts at level 1.
    return { type: selectedType, level: 1 };
};

/**
 * Returns multiple random relics.
 */
export const getRandomRelics = (
    count: number,
    relicTypes: RelicType[],
    currentRelics: Relic[]
): Relic[] => {
    const result: Relic[] = [];
    // Use a temporary list to track 'ownership' within the same batch generation
    // This prevents picking the same 'rare' relic twice in one shop refresh if possible
    const tempRelics = [...currentRelics]; 
    
    for(let i = 0; i < count; i++) {
        const relic = getRandomRelic(relicTypes, tempRelics);
        result.push(relic);
        tempRelics.push(relic);
    }
    
    return result;
};

export const getRandomCurse = (lang: Language): Card => {
    const curses = [CardType.CURSE_LAZY, CardType.CURSE_MOVE_TAX, CardType.CURSE_SPELL_TAX, CardType.CURSE_DECAY];
    const type = curses[Math.floor(Math.random() * curses.length)];
    return {
        id: uuidv4(),
        type,
        title: TRANSLATIONS[lang].cards[type].title,
        description: TRANSLATIONS[lang].cards[type].desc,
        cost: 0
    };
};
