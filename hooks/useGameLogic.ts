

import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Cell, Piece, PieceType, Side, Position, TileEffect, Card, CardType, GameSettings, Relic, RelicType, BossType 
} from '../types';
import { 
  generateBoard, getValidMoves, isValidPos 
} from '../utils/gameLogic';
import { 
  getDeckTemplate, PIECE_GOLD_VALUES, MAX_CARDS_IN_HAND, MAX_CARDS_PLAYED_PER_TURN, RELIC_LEVEL_REWARDS, WAIT_END_GAME_TIMEOUT, getTileEffectInfo, getBossInfo,
  AREA_FREEZE_DURATION, ASCEND_DURATION, IMMORTAL_LONG_DURATION
} from '../constants';
import { TRANSLATIONS } from '../utils/locales';
import { soundManager } from '../utils/soundManager';

interface UseGameLogicProps {
  settings: GameSettings;
  isCampaign: boolean;
  relics: Relic[];
  setGold: React.Dispatch<React.SetStateAction<number>>;
  onWin: () => void;
  onLoss: () => void;
}

export const useGameLogic = ({
  settings,
  isCampaign,
  relics,
  setGold,
  onWin,
  onLoss
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
  const [checkState, setCheckState] = useState<{white: boolean, black: boolean}>({ white: false, black: false });
  const [activeBoss, setActiveBoss] = useState<BossType>(BossType.NONE);
  const [bossTiles, setBossTiles] = useState<Position[]>([]);
  
  // New States for Advanced Mechanics
  const [lastEnemyMoveType, setLastEnemyMoveType] = useState<PieceType | null>(null);
  // Changed to useRef to avoid stale closure issues in setTimeout callbacks
  const tempTileEffects = useRef<{ pos: Position, originalEffect: TileEffect, variant: TileEffect, turnsLeft: number }[]>([]);
  const [deadPieces, setDeadPieces] = useState<PieceType[]>([]);

  // Enemy Visual State
  const [selectedEnemyPos, setSelectedEnemyPos] = useState<Position | null>(null);
  const [enemyValidMoves, setEnemyValidMoves] = useState<Position[]>([]);

  // Card State
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardTargetMode, setCardTargetMode] = useState<{
    type: CardType; 
    step: 'SELECT_PIECE_1' | 'SELECT_PIECE_2' | 'SELECT_SQUARE';
    sourcePos?: Position;
  } | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null); 
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const t = TRANSLATIONS[settings.language];
  const deckTemplate = getDeckTemplate(settings.language);

  const initGame = (campaignMode: boolean, campaignDeck?: Card[], level: number = 1, bossType: BossType = BossType.NONE) => {
    let size = settings.boardSize;
    let eCount = settings.enemyCount;
    let pCount = settings.playerCount;
    let currentBoss = bossType;

    if (campaignMode) {
      size = Math.min(6 + Math.floor((level - 1) / 2), 12);
      eCount = Math.min(2 + level, 12); 
      pCount = 0; 
    } else {
        currentBoss = settings.customBossType;
    }

    const newBoard = generateBoard(size);
    
    // Place Player King
    const kingPos = { row: size - 1, col: Math.floor(size / 2) };
    newBoard[kingPos.row][kingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.WHITE,
      hasMoved: false,
      frozenTurns: 0,
      immortalTurns: 0
    };

    // Place Enemy King
    const enemyKingPos = { row: 0, col: Math.floor(size / 2) };
    newBoard[enemyKingPos.row][enemyKingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.BLACK,
      hasMoved: false,
      frozenTurns: 0,
      immortalTurns: 0
    };

    // Place Random Enemies
    let enemiesPlaced = 0;
    let enemyPool = [PieceType.PAWN];
    if (level >= 2) enemyPool.push(PieceType.KNIGHT);
    if (level >= 3) enemyPool.push(PieceType.BISHOP);
    if (level >= 4) enemyPool.push(PieceType.ROOK);
    if (level >= 6) enemyPool.push(PieceType.QUEEN);

    if (!campaignMode) {
      enemyPool = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN, PieceType.QUEEN];
    }

    let safety = 0;
    while (enemiesPlaced < eCount && safety < 1000) {
      safety++;
      const r = Math.floor(Math.random() * 2);
      const c = Math.floor(Math.random() * size);
      if (!newBoard[r][c].piece) {
        newBoard[r][c].piece = {
          id: uuidv4(),
          type: enemyPool[Math.floor(Math.random() * enemyPool.length)],
          side: Side.BLACK,
          hasMoved: false,
          frozenTurns: 0,
          immortalTurns: 0
        };
        enemiesPlaced++;
      }
    }

    if (currentBoss === BossType.UNDEAD_LORD) {
        // Initial immortal piece setup
        const candidates: Position[] = [];
        for(let r=0; r<size; r++){
            for(let c=0; c<size; c++){
                const p = newBoard[r][c].piece;
                if(p && p.side === Side.BLACK && p.type !== PieceType.KING) {
                    candidates.push({row:r, col:c});
                }
            }
        }
        if (candidates.length > 0) {
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            if(newBoard[chosen.row][chosen.col].piece) {
                newBoard[chosen.row][chosen.col].piece!.immortalTurns = 999;
            }
        }
    }

    // Place Player Pieces (Custom Mode or Campaign Relics)
    if (!campaignMode) {
        let playersPlaced = 0;
        const playerTypes = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN];
        safety = 0;
        while (playersPlaced < pCount && safety < 1000) {
        safety++;
        const r = (size - 2) + Math.floor(Math.random() * 2);
        const c = Math.floor(Math.random() * size);
        if (!newBoard[r][c].piece) {
            newBoard[r][c].piece = {
            id: uuidv4(),
            type: playerTypes[Math.floor(Math.random() * playerTypes.length)],
            side: Side.WHITE,
            hasMoved: false,
            frozenTurns: 0,
            immortalTurns: 0
            };
            playersPlaced++;
        }
        }
    } else {
        // Handle Starter Piece Relics for Campaign
        const starterRelics = relics.filter(r => [
            RelicType.START_PAWN, RelicType.START_ROOK, RelicType.START_KNIGHT, 
            RelicType.START_BISHOP, RelicType.START_QUEEN
        ].includes(r.type));

        starterRelics.forEach(relic => {
            let type = PieceType.PAWN;
            if (relic.type === RelicType.START_ROOK) type = PieceType.ROOK;
            if (relic.type === RelicType.START_KNIGHT) type = PieceType.KNIGHT;
            if (relic.type === RelicType.START_BISHOP) type = PieceType.BISHOP;
            if (relic.type === RelicType.START_QUEEN) type = PieceType.QUEEN;

            const count = relic.level; 
            let placed = 0;
            let loopSafety = 0;
            while(placed < count && loopSafety < 100) {
                loopSafety++;
                const r = (size - 2) + Math.floor(Math.random() * 2);
                const c = Math.floor(Math.random() * size);
                if (r >= 0 && r < size && c >= 0 && c < size && !newBoard[r][c].piece) {
                    newBoard[r][c].piece = {
                        id: uuidv4(),
                        type,
                        side: Side.WHITE,
                        hasMoved: false,
                        frozenTurns: 0,
                        immortalTurns: 0
                    };
                    placed++;
                }
            }
        });
    }

    let gameDeck: Card[] = [];
    if (campaignMode && campaignDeck) {
      gameDeck = [...campaignDeck].sort(() => Math.random() - 0.5);
    } else {
      gameDeck = Array.from({ length: 20 }).map(() => {
          const template = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
          return { ...template, id: uuidv4() };
      });
    }
    
    const initialHand = gameDeck.splice(0, 3);

    setBoard(newBoard);
    setDeck(gameDeck);
    setHand(initialHand);
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
    setActiveBoss(currentBoss);
    setBossTiles([]);
    setLastEnemyMoveType(null);
    setDeadPieces([]);
    tempTileEffects.current = [];
    
    // Resume music if enabled
    soundManager.init();
    if (settings.soundEnabled) {
       soundManager.startMusic();
    }
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
                  if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
                     return true;
                  }
               }
            }
         }
         return false;
     };

     setCheckState({
        white: isSideInCheck(Side.WHITE),
        black: isSideInCheck(Side.BLACK)
     });
  };

  const drawCard = useCallback(() => {
    if (deck.length > 0 && hand.length < MAX_CARDS_IN_HAND) {
      const newDeck = [...deck];
      const card = newDeck.pop();
      setDeck(newDeck);
      if (card) {
          setHand(prev => [...prev, card]);
          soundManager.playSfx('draw');
      }
    }
  }, [deck, hand]);

  const checkLossCondition = (currentBoard: Cell[][], currentDeck: Card[], currentHand: Card[]) => {
      let whitePieces = 0;
      let whiteKing = false;
      currentBoard.forEach(row => row.forEach(cell => {
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
      currentBoard.forEach(row => row.forEach(cell => {
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
      baseRows.forEach(r => {
          for (let c = 0; c < size; c++) {
              const cell = boardState[r][c];
              if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) {
                  validSpots.push({row: r, col: c});
              }
          }
      });

      if (validSpots.length > 0) {
          const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
          boardState[spot.row][spot.col].piece = {
              id: uuidv4(),
              type: type,
              side: side,
              hasMoved: false,
              frozenTurns: 0,
              immortalTurns: 0
          };
          soundManager.playSfx('spawn');
      }
  };

  const executeMove = (from: Position, to: Position) => {
    // We work on a copy, but for Swarm logic we might need to manipulate other pieces.
    // Deep copy first.
    const newBoard = board.map(row => row.map(cell => ({
        ...cell, 
        piece: cell.piece ? { ...cell.piece } : null
    })));
    
    const piece = newBoard[from.row][from.col].piece!;
    let target = newBoard[to.row][to.col].piece;
    let nextEnPassantTarget: Position | null = null;
    let enemyKilled = false;
    let selfKilled = false;

    // --- Elephant Swarm Logic ---
    if (piece.type === PieceType.ELEPHANT) {
        const deltaRow = to.row - from.row;
        const deltaCol = to.col - from.col;
        const size = newBoard.length;
        
        // Find contiguous row of elephants
        const swarm: Position[] = [];
        const checked = new Set<string>();
        const queue = [from];
        checked.add(`${from.row},${from.col}`);

        while (queue.length > 0) {
            const curr = queue.pop()!;
            swarm.push(curr);
            
            // Check Left
            if (curr.col > 0) {
                const leftPos = { row: curr.row, col: curr.col - 1 };
                const leftKey = `${leftPos.row},${leftPos.col}`;
                if (!checked.has(leftKey)) {
                    const leftP = newBoard[leftPos.row][leftPos.col].piece;
                    if (leftP && leftP.type === PieceType.ELEPHANT && leftP.side === piece.side) {
                        checked.add(leftKey);
                        queue.push(leftPos);
                    }
                }
            }
            // Check Right
            if (curr.col < size - 1) {
                const rightPos = { row: curr.row, col: curr.col + 1 };
                const rightKey = `${rightPos.row},${rightPos.col}`;
                if (!checked.has(rightKey)) {
                    const rightP = newBoard[rightPos.row][rightPos.col].piece;
                    if (rightP && rightP.type === PieceType.ELEPHANT && rightP.side === piece.side) {
                        checked.add(rightKey);
                        queue.push(rightPos);
                    }
                }
            }
        }

        // Move all swarm members except the primary one
        if (swarm.length >= 3) {
            swarm.forEach(pos => {
                if (pos.row === from.row && pos.col === from.col) return; // Skip self, handled below
                
                const targetR = pos.row + deltaRow;
                const targetC = pos.col + deltaCol;
                
                if (targetR >= 0 && targetR < size && targetC >= 0 && targetC < size) {
                    const targetCell = newBoard[targetR][targetC];
                    let canSwarmMove = false;
                    if (targetCell.tileEffect === TileEffect.WALL) canSwarmMove = true;
                    else if (!targetCell.piece) canSwarmMove = true;
                    else if (targetCell.piece && targetCell.piece.side !== piece.side) canSwarmMove = true;

                    if (canSwarmMove) {
                        if (targetCell.tileEffect === TileEffect.WALL) {
                            targetCell.tileEffect = TileEffect.NONE;
                        }
                        if (targetCell.piece) {
                            // Check for Midas Touch
                            const midas = relics.find(r => r.type === RelicType.MIDAS_TOUCH);
                            const goldMultiplier = midas ? 2 : 1;
                            setGold(g => g + (10 * goldMultiplier));
                        }
                        
                        targetCell.piece = { ...newBoard[pos.row][pos.col].piece!, hasMoved: true };
                        newBoard[pos.row][pos.col].piece = null;
                    }
                }
            });
        }
    }

    // --- Elemental Dragon Trail Logic ---
    if (piece.type === PieceType.DRAGON && piece.variant) {
        let effect: TileEffect = TileEffect.NONE;
        if (piece.variant === 'LAVA') effect = TileEffect.LAVA;
        if (piece.variant === 'ABYSS') effect = TileEffect.HOLE;
        if (piece.variant === 'FROZEN') effect = TileEffect.FROZEN;

        if (effect !== TileEffect.NONE) {
            // Save current state to revert later
            const originalEffect = newBoard[from.row][from.col].tileEffect;
            // Only apply trail if the tile doesn't already have a permanent obstacle (like wall) or another effect
            newBoard[from.row][from.col].tileEffect = effect;
            tempTileEffects.current.push({ pos: from, originalEffect, variant: effect, turnsLeft: 1 });
        }
    }

    // --- Wall Breaking Logic (Ship / Elephant) ---
    if (newBoard[to.row][to.col].tileEffect === TileEffect.WALL) {
        if (piece.type === PieceType.SHIP || piece.type === PieceType.ELEPHANT) {
            newBoard[to.row][to.col].tileEffect = TileEffect.NONE;
            soundManager.playSfx('capture'); // Sound of breaking
        }
    }

    // Standard Move Logic
    // Pawn, Zebra, Champion use pawn capture logic for En Passant if applicable (though Zebra/Champion move logic for EP is rare, we allow it if they made a pawn-like move)
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

    // --- Mimic Logic & Capture ---
    if (target && target.side === Side.BLACK) {
        if (piece.mimic) {
            piece.type = target.type;
        }

        const goldReward = PIECE_GOLD_VALUES[target.type] || 10;
        
        // Midas Touch Logic
        const midas = relics.find(r => r.type === RelicType.MIDAS_TOUCH);
        const goldMultiplier = midas ? 2 : 1;

        setGold(prev => prev + (goldReward * goldMultiplier));
        enemyKilled = true;
    }

    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined };
    newBoard[from.row][from.col].piece = null;

    // Boss Passive: Frost Giant
    if (activeBoss === BossType.FROST_GIANT && piece.side === Side.WHITE) {
        if (newBoard[to.row][to.col].piece) {
            newBoard[to.row][to.col].piece!.frozenTurns = 2;
        }
    }

    // Terrain Effects
    const ignoresTerrain = piece.type === PieceType.DRAGON;
    const destEffect = newBoard[to.row][to.col].tileEffect;
    
    if (destEffect === TileEffect.LAVA && !ignoresTerrain) {
        if (!(newBoard[to.row][to.col].piece!.immortalTurns && newBoard[to.row][to.col].piece!.immortalTurns! > 0)) {
            // Check suicide mode - no effect since it killed itself
            const p = newBoard[to.row][to.col].piece!;
            if (p.side === Side.WHITE) {
                setDeadPieces(prev => [...prev, p.type]);
            }
            newBoard[to.row][to.col].piece = null; 
            selfKilled = true; 
            soundManager.playSfx('capture');
        }
    } else if (destEffect === TileEffect.FROZEN) { 
        if (newBoard[to.row][to.col].piece) {
            newBoard[to.row][to.col].piece!.frozenTurns = 2;
            soundManager.playSfx('frozen');
        }
    }

    // Promotion logic - Only for PAWN type
    if (newBoard[to.row][to.col].piece && piece.type === PieceType.PAWN && to.row === 0) {
        newBoard[to.row][to.col].piece!.type = PieceType.QUEEN;
        soundManager.playSfx('spawn');
    }

    if (enemyKilled) {
        soundManager.playSfx('capture');
        const necromancy = relics.find(r => r.type === RelicType.NECROMANCY);
        if (necromancy) {
            spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(necromancy.level, 5)]);
        }
    } else {
        soundManager.playSfx('move');
    }

    if (selfKilled) {
        const lastWill = relics.find(r => r.type === RelicType.LAST_WILL);
        if (lastWill) {
             spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
        }
    }

    // Decrement Player Effects & Ascended Death
    newBoard.forEach(row => row.forEach(cell => {
        if (cell.piece && cell.piece.side === Side.WHITE) {
            if ((cell.piece.frozenTurns || 0) > 0) cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
            if ((cell.piece.immortalTurns || 0) > 0) cell.piece.immortalTurns = (cell.piece.immortalTurns || 0) - 1;
            if ((cell.piece.ascendedTurns || 0) > 0) {
                cell.piece.ascendedTurns = (cell.piece.ascendedTurns || 0) - 1;
                if (cell.piece.ascendedTurns === 0) {
                    const pieceType = cell.piece.type;
                    setDeadPieces(prev => [...prev, pieceType]);
                    cell.piece = null;
                    soundManager.playSfx('loss'); // Died of old age
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
    setTurnCount(c => c + 1);
    
    setTimeout(() => executeEnemyTurn(currentBoard, currentEnPassantTarget), 800);
  };

  const applyBossAbilities = (boardState: Cell[][]) => {
      if (activeBoss === BossType.NONE) return { board: boardState, newTiles: [] as Position[] };

      const size = boardState.length;
      const emptyTiles: Position[] = [];
      for(let r=0; r<size; r++) {
          for(let c=0; c<size; c++) {
              if(!boardState[r][c].piece && boardState[r][c].tileEffect === TileEffect.NONE) {
                  emptyTiles.push({row: r, col: c});
              }
          }
      }

      if (activeBoss !== BossType.STONE_GOLEM) {
          bossTiles.forEach(pos => {
              if (boardState[pos.row] && boardState[pos.row][pos.col]) {
                  if (boardState[pos.row][pos.col].tileEffect !== TileEffect.NONE && 
                      boardState[pos.row][pos.col].tileEffect !== TileEffect.WALL) {
                         boardState[pos.row][pos.col].tileEffect = TileEffect.NONE;
                  }
              }
          });
      }

      const newTiles: Position[] = [];

      if (activeBoss === BossType.UNDEAD_LORD && turnCount % 5 === 0) {
          for(let r=0; r<size; r++){
              for(let c=0; c<size; c++){
                  const p = boardState[r][c].piece;
                  if(p && p.side === Side.BLACK && (p.immortalTurns || 0) > 100) {
                      p.immortalTurns = 0;
                  }
              }
          }
          const candidates: Position[] = [];
          for(let r=0; r<size; r++){
              for(let c=0; c<size; c++){
                  const p = boardState[r][c].piece;
                  if(p && p.side === Side.BLACK && p.type !== PieceType.KING) {
                      candidates.push({row: r, col: c});
                  }
              }
          }
          if(candidates.length > 0) {
              const chosen = candidates[Math.floor(Math.random() * candidates.length)];
              boardState[chosen.row][chosen.col].piece!.immortalTurns = 999;
              soundManager.playSfx('spawn');
          }
      }

      if (activeBoss === BossType.STONE_GOLEM) {
          if (turnCount % 5 === 0) {
              const wallCount = Math.floor(Math.random() * 3) + 2; 
              for(let i=0; i<wallCount; i++) {
                  if(emptyTiles.length === 0) break;
                  const idx = Math.floor(Math.random() * emptyTiles.length);
                  const pos = emptyTiles.splice(idx, 1)[0];
                  boardState[pos.row][pos.col].tileEffect = TileEffect.WALL;
              }
              soundManager.playSfx('spawn'); 
          }
          return { board: boardState, newTiles: [] }; 
      }

      let effectToApply = TileEffect.NONE;
      if (activeBoss === BossType.BLIZZARD_WITCH) effectToApply = TileEffect.FROZEN;
      if (activeBoss === BossType.VOID_BRINGER) effectToApply = TileEffect.HOLE;
      if (activeBoss === BossType.LAVA_TITAN) effectToApply = TileEffect.LAVA;

      if (effectToApply !== TileEffect.NONE) {
          const count = Math.floor(Math.random() * 3) + 2; 
          for(let i=0; i<count; i++) {
              if(emptyTiles.length === 0) break;
              const idx = Math.floor(Math.random() * emptyTiles.length);
              const pos = emptyTiles.splice(idx, 1)[0];
              boardState[pos.row][pos.col].tileEffect = effectToApply;
              newTiles.push(pos);
          }
      }

      return { board: boardState, newTiles };
  };

  const executeEnemyTurn = (currentBoard: Cell[][], playerEnPassantTarget: Position | null) => {
    const { board: boardAfterBoss, newTiles } = applyBossAbilities([...currentBoard]);
    setBossTiles(newTiles);

    const boardCopy = boardAfterBoss.map(row => row.map(cell => ({
        ...cell,
        piece: cell.piece ? { ...cell.piece } : null
    })));

    setBoard(boardCopy); 

    const size = boardCopy.length;
    const enemies: { pos: Position, piece: Piece, moves: Position[] }[] = [];

    for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
        const p = boardCopy[r][c].piece;
        if (p?.side === Side.BLACK) {
            if ((p.frozenTurns || 0) > 0) {
            } else {
            let moves = getValidMoves(boardCopy, p, { row: r, col: c }, playerEnPassantTarget, null); 
            if (isEnemyMoveLimited) {
                moves = moves.filter(m => Math.abs(m.row - r) <= 1 && Math.abs(m.col - c) <= 1);
            }
            if (moves.length > 0) enemies.push({ pos: { row: r, col: c }, piece: p, moves });
            }
        }
    }
    }

    // Pass turn back to player function
    const passTurn = () => {
        boardCopy.forEach(row => row.forEach(cell => {
            if (cell.piece && cell.piece.side === Side.BLACK) {
                if ((cell.piece.frozenTurns || 0) > 0) cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
                if ((cell.piece.immortalTurns || 0) > 0 && cell.piece.immortalTurns! < 100) cell.piece.immortalTurns = (cell.piece.immortalTurns || 0) - 1;
            }
        }));

        // Clean up temp effects from Player's Dragons using the Ref
        tempTileEffects.current.forEach(effect => {
            if (boardCopy[effect.pos.row][effect.pos.col].tileEffect === effect.variant) {
                boardCopy[effect.pos.row][effect.pos.col].tileEffect = effect.originalEffect;
            }
        });
        tempTileEffects.current = [];

        setTurn(Side.WHITE);
        setTurnCount(c => c + 1);
        setCardsPlayed(0);
        drawCard();
        setIsEnemyMoveLimited(false);
        setEnPassantTarget(null);
        calculateCheckState(boardCopy);
        setBoard(boardCopy); 
    };

    if (enemies.length === 0) {
        setLastEnemyMoveType(null);
        passTurn();
        return;
    }

      let bestMove: { from: Position, to: Position } | null = null;
      
      for (const e of enemies) {
        const kingKill = e.moves.find(m => boardCopy[m.row][m.col].piece?.type === PieceType.KING);
        if (kingKill) {
          bestMove = { from: e.pos, to: kingKill };
          break;
        }
      }

      if (!bestMove) {
        const captures: { from: Position, to: Position, value: number }[] = [];
        enemies.forEach(e => {
          e.moves.forEach(m => {
            const target = boardCopy[m.row][m.col].piece;
            const isEP = e.piece.type === PieceType.PAWN && playerEnPassantTarget && m.row === playerEnPassantTarget.row && m.col === playerEnPassantTarget.col;
            
            if (target?.side === Side.WHITE || isEP) {
               let val = 1;
               if (target) {
                   if (target.type === PieceType.QUEEN) val = 9;
                   else if (target.type === PieceType.ROOK) val = 5;
                   else if (target.type === PieceType.BISHOP || target.type === PieceType.KNIGHT) val = 3;
               } else if (isEP) {
                   val = 1; 
               }
               captures.push({ from: e.pos, to: m, value: val });
            }
          });
        });
        if (captures.length > 0) {
          captures.sort((a, b) => b.value - a.value);
          bestMove = captures[0];
        }
      }

      if (!bestMove) {
         const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
         const randomMove = randomEnemy.moves[Math.floor(Math.random() * randomEnemy.moves.length)];
         bestMove = { from: randomEnemy.pos, to: randomMove };
      }

      let nextEnPassantTarget: Position | null = null;

      if (bestMove) {
        const movingPiece = boardCopy[bestMove.from.row][bestMove.from.col].piece;
        
        // Safety check to prevent crash if piece is somehow missing
        if (!movingPiece) {
            passTurn();
            return;
        }

        const targetPiece = boardCopy[bestMove.to.row][bestMove.to.col].piece;
        
        setLastEnemyMoveType(movingPiece.type);

        let playerPieceKilled = false;
        
        if (movingPiece.type === PieceType.PAWN && playerEnPassantTarget && bestMove.to.row === playerEnPassantTarget.row && bestMove.to.col === playerEnPassantTarget.col) {
             const direction = 1;
             const victimRow = bestMove.to.row - direction;
             if (boardCopy[victimRow][bestMove.to.col].piece) {
                 playerPieceKilled = true;
                 setDeadPieces(prev => [...prev, boardCopy[victimRow][bestMove.to.col].piece!.type]);
             }
             boardCopy[victimRow][bestMove.to.col].piece = null;
        } else if (targetPiece && targetPiece.side === Side.WHITE) {
            playerPieceKilled = true;
            setDeadPieces(prev => [...prev, targetPiece.type]);
        }

        if (movingPiece.type === PieceType.PAWN && Math.abs(bestMove.from.row - bestMove.to.row) === 2) {
            nextEnPassantTarget = { row: (bestMove.from.row + bestMove.to.row) / 2, col: bestMove.from.col };
        }

        if (boardCopy[bestMove.to.row][bestMove.to.col].tileEffect === TileEffect.WALL && (movingPiece.type === PieceType.SHIP || movingPiece.type === PieceType.ELEPHANT)) {
            boardCopy[bestMove.to.row][bestMove.to.col].tileEffect = TileEffect.NONE;
        }

        boardCopy[bestMove.to.row][bestMove.to.col].piece = { ...movingPiece, hasMoved: true };
        boardCopy[bestMove.from.row][bestMove.from.col].piece = null;

        // --- Check for Suicide Mode (Trapped) ---
        if (targetPiece && targetPiece.side === Side.WHITE && targetPiece.trapped) {
            // The attacker also dies
            boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
            soundManager.playSfx('capture'); // Double death
        }

        const effect = boardCopy[bestMove.to.row][bestMove.to.col].tileEffect;
        if (effect === TileEffect.LAVA && movingPiece.type !== PieceType.DRAGON) {
            if (!(boardCopy[bestMove.to.row][bestMove.to.col].piece!.immortalTurns && boardCopy[bestMove.to.row][bestMove.to.col].piece!.immortalTurns! > 0)) {
                boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
                soundManager.playSfx('capture');
            }
        } else if (effect === TileEffect.FROZEN) { 
            if (boardCopy[bestMove.to.row][bestMove.to.col].piece) {
                boardCopy[bestMove.to.row][bestMove.to.col].piece!.frozenTurns = 2;
                soundManager.playSfx('frozen');
            }
        }

        if (boardCopy[bestMove.to.row][bestMove.to.col].piece && movingPiece.type === PieceType.PAWN && bestMove.to.row === size - 1) {
            boardCopy[bestMove.to.row][bestMove.to.col].piece!.type = PieceType.QUEEN;
            soundManager.playSfx('spawn');
        }

        if (playerPieceKilled) {
             soundManager.playSfx('capture');
             const lastWill = relics.find(r => r.type === RelicType.LAST_WILL);
             if (lastWill) {
                 spawnRelicPiece(boardCopy, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
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
    const isSelfPiece = clickedPiece?.side === Side.WHITE;
    const isEnemyPiece = clickedPiece?.side === Side.BLACK;

    if (selectedCardId && cardTargetMode) {
      handleCardTargeting(r, c, clickedPiece);
      return;
    }

    const isMoveValid = validMoves.some(m => m.row === r && m.col === c);
    if (selectedPiecePos && isMoveValid) {
      executeMove(selectedPiecePos, { row: r, col: c });
      return;
    }

    if (isSelfPiece) {
      setSelectedEnemyPos(null);
      setEnemyValidMoves([]);

      if (selectedPiecePos?.row === r && selectedPiecePos?.col === c) {
        setSelectedPiecePos(null);
        setValidMoves([]);
      } else {
        setSelectedPiecePos({ row: r, col: c });
        const moves = getValidMoves(board, clickedPiece!, { row: r, col: c }, enPassantTarget, lastEnemyMoveType);
        setValidMoves(moves);
      }
      return;
    }

    if (isEnemyPiece) {
       setSelectedPiecePos(null);
       setValidMoves([]);

       if (selectedEnemyPos?.row === r && selectedEnemyPos?.col === c) {
           setSelectedEnemyPos(null);
           setEnemyValidMoves([]);
       } else {
           setSelectedEnemyPos({ row: r, col: c });
           const moves = getValidMoves(board, clickedPiece!, { row: r, col: c }, null, null);
           setEnemyValidMoves(moves);
       }
       return;
    }

    setSelectedPiecePos(null);
    setValidMoves([]);
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);
  };

  const handleSquareDoubleClick = (r: number, c: number) => {
      const cell = board[r][c];
      const piece = cell.piece;
      const effect = cell.tileEffect;
      if (piece) {
          let content = `Type: ${t.pieces[piece.type]}`;
          if (piece.variant) {
              content += `\nElement: ${piece.variant}`;
          }
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
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      setCardTargetMode(null);
      return;
    }

    if (cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN) {
      alert(`You have reached the maximum of ${MAX_CARDS_PLAYED_PER_TURN} cards played this turn.`);
      return;
    }
    
    soundManager.playSfx('click');

    setSelectedCardId(card.id);
    setSelectedPiecePos(null);
    setValidMoves([]);
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);

    if (card.type.includes('SPAWN') || card.type === CardType.EFFECT_BACK_BASE) {
      if (card.type === CardType.SPAWN_REVIVE) {
          playInstantCard(card);
      } else {
          setCardTargetMode({ type: card.type, step: 'SELECT_SQUARE' });
      }
    } else if (card.type === CardType.EFFECT_SWITCH || card.type === CardType.EFFECT_IMMORTAL || 
               card.type === CardType.EFFECT_MIMIC || card.type === CardType.EFFECT_ASCEND || 
               card.type === CardType.EFFECT_IMMORTAL_LONG || card.type === CardType.EFFECT_AREA_FREEZE) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else if (card.type.includes('BORROW')) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else {
      playInstantCard(card);
    }
  };

  const playInstantCard = (card: Card) => {
    const newBoard = board.map(row => [...row]);
    const size = newBoard.length;
    let played = false;

    if (card.type === CardType.EFFECT_FREEZE) {
      const enemies: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.side === Side.BLACK) enemies.push({ row: r, col: c });
      }));
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (newBoard[target.row][target.col].piece) {
            newBoard[target.row][target.col].piece!.frozenTurns = 1;
            played = true;
            soundManager.playSfx('frozen');
        }
      }
    } else if (card.type === CardType.EFFECT_LIMIT) {
      setIsEnemyMoveLimited(true);
      played = true;
      soundManager.playSfx('frozen'); 
    } else if (card.type === CardType.EFFECT_TRAP) {
        const friends: Position[] = [];
        newBoard.forEach((row, r) => row.forEach((cell, c) => {
            if (cell.piece?.side === Side.WHITE && !cell.piece.trapped) friends.push({ row: r, col: c });
        }));
        if (friends.length > 0) {
            const target = friends[Math.floor(Math.random() * friends.length)];
            newBoard[target.row][target.col].piece!.trapped = true;
            played = true;
            soundManager.playSfx('spawn');
        } else {
            alert("No friendly pieces available for this effect.");
        }
    } else if (card.type === CardType.SPAWN_REVIVE) {
        if (deadPieces.length === 0) {
            alert("No dead pieces to revive!");
            return;
        }
        
        // Find empty spot in base rows
        const baseRows = [size - 1, size - 2];
        const validSpots: Position[] = [];
        baseRows.forEach(r => {
            for (let c = 0; c < size; c++) {
                const cell = newBoard[r][c];
                if (!cell.piece && cell.tileEffect !== TileEffect.WALL && cell.tileEffect !== TileEffect.HOLE) {
                    validSpots.push({row: r, col: c});
                }
            }
        });

        if (validSpots.length > 0) {
            // Pick random dead piece
            const pieceType = deadPieces[Math.floor(Math.random() * deadPieces.length)];
            // Remove from dead pool (first instance)
            const index = deadPieces.indexOf(pieceType);
            const newDeadPieces = [...deadPieces];
            if (index > -1) newDeadPieces.splice(index, 1);
            setDeadPieces(newDeadPieces);

            const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
            newBoard[spot.row][spot.col].piece = {
                id: uuidv4(),
                type: pieceType,
                side: Side.WHITE,
                hasMoved: false,
                frozenTurns: 0,
                immortalTurns: 0
            };
            played = true;
            soundManager.playSfx('spawn');
        } else {
            alert("No space in base rows to revive unit.");
        }
    }

    if (played) {
      setBoard(newBoard);
      consumeCard(card.id);
    }
  };

  const handleCardTargeting = (r: number, c: number, piece: Piece | null) => {
    if (!cardTargetMode || !selectedCardId) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const { type, step } = cardTargetMode;
    const size = board.length;

    if (type.includes('SPAWN')) {
        if (r >= size - 2 && !piece) {
            const cell = newBoard[r][c];
            if (cell.tileEffect === TileEffect.WALL || cell.tileEffect === TileEffect.HOLE) {
                alert("Cannot spawn on an obstacle.");
                return;
            }
            
            let spawnType = PieceType.PAWN;
            let variant: 'LAVA' | 'ABYSS' | 'FROZEN' | undefined = undefined;

            if (type === CardType.SPAWN_QUEEN) spawnType = PieceType.QUEEN;
            else if (type === CardType.SPAWN_ROOK) spawnType = PieceType.ROOK;
            else if (type === CardType.SPAWN_BISHOP) spawnType = PieceType.BISHOP;
            else if (type === CardType.SPAWN_KNIGHT) spawnType = PieceType.KNIGHT;
            else if (type === CardType.SPAWN_PAWN) spawnType = PieceType.PAWN;
            else if (type === CardType.SPAWN_FOOL) spawnType = PieceType.FOOL;
            else if (type === CardType.SPAWN_SHIP) spawnType = PieceType.SHIP;
            else if (type === CardType.SPAWN_ELEPHANT) spawnType = PieceType.ELEPHANT;
            
            else if (type === CardType.SPAWN_CHANCELLOR) spawnType = PieceType.CHANCELLOR;
            else if (type === CardType.SPAWN_ARCHBISHOP) spawnType = PieceType.ARCHBISHOP;
            else if (type === CardType.SPAWN_MANN) spawnType = PieceType.MANN;
            else if (type === CardType.SPAWN_AMAZON) spawnType = PieceType.AMAZON;
            else if (type === CardType.SPAWN_CENTAUR) spawnType = PieceType.CENTAUR;
            else if (type === CardType.SPAWN_ZEBRA) spawnType = PieceType.ZEBRA;
            else if (type === CardType.SPAWN_CHAMPION) spawnType = PieceType.CHAMPION;

            else if (type.includes('DRAGON')) {
                spawnType = PieceType.DRAGON;
                if (type === CardType.SPAWN_DRAGON_LAVA) variant = 'LAVA';
                if (type === CardType.SPAWN_DRAGON_ABYSS) variant = 'ABYSS';
                if (type === CardType.SPAWN_DRAGON_FROZEN) variant = 'FROZEN';
            }

            newBoard[r][c].piece = { 
                id: uuidv4(), 
                type: spawnType, 
                side: Side.WHITE, 
                hasMoved: false, 
                frozenTurns: 0, 
                immortalTurns: 0,
                variant
            };
            
            if (cell.tileEffect === TileEffect.FROZEN) { 
                newBoard[r][c].piece!.frozenTurns = 2;
            }
            
            if (cell.tileEffect === TileEffect.LAVA && spawnType !== PieceType.DRAGON) {
                newBoard[r][c].piece = null;
            }

            setBoard(newBoard);
            soundManager.playSfx('spawn');
            consumeCard(selectedCardId);
        } else {
            alert("Can only spawn on empty squares in your base rows.");
        }
        return;
    }

    if (type === CardType.EFFECT_BACK_BASE) {
        if (step === 'SELECT_SQUARE' && piece?.side === Side.WHITE && piece.type !== PieceType.KING) {
             let targetPos: Position | null = null;
             const baseRows = [size - 1, size - 2];
             const center = Math.floor(size / 2);
             const cols = Array.from({length: size}, (_, i) => i).sort((a,b) => Math.abs(a-center) - Math.abs(b-center));
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
             } else {
                 alert("No valid empty space in base rows!");
             }
        }
        return;
    }

    if (type.includes('BORROW') && piece?.side === Side.WHITE) {
        const borrowType = type.replace('EFFECT_BORROW_', '') as PieceType;
        newBoard[r][c].piece = { ...piece, tempMoveOverride: borrowType };
        setBoard(newBoard);
        soundManager.playSfx('spawn');
        consumeCard(selectedCardId);
        return;
    }

    if (type === CardType.EFFECT_IMMORTAL) {
        if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
            newBoard[r][c].piece = { ...piece, immortalTurns: 2 }; 
            setBoard(newBoard);
            soundManager.playSfx('spawn'); 
            consumeCard(selectedCardId);
        }
        return;
    }

    // New Targeted Cards Logic
    if (type === CardType.EFFECT_IMMORTAL_LONG) {
        if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
            newBoard[r][c].piece = { ...piece, immortalTurns: IMMORTAL_LONG_DURATION }; 
            setBoard(newBoard);
            soundManager.playSfx('spawn'); 
            consumeCard(selectedCardId);
        }
        return;
    }

    if (type === CardType.EFFECT_MIMIC) {
        if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
            newBoard[r][c].piece = { ...piece, mimic: true }; 
            setBoard(newBoard);
            soundManager.playSfx('spawn'); 
            consumeCard(selectedCardId);
        }
        return;
    }

    if (type === CardType.EFFECT_ASCEND) {
        if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE && piece.type === PieceType.PAWN) {
            const promotions = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];
            const promo = promotions[Math.floor(Math.random() * promotions.length)];
            newBoard[r][c].piece = { ...piece, type: promo, ascendedTurns: ASCEND_DURATION }; 
            setBoard(newBoard);
            soundManager.playSfx('spawn'); 
            consumeCard(selectedCardId);
        } else if (piece?.type !== PieceType.PAWN) {
            alert("Ascend can only be used on a Pawn.");
        }
        return;
    }

    if (type === CardType.EFFECT_AREA_FREEZE) {
        if (step === 'SELECT_PIECE_1' && piece?.side === Side.WHITE) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const tr = r + dr;
                    const tc = c + dc;
                    if (isValidPos({ row: tr, col: tc }, size)) {
                        const targetPiece = newBoard[tr][tc].piece;
                        if (targetPiece && targetPiece.side === Side.BLACK) {
                            targetPiece.frozenTurns = AREA_FREEZE_DURATION;
                        }
                    }
                }
            }
            setBoard(newBoard);
            soundManager.playSfx('frozen'); 
            consumeCard(selectedCardId);
        }
        return;
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
                setBoard(newBoard);
                soundManager.playSfx('move');
                consumeCard(selectedCardId);
             }
        }
        return;
    }
  };

  const consumeCard = (id: string) => {
    const nextHand = hand.filter(c => c.id !== id);
    setHand(nextHand);
    setSelectedCardId(null);
    setCardTargetMode(null);
    setCardsPlayed(prev => prev + 1);

    if (checkLossCondition(board, deck, nextHand)) {
        soundManager.playSfx('loss');
        setIsGameEnded(true);
        setTimeout(onLoss, WAIT_END_GAME_TIMEOUT);
    }
  };

  return {
    gameState: {
      board, turn, turnCount, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, 
      deck, hand, cardsPlayed, selectedCardId, cardTargetMode, showDeckModal, selectedRelic, infoModalContent,
      selectedEnemyPos, enemyValidMoves, checkState, activeBoss, lastEnemyMoveType
    },
    actions: {
      initGame, handleSquareClick, handleSquareDoubleClick, handleCardClick, 
      setShowDeckModal, setSelectedRelic, setInfoModalContent
    }
  };
};