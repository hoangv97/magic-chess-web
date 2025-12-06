
import { v4 as uuidv4 } from 'uuid';
import { Cell, Side, PieceType, TileEffect, Card, Relic, RelicType, BossType, CardType } from '../../types';
import { generateBoard } from '../../utils/gameLogic';
import { getDeckTemplate, LEGEND_PIECE_POOL } from '../../constants';
import { soundManager } from '../../utils/soundManager';

export const initializeGameBoard = (
    settings: any,
    isCampaign: boolean,
    level: number,
    bossType: BossType,
    isElite: boolean,
    relics: Relic[],
    campaignDeck: Card[] | undefined,
    setBoard: (b: Cell[][]) => void,
    setDeck: (d: Card[]) => void,
    setHand: (h: Card[]) => void,
    setActiveBoss: (b: BossType) => void
) => {
    let size = settings.boardSize;
    let eCount = settings.enemyCount;
    let pCount = settings.playerCount;
    let currentBoss = bossType;

    if (isCampaign) {
      size = Math.min(6 + Math.floor((level - 1) / 2), 12);
      eCount = Math.min(2 + level, 12);
      if (isElite) eCount = Math.min(eCount + 2, 16); 
      pCount = 0;
    } else {
      currentBoss = settings.customBossType;
    }

    const newBoard = generateBoard(size);

    // Place Kings
    const kingPos = { row: size - 1, col: Math.floor(size / 2) };
    newBoard[kingPos.row][kingPos.col].piece = {
      id: uuidv4(), type: PieceType.KING, side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
    };
    const enemyKingPos = { row: 0, col: Math.floor(size / 2) };
    newBoard[enemyKingPos.row][enemyKingPos.col].piece = {
      id: uuidv4(), type: PieceType.KING, side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
    };

    // Enemy Pool
    let enemyPool: PieceType[] = [];
    if (isCampaign) {
       if (isElite) {
           enemyPool = [...LEGEND_PIECE_POOL];
           const fodderCount = Math.max(0, 10 - Math.floor(level / 2));
           for(let i=0; i<fodderCount; i++) enemyPool.push(PieceType.PAWN);
           for(let i=0; i<Math.floor(fodderCount/2); i++) enemyPool.push(PieceType.KNIGHT);
       } else {
           enemyPool = [PieceType.PAWN];
           if (level >= 2) enemyPool.push(PieceType.KNIGHT);
           if (level >= 3) enemyPool.push(PieceType.BISHOP);
           if (level >= 4) enemyPool.push(PieceType.ROOK);
           if (level >= 6) enemyPool.push(PieceType.QUEEN);
           if (level > 15) enemyPool.push(LEGEND_PIECE_POOL[Math.floor(Math.random() * LEGEND_PIECE_POOL.length)]);
       }
    } else {
       enemyPool = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN, PieceType.QUEEN];
    }

    // Place Enemies
    let enemiesPlaced = 0;
    let safety = 0;
    while (enemiesPlaced < eCount && safety < 1000) {
      safety++;
      const r = Math.floor(Math.random() * 2);
      const c = Math.floor(Math.random() * size);
      if (!newBoard[r][c].piece) {
        newBoard[r][c].piece = {
          id: uuidv4(), type: enemyPool[Math.floor(Math.random() * enemyPool.length)], side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
        };
        enemiesPlaced++;
      }
    }

    if (currentBoss === BossType.UNDEAD_LORD) {
      const candidates = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = newBoard[r][c].piece;
          if (p && p.side === Side.BLACK && p.type !== PieceType.KING) candidates.push({ row: r, col: c });
        }
      }
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        if (newBoard[chosen.row][chosen.col].piece) newBoard[chosen.row][chosen.col].piece!.immortalTurns = 999;
      }
    }

    // Place Players
    if (!isCampaign) {
      let playersPlaced = 0;
      const playerTypes = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN];
      safety = 0;
      while (playersPlaced < pCount && safety < 1000) {
        safety++;
        const r = size - 2 + Math.floor(Math.random() * 2);
        const c = Math.floor(Math.random() * size);
        if (!newBoard[r][c].piece) {
          newBoard[r][c].piece = {
            id: uuidv4(), type: playerTypes[Math.floor(Math.random() * playerTypes.length)], side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
          };
          playersPlaced++;
        }
      }
    } else {
      const starterRelics = relics.filter((r) => [RelicType.START_PAWN, RelicType.START_ROOK, RelicType.START_KNIGHT, RelicType.START_BISHOP, RelicType.START_QUEEN].includes(r.type));
      starterRelics.forEach((relic) => {
        let type = PieceType.PAWN;
        if (relic.type === RelicType.START_ROOK) type = PieceType.ROOK;
        if (relic.type === RelicType.START_KNIGHT) type = PieceType.KNIGHT;
        if (relic.type === RelicType.START_BISHOP) type = PieceType.BISHOP;
        if (relic.type === RelicType.START_QUEEN) type = PieceType.QUEEN;
        let placed = 0;
        let loopSafety = 0;
        while (placed < relic.level && loopSafety < 100) {
          loopSafety++;
          const r = size - 2 + Math.floor(Math.random() * 2);
          const c = Math.floor(Math.random() * size);
          if (r >= 0 && r < size && c >= 0 && c < size && !newBoard[r][c].piece) {
            newBoard[r][c].piece = { id: uuidv4(), type, side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0 };
            placed++;
          }
        }
      });
    }

    let gameDeck: Card[] = [];
    const deckTemplate = getDeckTemplate(settings.language);
    if (isCampaign && campaignDeck) {
      gameDeck = [...campaignDeck].sort(() => Math.random() - 0.5);
    } else {
      gameDeck = Array.from({ length: 20 }).map(() => {
        const template = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
        return { ...template, id: uuidv4() };
      });
    }

    let initialHand: Card[] = [];
    
    if (currentBoss === BossType.SILENCER) {
        // Silencer Boss: Ensure first 3 cards drawn are Units (not Spells)
        const unitIndices: number[] = [];
        for(let i=0; i < gameDeck.length; i++) {
             // Check if unit (starts with SPAWN and not REVIVE)
             const isUnit = gameDeck[i].type.startsWith('SPAWN') && gameDeck[i].type !== CardType.SPAWN_REVIVE;
             if (isUnit) {
                 unitIndices.push(i);
                 if (unitIndices.length === 3) break;
             }
        }
        
        // Extract them (iterate backwards to safely splice)
        for(let i = unitIndices.length - 1; i >= 0; i--) {
            // Unshift to maintain order 1,2,3 at start of hand
            initialHand.unshift(gameDeck.splice(unitIndices[i], 1)[0]);
        }
    } else {
        initialHand = gameDeck.splice(0, 3);
    }

    setBoard(newBoard);
    setDeck(gameDeck);
    setHand(initialHand);
    setActiveBoss(currentBoss);

    soundManager.init();
    if (settings.soundEnabled) soundManager.startMusic();
};
