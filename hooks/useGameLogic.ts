import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Cell, Piece, PieceType, Side, Position, TileEffect, Card, CardType,
  GameSettings, Relic, RelicType, BossType,
} from '../types';
import { getValidMoves, isValidPos } from '../utils/gameLogic';
import { getBestEnemyMove } from '../utils/aiLogic';
import {
  PIECE_GOLD_VALUES, MAX_CARDS_IN_HAND, MAX_CARDS_PLAYED_PER_TURN,
  RELIC_LEVEL_REWARDS, WAIT_END_GAME_TIMEOUT, RANDOM_ADD_CURSE_CARD_IN_BOSS, 
  CURSE_SPELL_TAX_GOLD_MINUS, CURSE_LAZY_GOLD_MINUS, CURSE_MOVE_TAX_GOLD_MINUS,
} from '../constants';
import { TRANSLATIONS } from '../utils/locales';
import { soundManager } from '../utils/soundManager';
import { initializeGameBoard } from './game/useGameInit';
import { applyBossAbilities } from './game/useBossAI';
import { calculateCheckState as calcCheck, checkLossCondition as checkLoss, checkWinCondition as checkWin } from '../utils/game/checkLogic';
import { spawnRelicPiece as spawnRelic } from '../utils/game/spawnLogic';
import { getBoardAfterInstantCard, getBoardAfterTargetCard } from '../utils/game/cardLogic';
import { getRandomCurse, shuffleArray } from '../utils/random';

interface UseGameLogicProps {
  settings: GameSettings;
  isCampaign: boolean;
  relics: Relic[];
  setGold: React.Dispatch<React.SetStateAction<number>>;
  onWin: () => void;
  onLoss: () => void;
  onPieceKilled?: (piece: Piece) => void;
  onAddCardToMasterDeck?: (card: Card) => void;
}

