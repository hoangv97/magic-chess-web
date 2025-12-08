
import { v4 as uuidv4 } from 'uuid';
import { Card, Relic, RelicType, Piece, PieceType, CardType } from '../types';
import { getDeckTemplate, CARDS_IN_SHOP, RELICS_IN_SHOP } from '../constants';
import { getRandomCards, getRandomRelic, getRandomRelics, getWeightedRandomItem, getRandomCurse } from './random';

export const getCardTypeFromPiece = (piece: Piece): CardType | null => {
    switch (piece.type) {
        case PieceType.PAWN: return CardType.SPAWN_PAWN;
        case PieceType.KNIGHT: return CardType.SPAWN_KNIGHT;
        case PieceType.BISHOP: return CardType.SPAWN_BISHOP;
        case PieceType.ROOK: return CardType.SPAWN_ROOK;
        case PieceType.QUEEN: return CardType.SPAWN_QUEEN;
        case PieceType.FOOL: return CardType.SPAWN_FOOL;
        case PieceType.SHIP: return CardType.SPAWN_SHIP;
        case PieceType.ELEPHANT: return CardType.SPAWN_ELEPHANT;
        case PieceType.CHANCELLOR: return CardType.SPAWN_CHANCELLOR;
        case PieceType.ARCHBISHOP: return CardType.SPAWN_ARCHBISHOP;
        case PieceType.MANN: return CardType.SPAWN_MANN;
        case PieceType.AMAZON: return CardType.SPAWN_AMAZON;
        case PieceType.CENTAUR: return CardType.SPAWN_CENTAUR;
        case PieceType.ZEBRA: return CardType.SPAWN_ZEBRA;
        case PieceType.CHAMPION: return CardType.SPAWN_CHAMPION;
        case PieceType.DRAGON:
            if (piece.variant === 'LAVA') return CardType.SPAWN_DRAGON_LAVA;
            if (piece.variant === 'ABYSS') return CardType.SPAWN_DRAGON_ABYSS;
            if (piece.variant === 'FROZEN') return CardType.SPAWN_DRAGON_FROZEN;
            return CardType.SPAWN_DRAGON;
        default: return null;
    }
};

export const generateShopContent = (
    language: any,
    masterDeck: Card[],
    relics: Relic[]
) => {
    const deckTemplate = getDeckTemplate(language);
    // Weighted Shop Cards
    const shopCards = getRandomCards(CARDS_IN_SHOP, deckTemplate, masterDeck);

    // Weighted Shop Relics
    const relicTypes = Object.values(RelicType);
    const shopRelics = getRandomRelics(RELICS_IN_SHOP, relicTypes, relics);

    return { shopCards, shopRelics };
};

export interface UnknownNodeResult {
    type: 'BATTLE' | 'SHOP' | 'REST' | 'EVENT';
    elite?: boolean;
    eventData?: {
        title: string;
        desc: string;
        type: 'GOLD' | 'CARD' | 'RELIC' | 'NOTHING' | 'PICK_CARD';
        gold?: number;
        card?: Card;
        relic?: Relic;
        choiceCards?: Card[];
        addedCurse?: Card; // New field for curse added alongside reward
    };
}

export const resolveUnknownNodeResult = (
    language: any,
    masterDeck: Card[],
    relics: Relic[]
): UnknownNodeResult => {
    const rand = Math.random();
    const deckTemplate = getDeckTemplate(language).filter(c => !c.type.startsWith('CURSE_'));

    // Check for 50% curse chance on non-Pick Card events
    const shouldAddCurse = Math.random() < 0.5;
    const curse = shouldAddCurse ? getRandomCurse(language) : undefined;

    if (rand < 0.35) {
        return { type: 'BATTLE', elite: Math.random() > 0.8 };
    } else if (rand < 0.45) {
        return { type: 'SHOP' };
    } else if (rand < 0.55) {
        return { type: 'REST' };
    } else if (rand < 0.70) {
        const amount = 100 + Math.floor(Math.random() * 100);
        return {
            type: 'EVENT',
            eventData: {
                title: "Hidden Treasure",
                desc: "You stumble upon an abandoned chest containing gold." + (curse ? "\n\nHowever, a curse lingers on the gold..." : ""),
                type: 'GOLD',
                gold: amount,
                addedCurse: curse
            }
        };
    } else if (rand < 0.85) {
        // PICK_CARD: 2 random cards + 1 curse
        const normalChoices = getRandomCards(2, deckTemplate, masterDeck);
        const curseChoice = getRandomCurse(language);
        const choices = [...normalChoices, curseChoice].sort(() => Math.random() - 0.5);
        
        return {
            type: 'EVENT',
            eventData: {
                title: "Fortune Teller",
                desc: "A mysterious figure lays out three face-down cards. 'Choose your destiny,' they whisper. Be warned, one is cursed.",
                type: 'PICK_CARD',
                choiceCards: choices
            }
        };
    } else if (rand < 0.95) {
        const card = getRandomCards(1, deckTemplate, masterDeck)[0];
        return {
            type: 'EVENT',
            eventData: {
                title: "Lost Scroll",
                desc: "You find an ancient scroll containing a spell." + (curse ? "\n\nBut the knowledge comes with a dark price..." : ""),
                type: 'CARD',
                card: card,
                addedCurse: curse
            }
        };
    } else {
        const relicTypes = Object.values(RelicType);
        const relic = getRandomRelic(relicTypes, relics);
        return {
            type: 'EVENT',
            eventData: {
                title: "Ancient Artifact",
                desc: "Buried in the dirt, you find a strange object." + (curse ? "\n\nTouching it sends a shiver down your spine..." : ""),
                type: 'RELIC',
                relic: relic,
                addedCurse: curse
            }
        };
    }
};
