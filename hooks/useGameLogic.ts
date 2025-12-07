
import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Cell, Piece, PieceType, Side, Position, TileEffect, Card, CardType,
  GameSettings, Relic, RelicType, BossType,
} from '../types';
import { getValidMoves, isValidPos } from '../utils/gameLogic';
import { getBestEnemyMove } from '../utils/aiLogic';
import {
  PIECE_GOLD_VALUES, MAX_CARDS_IN_HAND, MAX_CARDS_PLAYED_PER_TURN,
  RELIC_LEVEL_REWARDS, WAIT_END_GAME_TIMEOUT,
  AREA_FREEZE_DURATION, ASCEND_DURATION, IMMORTAL_LONG_DURATION,
} from '../constants';
import { TRANSLATIONS } from '../utils/locales';
import { soundManager } from '../utils/soundManager';
import { initializeGameBoard } from './game/useGameInit';
import { applyBossAbilities } from './game/useBossAI';

interface UseGameLogicProps {
  settings: GameSettings;
  isCampaign: boolean;
  relics: Relic[];
  setGold: React.Dispatch<React.SetStateAction<number>>;
  onWin: () => void;
  onLoss: () => void;
  onPieceKilled?: (piece: Piece) => void;
}

export const useGameLogic = ({
  settings, isCampaign, relics, setGold, onWin, onLoss, onPieceKilled,
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
      setLastPlayerSpawnedType(null);
      tempTileEffects.current = [];
  };

  const calculateCheckState = (boardState: Cell[][]) => {
    const isSideInCheck = (side: Side): boolean => {
      let kingPos: Position | null = null;
      const size = boardState.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.type === PieceType.KING && p.side === side) {
            kingPos = { row: r, col: c };
            break;
          }
        }
        if (kingPos) break;
      }
      if (!kingPos) return false;
      const enemySide = side === Side.WHITE ? Side.BLACK : Side.WHITE;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardState[r][c].piece;
          if (p && p.side === enemySide) {
            const moves = getValidMoves(boardState, p, { row: r, col: c }, null, null);
            if (moves.some((m) => m.row === kingPos!.row && m.col === kingPos!.col)) return true;
          }
        }
      }
      return false;
    };
    setCheckState({ white: isSideInCheck(Side.WHITE), black: isSideInCheck(Side.BLACK) });
  };

  const drawCard = useCallback(() => {
    if (deck.length > 0 && hand.length < MAX_CARDS_IN_HAND) {
      const newDeck = [...deck];
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
      }
    }
  }, [deck, hand, activeBoss]);

  const checkLossCondition = (currentBoard: Cell[][], currentDeck: Card[], currentHand: Card[]) => {
    let whitePieces = 0;
    let whiteKing = false;
    currentBoard.forEach((row) => row.forEach((cell) => {
        if (cell.piece?.side === Side.WHITE) {
          if (cell.piece.type === PieceType.KING) whiteKing = true;
          else whitePieces++;
        }
    }));
    if (!whiteKing) return true;
    if (currentDeck.length === 0 && currentHand.length === 0 && whitePieces === 0) return true;
    return false;
  };

  const checkWinCondition = (currentBoard: Cell[][]) => {
    let blackPieces = 0;
    let blackKing = false;
    currentBoard.forEach((row) => row.forEach((cell) => {
        if (cell.piece?.side === Side.BLACK) {
          if (cell.piece.type === PieceType.KING) blackKing = true;
          else blackPieces++;
        }
    }));
    if (!blackKing) return true;
    if (blackPieces === 0) return true;
    return false;
  };

  const spawnRelicPiece = (boardState: Cell[][], side: Side, type: PieceType) => {
    const size = boardState.length;
    const baseRows = side === Side.WHITE ? [size - 1, size - 2] : [0, 1];
    const validSpots: Position[] = [];
    baseRows.forEach((r) => {
      for (let c = 0; c < size; c++) {
        const cell = boardState[r][c];
        if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) {
          validSpots.push({ row: r, col: c });
        }
      }
    });
    if (validSpots.length > 0) {
      const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
      boardState[spot.row][spot.col].piece = {
        id: uuidv4(), type: type, side: side, hasMoved: false, frozenTurns: 0, immortalTurns: 0,
      };
      soundManager.playSfx('spawn');
    }
  };

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
    }

    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined };
    newBoard[from.row][from.col].piece = null;

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
    }

    if (newBoard[to.row][to.col].piece && piece.type === PieceType.PAWN && to.row === 0) {
      newBoard[to.row][to.col].piece!.type = PieceType.QUEEN;
      soundManager.playSfx('spawn');
    }

    if (enemyKilled) {
      soundManager.playSfx('capture');
      const necromancy = relics.find((r) => r.type === RelicType.NECROMANCY);
      if (necromancy) spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(necromancy.level, 5)]);
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
    } else {
      soundManager.playSfx('move');
    }

    if (selfKilled) {
      const lastWill = relics.find((r) => r.type === RelicType.LAST_WILL);
      if (lastWill) spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
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

    if (checkWinCondition(newBoard)) {
      soundManager.playSfx('win');
      setIsGameEnded(true);
      setTimeout(onWin, WAIT_END_GAME_TIMEOUT);
      return;
    }
    if (checkLossCondition(newBoard, deck, hand)) {
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
    const { board: boardAfterBoss, newTiles } = applyBossAbilities([...currentBoard], activeBoss, bossTiles, currentTurn);
    setBossTiles(newTiles);
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
      drawCard();
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
        if (lastWill) spawnRelicPiece(boardCopy, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
        
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
      } else {
        soundManager.playSfx('move');
      }
      setLastMoveFrom(bestMove.from);
      setLastMoveTo(bestMove.to);
    } else {
      setLastEnemyMoveType(null);
    }

    setEnPassantTarget(nextEnPassantTarget);
    
    if (checkLossCondition(boardCopy, deck, hand)) {
      setTimeout(() => {
        soundManager.playSfx('loss');
        setIsGameEnded(true);
        setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
      }, 0);
    }
    if (checkWinCondition(boardCopy)) {
      setTimeout(() => {
        soundManager.playSfx('win');
        setIsGameEnded(true);
        setTimeout(onWin, WAIT_END_GAME_TIMEOUT);
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
        setValidMoves(getValidMoves(board, clickedPiece!, { row: r, col: c }, enPassantTarget, lastEnemyMoveType));
      }
      return;
    }
    if (clickedPiece?.side === Side.BLACK) {
      setSelectedPiecePos(null); setValidMoves([]);
      if (selectedEnemyPos?.row === r && selectedEnemyPos?.col === c) { setSelectedEnemyPos(null); setEnemyValidMoves([]); }
      else {
        setSelectedEnemyPos({ row: r, col: c });
        setEnemyValidMoves(getValidMoves(board, clickedPiece!, { row: r, col: c }, null, null));
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
      let content = `Type: ${t.pieces[piece.type]}`;
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
      setInfoModalContent({ title: t.pieces[piece.type], content });
    } else if (effect !== TileEffect.NONE) {
      setInfoModalContent({ title: t.tiles[effect].name, content: t.tiles[effect].desc });
    }
  };

  const handleCardClick = (card: Card) => {
    if (turn !== Side.WHITE || isGameEnded) return;
    if (selectedCardId === card.id) { setSelectedCardId(null); setCardTargetMode(null); return; }
    if (cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN) { alert(`You have reached the maximum of ${MAX_CARDS_PLAYED_PER_TURN} cards played this turn.`); return; }
    soundManager.playSfx('click');
    setSelectedCardId(card.id);
    setSelectedPiecePos(null); setValidMoves([]); setSelectedEnemyPos(null); setEnemyValidMoves([]);
    if (card.type.includes('SPAWN') || card.type === CardType.EFFECT_BACK_BASE) {
      if (card.type === CardType.SPAWN_REVIVE) playInstantCard(card);
      else setCardTargetMode({ type: card.type, step: 'SELECT_SQUARE' });
    } else if (['EFFECT_SWITCH', 'EFFECT_IMMORTAL', 'EFFECT_MIMIC', 'EFFECT_ASCEND', 'EFFECT_IMMORTAL_LONG', 'EFFECT_AREA_FREEZE'].includes(card.type) || card.type.includes('BORROW')) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else {
      playInstantCard(card);
    }
  };

  const playInstantCard = (card: Card) => {
    const newBoard = board.map((row) => [...row]);
    let played = false;
    if (card.type === CardType.EFFECT_FREEZE) {
      const enemies: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => { if (cell.piece?.side === Side.BLACK) enemies.push({ row: r, col: c }); }));
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (newBoard[target.row][target.col].piece) {
          newBoard[target.row][target.col].piece!.frozenTurns = 1;
          played = true;
          soundManager.playSfx('frozen');
        }
      }
    } else if (card.type === CardType.EFFECT_LIMIT) {
      setIsEnemyMoveLimited(true); played = true; soundManager.playSfx('frozen');
    } else if (card.type === CardType.EFFECT_TRAP) {
      const friends: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => { if (cell.piece?.side === Side.WHITE && !cell.piece.trapped) friends.push({ row: r, col: c }); }));
      if (friends.length > 0) {
        const target = friends[Math.floor(Math.random() * friends.length)];
        newBoard[target.row][target.col].piece!.trapped = true;
        played = true;
        soundManager.playSfx('spawn');
      } else alert('No friendly pieces available.');
    } else if (card.type === CardType.SPAWN_REVIVE) {
      if (deadPieces.length === 0) { alert('No dead pieces to revive!'); return; }
      const size = newBoard.length;
      const validSpots: Position[] = [];
      [size - 1, size - 2].forEach((r) => {
        for (let c = 0; c < size; c++) {
          const cell = newBoard[r][c];
          if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) validSpots.push({ row: r, col: c });
        }
      });
      if (validSpots.length > 0) {
        const pieceType = deadPieces[Math.floor(Math.random() * deadPieces.length)];
        const index = deadPieces.indexOf(pieceType);
        const newDeadPieces = [...deadPieces];
        if (index > -1) newDeadPieces.splice(index, 1);
        setDeadPieces(newDeadPieces);
        const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
        newBoard[spot.row][spot.col].piece = { id: uuidv4(), type: pieceType, side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0 };
        played = true;
        soundManager.playSfx('spawn');
      } else alert('No space in base rows.');
    }
    if (played) { setBoard(newBoard); consumeCard(card.id); }
  };

  const handleCardTargeting = (r: number, c: number, piece: Piece | null) => {
    if (!cardTargetMode || !selectedCardId) return;
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const { type, step } = cardTargetMode;
    const size = board.length;

    if (type.includes('SPAWN')) {
      if (r >= size - 2 && !piece) {
        if (newBoard[r][c].tileEffect === TileEffect.WALL || newBoard[r][c].tileEffect === TileEffect.HOLE) { alert('Cannot spawn on an obstacle.'); return; }
        let spawnType = PieceType.PAWN;
        let variant: 'LAVA' | 'ABYSS' | 'FROZEN' | undefined = undefined;
        if (type.includes('DRAGON')) {
          spawnType = PieceType.DRAGON;
          if (type.includes('LAVA')) variant = 'LAVA';
          if (type.includes('ABYSS')) variant = 'ABYSS';
          if (type.includes('FROZEN')) variant = 'FROZEN';
        } else {
            const map: Record<string, PieceType> = {
                'SPAWN_QUEEN': PieceType.QUEEN, 'SPAWN_ROOK': PieceType.ROOK, 'SPAWN_BISHOP': PieceType.BISHOP, 'SPAWN_KNIGHT': PieceType.KNIGHT, 'SPAWN_PAWN': PieceType.PAWN,
                'SPAWN_FOOL': PieceType.FOOL, 'SPAWN_SHIP': PieceType.SHIP, 'SPAWN_ELEPHANT': PieceType.ELEPHANT, 'SPAWN_CHANCELLOR': PieceType.CHANCELLOR,
                'SPAWN_ARCHBISHOP': PieceType.ARCHBISHOP, 'SPAWN_MANN': PieceType.MANN, 'SPAWN_AMAZON': PieceType.AMAZON, 'SPAWN_CENTAUR': PieceType.CENTAUR,
                'SPAWN_ZEBRA': PieceType.ZEBRA, 'SPAWN_CHAMPION': PieceType.CHAMPION
            };
            if (map[type]) spawnType = map[type];
        }
        newBoard[r][c].piece = { id: uuidv4(), type: spawnType, side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0, variant };
        if (newBoard[r][c].tileEffect === TileEffect.FROZEN) newBoard[r][c].piece!.frozenTurns = 2;
        if (newBoard[r][c].tileEffect === TileEffect.LAVA && spawnType !== PieceType.DRAGON) newBoard[r][c].piece = null;
        setLastPlayerSpawnedType(spawnType);
        setBoard(newBoard);
        soundManager.playSfx('spawn');
        consumeCard(selectedCardId);
      } else alert('Can only spawn on empty squares in your base rows.');
      return;
    }

    if (type === CardType.EFFECT_BACK_BASE) {
      if (step === 'SELECT_SQUARE' && piece?.side === Side.WHITE && piece.type !== PieceType.KING) {
        let targetPos: Position | null = null;
        const baseRows = [size - 1, size - 2];
        const center = Math.floor(size / 2);
        const cols = Array.from({ length: size }, (_, i) => i).sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
        for (let row of baseRows) {
          for (let col of cols) {
            if (!newBoard[row][col].piece && newBoard[row][col].tileEffect !== TileEffect.WALL && newBoard[row][col].tileEffect !== TileEffect.HOLE) {
              targetPos = { row, col };
              break;
            }
          }
          if (targetPos) break;
        }
        if (targetPos) {
          newBoard[targetPos.row][targetPos.col].piece = { ...piece, hasMoved: false };
          newBoard[r][c].piece = null;
          setBoard(newBoard);
          soundManager.playSfx('spawn');
          consumeCard(selectedCardId);
        } else alert('No valid empty space in base rows!');
      }
      return;
    }

    if (type.includes('BORROW') && piece?.side === Side.WHITE) {
      const borrowType = type.replace('EFFECT_BORROW_', '') as PieceType;
      newBoard[r][c].piece = { ...piece, tempMoveOverride: borrowType };
      setBoard(newBoard); soundManager.playSfx('spawn'); consumeCard(selectedCardId); return;
    }

    if (type === CardType.EFFECT_IMMORTAL && step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...piece, immortalTurns: 2 };
        setBoard(newBoard); soundManager.playSfx('spawn'); consumeCard(selectedCardId); return;
    }
    if (type === CardType.EFFECT_IMMORTAL_LONG && step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...piece, immortalTurns: IMMORTAL_LONG_DURATION };
        setBoard(newBoard); soundManager.playSfx('spawn'); consumeCard(selectedCardId); return;
    }
    if (type === CardType.EFFECT_MIMIC && step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...piece, mimic: true };
        setBoard(newBoard); soundManager.playSfx('spawn'); consumeCard(selectedCardId); return;
    }
    if (type === CardType.EFFECT_ASCEND) {
      if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE && piece.type === PieceType.PAWN) {
        const promotions = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];
        const promo = promotions[Math.floor(Math.random() * promotions.length)];
        newBoard[r][c].piece = { ...piece, type: promo, ascendedTurns: ASCEND_DURATION };
        setBoard(newBoard); soundManager.playSfx('spawn'); consumeCard(selectedCardId);
      } else if (piece?.type !== PieceType.PAWN) alert('Ascend can only be used on a Pawn.');
      return;
    }
    if (type === CardType.EFFECT_AREA_FREEZE && step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const tr = r + dr; const tc = c + dc;
          if (isValidPos({ row: tr, col: tc }, size)) {
            const targetPiece = newBoard[tr][tc].piece;
            if (targetPiece && targetPiece.side === Side.BLACK) targetPiece.frozenTurns = AREA_FREEZE_DURATION;
          }
        }
      }
      setBoard(newBoard); soundManager.playSfx('frozen'); consumeCard(selectedCardId); return;
    }
    if (type === CardType.EFFECT_SWITCH) {
      if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
        setCardTargetMode({ ...cardTargetMode, step: 'SELECT_PIECE_2', sourcePos: { row: r, col: c } });
      } else if (step === 'SELECT_PIECE_2' && piece?.side === Side.WHITE && cardTargetMode.sourcePos) {
        const p1 = newBoard[cardTargetMode.sourcePos.row][cardTargetMode.sourcePos.col].piece;
        const p2 = piece;
        if (p1 && p2) {
          newBoard[cardTargetMode.sourcePos.row][cardTargetMode.sourcePos.col].piece = p2;
          newBoard[r][c].piece = p1;
          setBoard(newBoard); soundManager.playSfx('move'); consumeCard(selectedCardId);
        }
      }
      return;
    }
  };

  const consumeCard = (id: string) => {
    const nextHand = hand.filter((c) => c.id !== id);
    setHand(nextHand);
    setSelectedCardId(null);
    setCardTargetMode(null);
    setCardsPlayed((prev) => prev + 1);
    if (checkLossCondition(board, deck, nextHand)) {
      soundManager.playSfx('loss');
      setIsGameEnded(true);
      setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
    }
  };

  return {
    gameState: {
      board, turn, turnCount, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, deck, hand, cardsPlayed, selectedCardId, cardTargetMode, showDeckModal, selectedRelic, infoModalContent, selectedEnemyPos, enemyValidMoves, checkState, activeBoss, lastEnemyMoveType,
    },
    actions: {
      initGame, handleSquareClick, handleSquareDoubleClick, handleCardClick, setShowDeckModal, setSelectedRelic, setInfoModalContent,
    },
  };
};
