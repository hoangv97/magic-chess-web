
import { v4 as uuidv4 } from 'uuid';
import { Card, Relic, RelicType, Piece, PieceType, CardType } from '../types';
import { getDeckTemplate, CARDS_IN_SHOP, RELICS_IN_SHOP } from '../constants';
import { getRandomCards, getRandomRelic, getRandomRelics, getWeightedRandomItem } from './random';

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
    };
}

export const resolveUnknownNodeResult = (
    language: any,
    masterDeck: Card[],
    relics: Relic[]
): UnknownNodeResult => {
    const rand = Math.random();
    const deckTemplate = getDeckTemplate(language);

    if (rand < 0.35) {
        return { type: 'BATTLE', elite: Math.random() > 0.8 };
    } else if (rand < 0.45) {
        return { type: 'SHOP' };
    } else if (rand < 0.55) {
        return { type: 'REST' };
    } else if (rand < 0.70) {
        const amount = 50 + Math.floor(Math.random() * 100);
        return {
            type: 'EVENT',
            eventData: {
                title: "Hidden Treasure",
                desc: "You stumble upon an abandoned chest containing gold.",
                type: 'GOLD',
                gold: amount
            }
        };
    } else if (rand < 0.85) {
        const choices = getRandomCards(3, deckTemplate, masterDeck);
        return {
            type: 'EVENT',
            eventData: {
                title: "Fortune Teller",
                desc: "A mysterious figure lays out three face-down cards. 'Choose your destiny,' they whisper.",
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
                desc: "You find an ancient scroll containing a spell.",
                type: 'CARD',
                card: card
            }
        };
    } else {
        const relicTypes = Object.values(RelicType);
        const relic = getRandomRelic(relicTypes, relics);
        return {
            type: 'EVENT',
            eventData: {
                title: "Ancient Artifact",
                desc: "Buried in the dirt, you find a strange object.",
                type: 'RELIC',
                relic: relic
            }
        };
    }
};