export const useGameLogic = ({
  settings, isCampaign, relics, setGold, onWin, onLoss, onPieceKilled, onAddCardToMasterDeck
}: UseGameLogicProps) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [turn, setTurn] = useState<Side>(Side.WHITE);
  const [turnCount, setTurnCount] = useState(1);
  const [selectedPiecePos, setSelectedPiecePos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMoveFrom, setLastMoveFrom] = useState<Position | null>(null);
  const [lastMoveTo, setLastMoveTo] = useState<Position | null>(null);
  const [isEnemyMoveLimited, setIsEnemyMoveLimited] = useState(false);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [checkState, setCheckState] = useState<{ white: boolean; black: boolean; }>({ white: false, black: false });
  const [activeBoss, setActiveBoss] = useState<BossType>(BossType.NONE);
  const [bossTiles, setBossTiles] = useState<Position[]>([]);
  const [lastEnemyMoveType, setLastEnemyMoveType] = useState<PieceType | null>(null);
  const [lastPlayerSpawnedType, setLastPlayerSpawnedType] = useState<PieceType | null>(null);
  const tempTileEffects = useRef<{ pos: Position; originalEffect: TileEffect; variant: TileEffect; turnsLeft: number; }[]>([]);
  const [deadPieces, setDeadPieces] = useState<PieceType[]>([]);
  const [killedEnemyPieces, setKilledEnemyPieces] = useState<PieceType[]>([]);
  const [selectedEnemyPos, setSelectedEnemyPos] = useState<Position | null>(null);
  const [enemyValidMoves, setEnemyValidMoves] = useState<Position[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardTargetMode, setCardTargetMode] = useState<{ type: CardType; step: string; sourcePos?: Position; } | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; content: React.ReactNode; } | null>(null);
  
  // Animation State
  const [animatingCards, setAnimatingCards] = useState<Card[]>([]);

  // Ref to track latest deck state for async operations
  const deckRef = useRef(deck);
  useEffect(() => { deckRef.current = deck; }, [deck]);

  const t = TRANSLATIONS[settings.language];

  const initGame = (campaignMode: boolean, campaignDeck?: Card[], level: number = 1, bossType: BossType = BossType.NONE, isElite: boolean = false) => {
      initializeGameBoard(
          settings, campaignMode, level, bossType, isElite, relics, campaignDeck,
          setBoard, setDeck, setHand, setActiveBoss
      );
      setTurn(Side.WHITE);
      setTurnCount(1);
      setCardsPlayed(0);
      setSelectedPiecePos(null);
      setValidMoves([]);
      setLastMoveFrom(null);
      setLastMoveTo(null);
      setIsEnemyMoveLimited(false);
      setEnPassantTarget(null);
      setInfoModalContent(null);
      setSelectedEnemyPos(null);
      setEnemyValidMoves([]);
      setIsGameEnded(false);
      setCheckState({ white: false, black: false });
      setBossTiles([]);
      setLastEnemyMoveType(null);
      setDeadPieces([]);
      setKilledEnemyPieces([]);
      setLastPlayerSpawnedType(null);
      setAnimatingCards([]);
      tempTileEffects.current = [];
  };

  const calculateCheckState = (boardState: Cell[][]) => {
    setCheckState(calcCheck(boardState, activeBoss));
  };

  const handleAnimationComplete = (cardId: string) => {
      setAnimatingCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Reusable logic to add card with animation and shuffle
  const addCardToDeck = (card: Card) => {
      setDeck(prev => {
          const newDeck = [...prev, card];
          return shuffleArray(newDeck);
      });
      setAnimatingCards(prev => [...prev, card]);
      
      if (isCampaign && onAddCardToMasterDeck) {
          onAddCardToMasterDeck(card);
      }
  };

  const addRandomCurse = () => {
      const curse = getRandomCurse(settings.language);
      addCardToDeck(curse);
      soundManager.playSfx('loss'); 
  };

  const drawCard = useCallback((deckOverride?: Card[]) => {
    // Use override if provided (for atomic updates inside enemy turn), otherwise use state
    const currentDeck = deckOverride || deck;

    if (currentDeck.length > 0 && hand.length < MAX_CARDS_IN_HAND) {
      const newDeck = [...currentDeck];
      let cardIndex = newDeck.length - 1;

      // Boss Logic: The Silencer
      if (activeBoss === BossType.SILENCER) {
          cardIndex = -1;
          for (let i = newDeck.length - 1; i >= 0; i--) {
              const card = newDeck[i];
              const isUnit = card.type.startsWith('SPAWN') && card.type !== CardType.SPAWN_REVIVE;
              if (isUnit) {
                  cardIndex = i;
                  break;
              }
          }
      }

      if (cardIndex >= 0) {
          const card = newDeck.splice(cardIndex, 1)[0];
          setDeck(newDeck);
          if (card) {
            setHand((prev) => [...prev, card]);
            soundManager.playSfx('draw');
          }
      } else if (deckOverride) {
          // If override was provided but we couldn't draw (e.g. Silencer block), we still need to commit the override
          setDeck(newDeck);
      }
    } else if (deckOverride) {
        // Hand full or empty deck, but override exists -> commit it
        setDeck(currentDeck);
    }
  }, [deck, hand, activeBoss]);

  const executeMove = (from: Position, to: Position) => {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
    const piece = newBoard[from.row][from.col].piece!;
    let target = newBoard[to.row][to.col].piece;
    let nextEnPassantTarget: Position | null = null;
    let enemyKilled = false;
    let selfKilled = false;

    // Elephant Swarm Logic
    if (piece.type === PieceType.ELEPHANT) {
      const deltaRow = to.row - from.row;
      const deltaCol = to.col - from.col;
      const size = newBoard.length;
      const swarm: Position[] = [];
      const checked = new Set<string>();
      const queue = [from];
      checked.add(`${from.row},${from.col}`);
      while (queue.length > 0) {
        const curr = queue.pop()!;
        swarm.push(curr);
        [[curr.row, curr.col - 1], [curr.row, curr.col + 1]].forEach(([lr, lc]) => {
            if (lc >= 0 && lc < size) {
                const key = `${lr},${lc}`;
                if (!checked.has(key)) {
                    const p = newBoard[lr][lc].piece;
                    if (p && p.type === PieceType.ELEPHANT && p.side === piece.side) {
                        checked.add(key);
                        queue.push({ row: lr, col: lc });
                    }
                }
            }
        });
      }
      if (swarm.length >= 3) {
        swarm.forEach((pos) => {
          if (pos.row === from.row && pos.col === from.col) return;
          const targetR = pos.row + deltaRow;
          const targetC = pos.col + deltaCol;
          if (targetR >= 0 && targetR < size && targetC >= 0 && targetC < size) {
            const targetCell = newBoard[targetR][targetC];
            let canSwarmMove = false;
            if (targetCell.tileEffect === TileEffect.WALL || !targetCell.piece || targetCell.piece.side !== piece.side) canSwarmMove = true;
            if (canSwarmMove) {
              if (targetCell.tileEffect === TileEffect.WALL) targetCell.tileEffect = TileEffect.NONE;
              if (targetCell.piece) {
                const midas = relics.find((r) => r.type === RelicType.MIDAS_TOUCH);
                setGold((g) => g + 10 * (midas ? 2 : 1));
              }
              targetCell.piece = { ...newBoard[pos.row][pos.col].piece!, hasMoved: true };
              newBoard[pos.row][pos.col].piece = null;
            }
          }
        });
      }
    }

    // Dragon Trails
    if (piece.type === PieceType.DRAGON && piece.variant) {
      let effect: TileEffect = TileEffect.NONE;
      if (piece.variant === 'LAVA') effect = TileEffect.LAVA;
      if (piece.variant === 'ABYSS') effect = TileEffect.HOLE;
      if (piece.variant === 'FROZEN') effect = TileEffect.FROZEN;
      if (effect !== TileEffect.NONE) {
        const originalEffect = newBoard[from.row][from.col].tileEffect;
        newBoard[from.row][from.col].tileEffect = effect;
        tempTileEffects.current.push({ pos: from, originalEffect, variant: effect, turnsLeft: 1 });
      }
    }

    if (newBoard[to.row][to.col].tileEffect === TileEffect.WALL) {
      if (piece.type === PieceType.SHIP || piece.type === PieceType.ELEPHANT) {
        newBoard[to.row][to.col].tileEffect = TileEffect.NONE;
        soundManager.playSfx('capture');
      }
    }

    if ((piece.type === PieceType.PAWN || piece.type === PieceType.ZEBRA || piece.type === PieceType.CHAMPION) && !target && from.col !== to.col && enPassantTarget) {
      if (to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
        const direction = piece.side === Side.WHITE ? -1 : 1;
        const victimRow = to.row - direction;
        const victimPiece = newBoard[victimRow][to.col].piece;
        if (victimPiece && victimPiece.side !== Side.WHITE) {
          target = victimPiece;
          newBoard[victimRow][to.col].piece = null;
          enemyKilled = true;
        }
      }
    }

    if ((piece.type === PieceType.PAWN || piece.type === PieceType.ZEBRA || piece.type === PieceType.CHAMPION) && Math.abs(from.row - to.row) === 2) {
      nextEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    }

    if (target && target.side === Side.BLACK) {
      if (piece.mimic) piece.type = target.type;
      const goldReward = PIECE_GOLD_VALUES[target.type] || 10;
      const midas = relics.find((r) => r.type === RelicType.MIDAS_TOUCH);
      setGold((prev) => prev + goldReward * (midas ? 2 : 1));
      enemyKilled = true;
      setKilledEnemyPieces(prev => [...prev, target!.type]);
    }

    // --- CURSE LOGIC (MOVE TAX / LAZY) ---
    // Curse of Burden (Move Tax)
    if (hand.some(c => c.type === CardType.CURSE_MOVE_TAX)) {
       setGold(g => Math.max(0, g - CURSE_MOVE_TAX_GOLD_MINUS));
    }
    // Curse of Sloth (Lazy Tax)
    if (hand.some(c => c.type === CardType.CURSE_LAZY) && !enemyKilled) {
       setGold(g => Math.max(0, g - CURSE_LAZY_GOLD_MINUS));
    }
    // -------------------------------------

    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined };
    newBoard[from.row][from.col].piece = null;

    // --- TELEPORT LOGIC ---
    if (newBoard[to.row][to.col].tileEffect === TileEffect.TELEPORT && !enemyKilled) {
        const teleId = newBoard[to.row][to.col].teleportId;
        const otherTile = newBoard.flat().find(cell => cell.teleportId === teleId && (cell.position.row !== to.row || cell.position.col !== to.col));
        if (otherTile && !otherTile.piece) {
            newBoard[otherTile.position.row][otherTile.position.col].piece = newBoard[to.row][to.col].piece;
            newBoard[to.row][to.col].piece = null;
            to = otherTile.position; // Update 'to' for subsequent effects
            soundManager.playSfx('spawn');
        }
    }
    // ----------------------

    if (activeBoss === BossType.FROST_GIANT && piece.side === Side.WHITE && newBoard[to.row][to.col].piece) {
        newBoard[to.row][to.col].piece!.frozenTurns = 2;
    }

    const ignoresTerrain = piece.type === PieceType.DRAGON;
    const destEffect = newBoard[to.row][to.col].tileEffect;
    if (destEffect === TileEffect.LAVA && !ignoresTerrain) {
      if (!(newBoard[to.row][to.col].piece!.immortalTurns && newBoard[to.row][to.col].piece!.immortalTurns! > 0)) {
        const p = newBoard[to.row][to.col].piece!;
        if (p.side === Side.WHITE) setDeadPieces((prev) => [...prev, p.type]);
        newBoard[to.row][to.col].piece = null;
        selfKilled = true;
        soundManager.playSfx('capture');
      }
    } else if (destEffect === TileEffect.FROZEN && newBoard[to.row][to.col].piece) {
        newBoard[to.row][to.col].piece!.frozenTurns = 2;
        soundManager.playSfx('frozen');
    } else if (destEffect === TileEffect.PROMOTION && newBoard[to.row][to.col].piece) {
        const p = newBoard[to.row][to.col].piece!;
        if (p.type === PieceType.KNIGHT) {
            p.type = PieceType.AMAZON;
            soundManager.playSfx('spawn');
        } else if ([PieceType.PAWN, PieceType.ROOK, PieceType.BISHOP].includes(p.type)) {
            p.type = PieceType.QUEEN;
            soundManager.playSfx('spawn');
        }
    }

    if (newBoard[to.row][to.col].piece && piece.type === PieceType.PAWN && to.row === 0) {
      newBoard[to.row][to.col].piece!.type = PieceType.QUEEN;
      soundManager.playSfx('spawn');
    }

    if (enemyKilled) {
      soundManager.playSfx('capture');
      const necromancy = relics.find((r) => r.type === RelicType.NECROMANCY);
      if (necromancy) spawnRelic(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(necromancy.level, 5)]);
      
      // Boss: Hydra
      if (activeBoss === BossType.HYDRA) {
        const emptySpots: Position[] = [];
        for (let r = 0; r < Math.floor(newBoard.length / 2); r++) {
          for (let c = 0; c < newBoard.length; c++) {
            if (!newBoard[r][c].piece && newBoard[r][c].tileEffect === TileEffect.NONE) emptySpots.push({ row: r, col: c });
          }
        }
        if (emptySpots.length > 0) {
          const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
          const hydraSpawns = [PieceType.PAWN, PieceType.KNIGHT, PieceType.ROOK, PieceType.BISHOP, PieceType.QUEEN];
          newBoard[spot.row][spot.col].piece = {
            id: uuidv4(), type: hydraSpawns[Math.floor(Math.random() * hydraSpawns.length)], side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
          };
        }
      }

      // Boss: Doom Bringer (Curse on enemy kill)
      if (activeBoss === BossType.DOOM_BRINGER && Math.random() < RANDOM_ADD_CURSE_CARD_IN_BOSS) {
          addRandomCurse();
      }

    } else {
      soundManager.playSfx('move');
    }

    if (selfKilled) {
      const lastWill = relics.find((r) => r.type === RelicType.LAST_WILL);
      if (lastWill) spawnRelic(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
      
      // Boss: Soul Corruptor (Curse on player death)
      if (activeBoss === BossType.SOUL_CORRUPTOR && Math.random() < RANDOM_ADD_CURSE_CARD_IN_BOSS) {
          addRandomCurse();
      }
    }

    newBoard.forEach((row) => row.forEach((cell) => {
        if (cell.piece && cell.piece.side === Side.WHITE) {
          if ((cell.piece.frozenTurns || 0) > 0) cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
          if ((cell.piece.immortalTurns || 0) > 0) cell.piece.immortalTurns = (cell.piece.immortalTurns || 0) - 1;
          if ((cell.piece.ascendedTurns || 0) > 0) {
            cell.piece.ascendedTurns = (cell.piece.ascendedTurns || 0) - 1;
            if (cell.piece.ascendedTurns === 0) {
              setDeadPieces((prev) => [...prev, cell.piece!.type]);
              cell.piece = null;
              soundManager.playSfx('loss');
            }
          }
        }
    }));

    setBoard(newBoard);
    calculateCheckState(newBoard);
    setLastMoveFrom(from);
    setLastMoveTo(to);
    setSelectedPiecePos(null);
    setValidMoves([]);
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);
    setEnPassantTarget(nextEnPassantTarget);

    if (checkWin(newBoard)) {
      soundManager.playSfx('win');
      setIsGameEnded(true);
      setTimeout(onWin, WAIT_END_GAME_TIMEOUT);
      return;
    }
    if (checkLoss(newBoard, deck, hand)) {
      soundManager.playSfx('loss');
      setIsGameEnded(true);
      setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
      return;
    }
    endPlayerTurn(newBoard, nextEnPassantTarget);
  };

  const endPlayerTurn = (currentBoard: Cell[][], currentEnPassantTarget: Position | null) => {
    setTurn(Side.BLACK);
    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);
    setTimeout(() => executeEnemyTurn(currentBoard, currentEnPassantTarget, nextTurn), 800);
  };

  const executeEnemyTurn = (currentBoard: Cell[][], playerEnPassantTarget: Position | null, currentTurn: number) => {
    // START OF FIX: Use ref for base deck to avoid stale closure, and maintain local deck state for this turn
    let currentTurnDeck = [...deckRef.current];

    const { board: boardAfterBoss, newTiles, triggerCurse } = applyBossAbilities([...currentBoard], activeBoss, bossTiles, currentTurn);
    setBossTiles(newTiles);
    
    // Boss: Curse Weaver (Periodic Curse)
    if (triggerCurse) {
        const curse = getRandomCurse(settings.language);
        currentTurnDeck.push(curse);
        // Shuffle local deck
        currentTurnDeck = shuffleArray(currentTurnDeck);
        setAnimatingCards(prev => [...prev, curse]);
        soundManager.playSfx('loss');
        if (isCampaign && onAddCardToMasterDeck) {
            onAddCardToMasterDeck(curse);
        }
    }

    const boardCopy = boardAfterBoss.map((row) => row.map((cell) => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));

    if (activeBoss === BossType.MIRROR_MAGE && lastPlayerSpawnedType) {
      const size = boardCopy.length;
      const emptySpots: Position[] = [];
      for (let r = 0; r < Math.floor(size / 2); r++) {
        for (let c = 0; c < size; c++) {
          if (!boardCopy[r][c].piece && boardCopy[r][c].tileEffect !== TileEffect.WALL) emptySpots.push({ row: r, col: c });
        }
      }
      if (emptySpots.length > 0) {
        const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        boardCopy[spot.row][spot.col].piece = {
          id: uuidv4(), type: lastPlayerSpawnedType, side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
        };
        soundManager.playSfx('spawn');
      }
    }
    setBoard(boardCopy);

    const passTurn = () => {
      boardCopy.forEach((row) => row.forEach((cell) => {
          if (cell.piece && cell.piece.side === Side.BLACK) {
            if ((cell.piece.frozenTurns || 0) > 0) cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
            if ((cell.piece.immortalTurns || 0) > 0 && cell.piece.immortalTurns! < 100) cell.piece.immortalTurns = (cell.piece.immortalTurns || 0) - 1;
          }
      }));
      tempTileEffects.current.forEach((effect) => {
        if (boardCopy[effect.pos.row][effect.pos.col].tileEffect === effect.variant) {
          boardCopy[effect.pos.row][effect.pos.col].tileEffect = effect.originalEffect;
        }
      });
      tempTileEffects.current = [];
      setTurn(Side.WHITE);
      setTurnCount((c) => c + 1);
      setCardsPlayed(0);
      
      // FIX: Pass the modified local deck to drawCard
      drawCard(currentTurnDeck);
      
      setIsEnemyMoveLimited(false);
      setEnPassantTarget(null);
      setLastPlayerSpawnedType(null);
      calculateCheckState(boardCopy);
      setBoard(boardCopy);
    };

    // Calculate Best AI Move using the new AI Logic
    let bestMove = null;
    
    // Check if there are any movable pieces first to save computation
    const hasMovablePieces = boardCopy.some(row => row.some(cell => 
        cell.piece?.side === Side.BLACK && (cell.piece.frozenTurns || 0) <= 0
    ));

    if (hasMovablePieces) {
        bestMove = getBestEnemyMove(boardCopy, activeBoss, lastMoveFrom, playerEnPassantTarget, lastEnemyMoveType);
    }

    // Apply Move if found
    let nextEnPassantTarget: Position | null = null;
    const size = boardCopy.length;

    if (bestMove) {
      const movingPiece = boardCopy[bestMove.from.row][bestMove.from.col].piece;
      if (!movingPiece) { passTurn(); return; }
      
      const targetPiece = boardCopy[bestMove.to.row][bestMove.to.col].piece;
      setLastEnemyMoveType(movingPiece.type);
      let playerPieceKilled = false;
      let killedPiece: Piece | null = null;

      // En Passant Kill Logic
      if (movingPiece.type === PieceType.PAWN && playerEnPassantTarget && bestMove.to.row === playerEnPassantTarget.row && bestMove.to.col === playerEnPassantTarget.col) {
        const victimRow = bestMove.to.row - 1;
        if (boardCopy[victimRow][bestMove.to.col].piece) {
          playerPieceKilled = true;
          killedPiece = boardCopy[victimRow][bestMove.to.col].piece!;
          setDeadPieces((prev) => [...prev, killedPiece!.type]);
        }
        boardCopy[victimRow][bestMove.to.col].piece = null;
      } 
      // Normal Kill Logic
      else if (targetPiece && targetPiece.side === Side.WHITE) {
        playerPieceKilled = true;
        killedPiece = targetPiece;
        setDeadPieces((prev) => [...prev, targetPiece.type]);
      }

      // Set En Passant Target for next turn if pawn moved 2 squares
      if (movingPiece.type === PieceType.PAWN && Math.abs(bestMove.from.row - bestMove.to.row) === 2) {
        nextEnPassantTarget = { row: (bestMove.from.row + bestMove.to.row) / 2, col: bestMove.from.col };
      }

      // Handle Wall Breaking
      if (boardCopy[bestMove.to.row][bestMove.to.col].tileEffect === TileEffect.WALL && (movingPiece.type === PieceType.SHIP || movingPiece.type === PieceType.ELEPHANT)) {
        boardCopy[bestMove.to.row][bestMove.to.col].tileEffect = TileEffect.NONE;
      }

      // Move Piece
      boardCopy[bestMove.to.row][bestMove.to.col].piece = { ...movingPiece, hasMoved: true };
      boardCopy[bestMove.from.row][bestMove.from.col].piece = null;

      // --- TELEPORT LOGIC ---
      if (boardCopy[bestMove.to.row][bestMove.to.col].tileEffect === TileEffect.TELEPORT && !playerPieceKilled) {
          const teleId = boardCopy[bestMove.to.row][bestMove.to.col].teleportId;
          const otherTile = boardCopy.flat().find(cell => cell.teleportId === teleId && (cell.position.row !== bestMove!.to.row || cell.position.col !== bestMove!.to.col));
          if (otherTile && !otherTile.piece) {
              boardCopy[otherTile.position.row][otherTile.position.col].piece = boardCopy[bestMove.to.row][bestMove.to.col].piece;
              boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
              bestMove.to = otherTile.position; // Update 'to' for subsequent effects
              soundManager.playSfx('spawn');
          }
      }
      // ----------------------

      // Handle Traps
      if (targetPiece && targetPiece.side === Side.WHITE && targetPiece.trapped) {
        boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
        soundManager.playSfx('capture');
      }

      // Handle Tile Effects
      const effect = boardCopy[bestMove.to.row][bestMove.to.col].tileEffect;
      if (effect === TileEffect.LAVA && movingPiece.type !== PieceType.DRAGON) {
        if (!(boardCopy[bestMove.to.row][bestMove.to.col].piece!.immortalTurns && boardCopy[bestMove.to.row][bestMove.to.col].piece!.immortalTurns! > 0)) {
          boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
          soundManager.playSfx('capture');
        }
      } else if (effect === TileEffect.FROZEN && boardCopy[bestMove.to.row][bestMove.to.col].piece) {
          boardCopy[bestMove.to.row][bestMove.to.col].piece!.frozenTurns = 2;
          soundManager.playSfx('frozen');
      } else if (effect === TileEffect.PROMOTION && boardCopy[bestMove.to.row][bestMove.to.col].piece) {
          const p = boardCopy[bestMove.to.row][bestMove.to.col].piece!;
          if (p.type === PieceType.KNIGHT) {
              p.type = PieceType.AMAZON;
              soundManager.playSfx('spawn');
          } else if ([PieceType.PAWN, PieceType.ROOK, PieceType.BISHOP].includes(p.type)) {
              p.type = PieceType.QUEEN;
              soundManager.playSfx('spawn');
          }
      }

      // Promotion
      if (boardCopy[bestMove.to.row][bestMove.to.col].piece && movingPiece.type === PieceType.PAWN && bestMove.to.row === size - 1) {
        boardCopy[bestMove.to.row][bestMove.to.col].piece!.type = PieceType.QUEEN;
        soundManager.playSfx('spawn');
      }

      if (playerPieceKilled && killedPiece) {
        soundManager.playSfx('capture');
        // Relic: Last Will
        const lastWill = relics.find((r) => r.type === RelicType.LAST_WILL);
        if (lastWill) spawnRelic(boardCopy, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
        
        if (onPieceKilled) onPieceKilled(killedPiece);
        
        // Boss: Blood King
        if (activeBoss === BossType.BLOOD_KING) {
          const emptySpots: Position[] = [];
          for (let r = 0; r < Math.floor(size / 2); r++) {
            for (let c = 0; c < size; c++) {
              if (!boardCopy[r][c].piece && boardCopy[r][c].tileEffect !== TileEffect.WALL) emptySpots.push({ row: r, col: c });
            }
          }
          if (emptySpots.length > 0) {
            const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            const pool = [PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP];
            boardCopy[spot.row][spot.col].piece = {
              id: uuidv4(), type: pool[Math.floor(Math.random() * pool.length)], side: Side.BLACK, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
            };
          }
        }

        // Boss: Soul Corruptor (Curse on player death)
        if (activeBoss === BossType.SOUL_CORRUPTOR && Math.random() < RANDOM_ADD_CURSE_CARD_IN_BOSS) {
            // FIX: Add to local deck instead of calling addRandomCurse directly
            const curse = getRandomCurse(settings.language);
            currentTurnDeck.push(curse);
            // Shuffle local deck
            currentTurnDeck = shuffleArray(currentTurnDeck);
            setAnimatingCards(prev => [...prev, curse]);
            soundManager.playSfx('loss');
            if (isCampaign && onAddCardToMasterDeck) {
                onAddCardToMasterDeck(curse);
            }
        }

      } else {
        soundManager.playSfx('move');
      }
      setLastMoveFrom(bestMove.from);
      setLastMoveTo(bestMove.to);
    } else {
      setLastEnemyMoveType(null);
    }

    setEnPassantTarget(nextEnPassantTarget);
    
    if (checkLoss(boardCopy, deck, hand)) {
      setTimeout(() => {
        soundManager.playSfx('loss');
        setIsGameEnded(true);
        setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
      }, 0);
    }
    if (checkWin(boardCopy)) {
      setTimeout(() => {
        soundManager.playSfx('win');
        setIsGameEnded(true);
        setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
      }, 0);
    }
    passTurn();
  };

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== Side.WHITE || isGameEnded) return;
    const clickedPiece = board[r][c].piece;
    if (selectedCardId && cardTargetMode) { handleCardTargeting(r, c, clickedPiece); return; }
    const isMoveValid = validMoves.some((m) => m.row === r && m.col === c);
    if (selectedPiecePos && isMoveValid) { executeMove(selectedPiecePos, { row: r, col: c }); return; }
    if (clickedPiece?.side === Side.WHITE) {
      setSelectedEnemyPos(null); setEnemyValidMoves([]);
      if (selectedPiecePos?.row === r && selectedPiecePos?.col === c) { setSelectedPiecePos(null); setValidMoves([]); }
      else {
        setSelectedPiecePos({ row: r, col: c });
        setValidMoves(getValidMoves(board, clickedPiece!, { row: r, col: c }, enPassantTarget, lastEnemyMoveType, activeBoss));
      }
      return;
    }
    if (clickedPiece?.side === Side.BLACK) {
      setSelectedPiecePos(null); setValidMoves([]);
      if (
        activeBoss === BossType.THE_FACELESS &&
        clickedPiece.type !== PieceType.KING
      ) {
        return;
      }
      if (selectedEnemyPos?.row === r && selectedEnemyPos?.col === c) { setSelectedEnemyPos(null); setEnemyValidMoves([]); }
      else {
        setSelectedEnemyPos({ row: r, col: c });
        setEnemyValidMoves(getValidMoves(board, clickedPiece!, { row: r, col: c }, null, null, activeBoss));
      }
      return;
    }
    setSelectedPiecePos(null); setValidMoves([]); setSelectedEnemyPos(null); setEnemyValidMoves([]);
  };

  const handleSquareDoubleClick = (r: number, c: number) => {
    const cell = board[r][c];
    const piece = cell.piece;
    const effect = cell.tileEffect;
    if (piece) {
      let typeDisplay = t.pieces[piece.type];
      
      // Boss Disguise Check
      if (activeBoss === BossType.THE_FACELESS && piece.side === Side.BLACK && piece.type !== PieceType.KING) {
          typeDisplay = t.pieces[PieceType.PAWN] + " (?)";
      }

      let content = `Type: ${typeDisplay}`;
      if (piece.variant) content += `\nElement: ${piece.variant}`;
      if ((piece.frozenTurns || 0) > 0) content += `\nFrozen: ${piece.frozenTurns} turns`;
      if ((piece.immortalTurns || 0) > 0) content += `\nImmortal: ${piece.immortalTurns} turns`;
      if (piece.trapped) content += `\nStatus: Trapped (Suicide Mode)`;
      if (piece.mimic) content += `\nStatus: Mimic`;
      if (piece.ascendedTurns) content += `\nStatus: Ascended (${piece.ascendedTurns} turns left)`;
      if (piece.type === PieceType.KING && piece.side === Side.BLACK && activeBoss !== BossType.NONE) {
        const bossData = t.bosses[activeBoss];
        content += `\n\n[BOSS DETECTED]\nName: ${bossData.name}\n${bossData.desc}\nAbility: ${bossData.ability}`;
      }
      setInfoModalContent({ title: typeDisplay, content });
    } else if (effect !== TileEffect.NONE) {
      setInfoModalContent({ title: t.tiles[effect].name, content: t.tiles[effect].desc });
    }
  };

  const handleCardClick = (card: Card) => {
    if (turn !== Side.WHITE || isGameEnded) return;
    
    // Prevent clicking unplayable curse cards
    if (card.type.startsWith('CURSE_')) {
        // alert("This is a Curse card. It cannot be played, but affects you while in hand.");
        return;
    }

    if (selectedCardId === card.id) { setSelectedCardId(null); setCardTargetMode(null); return; }
    if (cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN) { alert(`You have reached the maximum of ${MAX_CARDS_PLAYED_PER_TURN} cards played this turn.`); return; }
    
    // Curse of Silence (Spell Tax)
    if (hand.some(c => c.type === CardType.CURSE_SPELL_TAX)) {
       setGold(g => Math.max(0, g - CURSE_SPELL_TAX_GOLD_MINUS));
    }

    soundManager.playSfx('click');
    setSelectedCardId(card.id);
    setSelectedPiecePos(null); setValidMoves([]); setSelectedEnemyPos(null); setEnemyValidMoves([]);
    if (card.type.includes('SPAWN') || card.type === CardType.EFFECT_BACK_BASE) {
      if (card.type === CardType.SPAWN_REVIVE) playInstantCard(card);
      else setCardTargetMode({ type: card.type, step: 'SELECT_SQUARE' });
    } else if (['EFFECT_SWITCH', 'EFFECT_IMMORTAL', 'EFFECT_MIMIC', 'EFFECT_ASCEND', 'EFFECT_IMMORTAL_LONG', 'EFFECT_AREA_FREEZE'].includes(card.type) || card.type.includes('BORROW')) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else if (card.type === CardType.EFFECT_PROMOTION_TILE || card.type === CardType.EFFECT_CONVERT_ENEMY || card.type === CardType.EFFECT_DUPLICATE || card.type === CardType.EFFECT_TELEPORT) {
      playInstantCard(card);
    } else {
      playInstantCard(card);
    }
  };

  const playInstantCard = (card: Card) => {
    const result = getBoardAfterInstantCard(board, card, deadPieces, setDeadPieces, setIsEnemyMoveLimited, killedEnemyPieces, hand, addCardToDeck);
    
    if (result.error) {
        alert(result.error);
        return;
    }

    if (result.played) {
        setBoard(result.newBoard);
        if (result.sound) soundManager.playSfx(result.sound);
        consumeCard(card.id);
    }
  };

  const handleCardTargeting = (r: number, c: number, piece: Piece | null) => {
    if (!cardTargetMode || !selectedCardId) return;
    const result = getBoardAfterTargetCard(board, cardTargetMode.type, cardTargetMode.step, { row: r, col: c }, cardTargetMode.sourcePos, piece);

    if (result.error) {
        alert(result.error);
        return;
    }

    if (result.success) {
        setBoard(result.newBoard);
        if (result.sound) soundManager.playSfx(result.sound);
        if (result.lastPlayerSpawnedType) setLastPlayerSpawnedType(result.lastPlayerSpawnedType);
        
        if (result.nextStep) {
            setCardTargetMode({ ...cardTargetMode, step: result.nextStep, sourcePos: result.sourcePos });
        } else {
            consumeCard(selectedCardId);
        }
    }
  };

  const consumeCard = (id: string) => {
    const nextHand = hand.filter((c) => c.id !== id);
    setHand(nextHand);
    setSelectedCardId(null);
    setCardTargetMode(null);
    setCardsPlayed((prev) => prev + 1);
    if (checkLoss(board, deck, nextHand)) {
      soundManager.playSfx('loss');
      setIsGameEnded(true);
      setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
    }
  };

  return {
    gameState: {
      board, turn, turnCount, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, deck, hand, cardsPlayed, selectedCardId, cardTargetMode, showDeckModal, selectedRelic, infoModalContent, selectedEnemyPos, enemyValidMoves, checkState, activeBoss, lastEnemyMoveType, animatingCards
    },
    actions: {
      initGame, handleSquareClick, handleSquareDoubleClick, handleCardClick, setShowDeckModal, setSelectedRelic, setInfoModalContent, handleAnimationComplete
    },
  };
};