
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameSettings, GamePhase, Cell, Piece, PieceType, Side, Card, CardType, Position, Relic, RelicType, MapNode 
} from './types';
import { DECK_TEMPLATE, PIECE_GOLD_VALUES, STARTER_DECKS, RELIC_INFO, RELICS_IN_SHOP, RELIC_LEVEL_REWARDS, MAX_CARDS_IN_HAND, CARDS_IN_SHOP, REWARD_CARDS, MAX_CARDS_PLAYED_PER_TURN, CAMPAIGN_MAP } from './constants';
import { generateBoard, getValidMoves } from './utils/gameLogic';

// Component Imports
import { MainMenu } from './components/screens/MainMenu';
import { DeckSelection } from './components/screens/DeckSelection';
import { Reward } from './components/screens/Reward';
import { Shop } from './components/screens/Shop';
import { GameOver } from './components/screens/GameOver';
import { GameHeader } from './components/game/GameHeader';
import { GameBoard } from './components/game/GameBoard';
import { PlayerHand } from './components/game/PlayerHand';
import { DeckModal } from './components/modals/DeckModal';
import { RelicDetailModal } from './components/modals/RelicDetailModal';
import { MapModal } from './components/modals/MapModal';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETTINGS');
  const [settings, setSettings] = useState<GameSettings>({ boardSize: 8, enemyCount: 6, playerCount: 4 });
  
  // Campaign State
  const [isCampaign, setIsCampaign] = useState(false);
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [masterDeck, setMasterDeck] = useState<Card[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [shopCards, setShopCards] = useState<Card[]>([]);
  const [shopRelics, setShopRelics] = useState<Relic[]>([]); 
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  const [gold, setGold] = useState(0);
  
  // Map State
  const [currentMapNodeId, setCurrentMapNodeId] = useState<string | null>(null);
  const [completedMapNodeIds, setCompletedMapNodeIds] = useState<string[]>([]);
  const [showMapModal, setShowMapModal] = useState(false);

  // Game State
  const [board, setBoard] = useState<Cell[][]>([]);
  const [turn, setTurn] = useState<Side>(Side.WHITE);
  const [turnCount, setTurnCount] = useState(1);
  const [selectedPiecePos, setSelectedPiecePos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMoveFrom, setLastMoveFrom] = useState<Position | null>(null);
  const [lastMoveTo, setLastMoveTo] = useState<Position | null>(null);
  const [isEnemyMoveLimited, setIsEnemyMoveLimited] = useState(false);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);

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

  // --- Logic Helpers ---

  const startCampaign = () => {
    setIsCampaign(true);
    setGold(0);
    setCampaignLevel(1);
    setRelics([]);
    setCurrentMapNodeId(null);
    setCompletedMapNodeIds([]);
    setPhase('DECK_SELECTION');
  };

  const selectStarterDeck = (index: number) => {
    const starter = STARTER_DECKS[index];
    const newMasterDeck = starter.cards.map(type => {
      const template = DECK_TEMPLATE.find(t => t.type === type)!;
      return { ...template, id: uuidv4() };
    });
    setMasterDeck(newMasterDeck);
    // Go to Map to select first level
    setPhase('MAP');
  };

  const initGame = (campaignMode: boolean, campaignDeck?: Card[], level: number = 1) => {
    let size = settings.boardSize;
    let eCount = settings.enemyCount;
    let pCount = settings.playerCount;

    if (campaignMode) {
      // Campaign difficulty scaling
      size = Math.min(6 + Math.floor((level - 1) / 2), 12);
      eCount = Math.min(2 + level, 12); // Increases by 1 each level
      pCount = 0; 
    }

    const newBoard = generateBoard(size);
    
    // Place Player King
    const kingPos = { row: size - 1, col: Math.floor(size / 2) };
    newBoard[kingPos.row][kingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.WHITE,
      hasMoved: false
    };

    // Place Enemy King
    const enemyKingPos = { row: 0, col: Math.floor(size / 2) };
    newBoard[enemyKingPos.row][enemyKingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.BLACK,
      hasMoved: false
    };

    // Place Random Enemies
    let enemiesPlaced = 0;
    // Enemy composition scales with level
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
      const r = Math.floor(Math.random() * 2); // Top 2 rows
      const c = Math.floor(Math.random() * size);
      
      if (!newBoard[r][c].piece) {
        newBoard[r][c].piece = {
          id: uuidv4(),
          type: enemyPool[Math.floor(Math.random() * enemyPool.length)],
          side: Side.BLACK,
          hasMoved: false
        };
        enemiesPlaced++;
      }
    }

    // Place Random Player Pieces (Only for Custom Mode)
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
            hasMoved: false
            };
            playersPlaced++;
        }
        }
    }

    // Init Deck
    let gameDeck: Card[] = [];
    if (campaignMode && campaignDeck) {
      // Shuffle master deck
      gameDeck = [...campaignDeck].sort(() => Math.random() - 0.5);
    } else {
      // Random deck for custom mode
      gameDeck = Array.from({ length: 20 }).map(() => {
          const template = DECK_TEMPLATE[Math.floor(Math.random() * DECK_TEMPLATE.length)];
          return { ...template, id: uuidv4() };
      });
    }
    
    // Draw initial hand (3 cards)
    const initialHand = gameDeck.splice(0, 3);

    setBoard(newBoard);
    setDeck(gameDeck);
    setHand(initialHand);
    setTurn(Side.WHITE);
    setPhase('PLAYING');
    setTurnCount(1);
    setCardsPlayed(0);
    if (!campaignMode) {
        setGold(0);
        setRelics([]);
    }
    setSelectedPiecePos(null);
    setValidMoves([]);
    setLastMoveFrom(null);
    setLastMoveTo(null);
    setIsEnemyMoveLimited(false);
    setEnPassantTarget(null);
  };

  const drawCard = useCallback(() => {
    // Only draw if hand size < max cards in hand
    if (deck.length > 0 && hand.length < MAX_CARDS_IN_HAND) {
      const newDeck = [...deck];
      const card = newDeck.pop();
      setDeck(newDeck);
      if (card) setHand(prev => [...prev, card]);
    }
  }, [deck, hand]);

  // Check loss condition immediately if state changes (useEffect might lag, so we check in actions)
  const checkLossCondition = (currentBoard: Cell[][], currentDeck: Card[], currentHand: Card[]) => {
      let whitePieces = 0;
      let whiteKing = false;
      currentBoard.forEach(row => row.forEach(cell => {
          if (cell.piece?.side === Side.WHITE) {
              if (cell.piece.type === PieceType.KING) whiteKing = true;
              else whitePieces++;
          }
      }));

      // Lose if King dead OR (No cards in deck/hand AND No pieces except King)
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

      // Win if King dead OR All other enemies dead
      if (!blackKing) return true;
      if (blackPieces === 0) return true;
      return false;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== Side.WHITE) return;

    const clickedPiece = board[r][c].piece;
    const isSelfPiece = clickedPiece?.side === Side.WHITE;

    // --- Card Targeting Mode ---
    if (selectedCardId && cardTargetMode) {
      handleCardTargeting(r, c, clickedPiece);
      return;
    }

    // --- Normal Movement Mode ---
    if (isSelfPiece) {
      if (selectedPiecePos?.row === r && selectedPiecePos?.col === c) {
        setSelectedPiecePos(null);
        setValidMoves([]);
      } else {
        setSelectedPiecePos({ row: r, col: c });
        const moves = getValidMoves(board, clickedPiece!, { row: r, col: c }, enPassantTarget);
        setValidMoves(moves);
      }
      return;
    }

    const isMoveValid = validMoves.some(m => m.row === r && m.col === c);
    if (selectedPiecePos && isMoveValid) {
      executeMove(selectedPiecePos, { row: r, col: c });
    }
  };

  const spawnRelicPiece = (boardState: Cell[][], side: Side, type: PieceType) => {
      // Find empty spot in base rows
      const size = boardState.length;
      const baseRows = side === Side.WHITE ? [size - 1, size - 2] : [0, 1];
      const validSpots: Position[] = [];
      baseRows.forEach(r => {
          for (let c = 0; c < size; c++) {
              if (!boardState[r][c].piece) validSpots.push({row: r, col: c});
          }
      });

      if (validSpots.length > 0) {
          const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
          boardState[spot.row][spot.col].piece = {
              id: uuidv4(),
              type: type,
              side: side,
              hasMoved: false
          };
      }
  };

  const executeMove = (from: Position, to: Position) => {
    const newBoard = [...board.map(row => row.map(cell => ({...cell})))];
    const piece = newBoard[from.row][from.col].piece!;
    let target = newBoard[to.row][to.col].piece;
    let nextEnPassantTarget: Position | null = null;
    let enemyKilled = false;

    // Handle En Passant Capture
    if (piece.type === PieceType.PAWN && !target && from.col !== to.col && enPassantTarget) {
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

    // Handle Double Push
    if (piece.type === PieceType.PAWN && Math.abs(from.row - to.row) === 2) {
        nextEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    }

    // Gold Logic & Necromancy
    if (target && target.side === Side.BLACK) {
        const goldReward = PIECE_GOLD_VALUES[target.type] || 10;
        setGold(prev => prev + goldReward);
        enemyKilled = true;
    }

    // Move Piece
    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined };
    newBoard[from.row][from.col].piece = null;

    // Pawn Promotion
    if (piece.type === PieceType.PAWN && to.row === 0) {
        newBoard[to.row][to.col].piece!.type = PieceType.QUEEN;
    }

    // Trigger NECROMANCY Relic
    if (enemyKilled) {
        const necromancy = relics.find(r => r.type === RelicType.NECROMANCY);
        if (necromancy) {
            spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(necromancy.level, 5)]);
        }
    }

    setBoard(newBoard);
    setLastMoveFrom(from);
    setLastMoveTo(to);
    setSelectedPiecePos(null);
    setValidMoves([]);
    setEnPassantTarget(nextEnPassantTarget);

    // Check Win
    if (checkWinCondition(newBoard)) {
        handleWin();
        return;
    }

    // Check Loss
    if (checkLossCondition(newBoard, deck, hand)) {
        setPhase('GAME_OVER_LOSS');
        return;
    }

    endPlayerTurn(newBoard, nextEnPassantTarget);
  };

  const handleWin = () => {
    if (isCampaign) {
        if (currentMapNodeId) {
           setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
        }
        
        // Check if final boss
        if (currentMapNodeId === '7') { // Hardcoded final level ID
           setPhase('GAME_OVER_WIN');
           return;
        }

        const rewards = Array.from({length: REWARD_CARDS}).map(() => {
            const t = DECK_TEMPLATE[Math.floor(Math.random() * DECK_TEMPLATE.length)];
            return { ...t, id: uuidv4() };
        });
        setRewardCards(rewards);
        setPhase('REWARD');
    } else {
        setPhase('GAME_OVER_WIN');
    }
  };

  const selectReward = (card: Card) => {
      setMasterDeck(prev => [...prev, card]);
      
      // Generate Shop
      const shop = Array.from({length: CARDS_IN_SHOP}).map(() => {
          const t = DECK_TEMPLATE[Math.floor(Math.random() * DECK_TEMPLATE.length)];
          return { ...t, id: uuidv4() };
      });
      setShopCards(shop);

      // Generate Shop Relics (2 slots)
      const shopR: Relic[] = [];
      const relicTypes = [RelicType.LAST_WILL, RelicType.NECROMANCY];
      // Pick 2 random types (duplicates allowed in generation pool, but distinct slots)
      for(let i = 0; i < RELICS_IN_SHOP; i++) {
          const type = relicTypes[Math.floor(Math.random() * relicTypes.length)];
          shopR.push({ type, level: 1 }); // Shop always sells base "upgrade"
      }
      setShopRelics(shopR);

      setPhase('SHOP');
  };

  const buyCard = (card: Card) => {
      if (gold >= card.cost) {
          setGold(prev => prev - card.cost);
          setMasterDeck(prev => [...prev, card]);
          setShopCards(prev => prev.filter(c => c.id !== card.id));
      }
  };

  const buyRelic = (relic: Relic, index: number) => {
      const info = RELIC_INFO[relic.type];
      const existing = relics.find(r => r.type === relic.type);
      // Cost increases with current level? Or flat? "High price". Let's do basePrice * (currentLevel + 1)
      const currentLevel = existing ? existing.level : 0;
      const cost = info.basePrice * (currentLevel + 1);

      if (gold >= cost) {
          setGold(prev => prev - cost);
          
          if (existing) {
              setRelics(prev => prev.map(r => r.type === relic.type ? { ...r, level: r.level + 1 } : r));
          } else {
              setRelics(prev => [...prev, { type: relic.type, level: 1 }]);
          }

          // Remove from shop
          const newShopRelics = [...shopRelics];
          newShopRelics.splice(index, 1);
          setShopRelics(newShopRelics);
      }
  };

  const sellRelic = (relic: Relic) => {
      const info = RELIC_INFO[relic.type];
      // Sell price: 50% of total value roughly? or just base * level * 0.5
      const sellValue = Math.floor(info.basePrice * relic.level * 0.5);
      setGold(prev => prev + sellValue);
      setRelics(prev => prev.filter(r => r.type !== relic.type));
      setSelectedRelic(null);
  };

  const handleMapNodeSelect = (node: MapNode) => {
      setCurrentMapNodeId(node.id);
      setCampaignLevel(node.level);
      initGame(true, masterDeck, node.level);
  };

  const endPlayerTurn = (currentBoard: Cell[][], currentEnPassantTarget: Position | null) => {
    setTurn(Side.BLACK);
    setTurnCount(c => c + 1);
    setTimeout(() => executeEnemyTurn(currentBoard, currentEnPassantTarget), 800);
  };

  const executeEnemyTurn = (currentBoard: Cell[][], playerEnPassantTarget: Position | null) => {
    setBoard(prevBoard => {
      const boardCopy = prevBoard.map(row => row.map(cell => ({
        ...cell,
        piece: cell.piece ? { ...cell.piece, isFrozen: false } : null
      })));

      const size = boardCopy.length;
      const enemies: { pos: Position, piece: Piece, moves: Position[] }[] = [];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardCopy[r][c].piece;
          if (p?.side === Side.BLACK && !p.isFrozen) {
            let moves = getValidMoves(boardCopy, p, { row: r, col: c }, playerEnPassantTarget);
            if (isEnemyMoveLimited) {
                moves = moves.filter(m => Math.abs(m.row - r) <= 1 && Math.abs(m.col - c) <= 1);
            }
            if (moves.length > 0) enemies.push({ pos: { row: r, col: c }, piece: p, moves });
          }
        }
      }

      if (enemies.length === 0) {
        setTurn(Side.WHITE);
        setTurnCount(1);
        setCardsPlayed(0);
        drawCard();
        setIsEnemyMoveLimited(false);
        setEnPassantTarget(null);
        return boardCopy;
      }

      // AI Decision Making
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
        const movingPiece = boardCopy[bestMove.from.row][bestMove.from.col].piece!;
        const targetPiece = boardCopy[bestMove.to.row][bestMove.to.col].piece;
        let playerPieceKilled = false;
        
        // Handle En Passant (Enemy)
        if (movingPiece.type === PieceType.PAWN && playerEnPassantTarget && bestMove.to.row === playerEnPassantTarget.row && bestMove.to.col === playerEnPassantTarget.col) {
             const direction = 1;
             const victimRow = bestMove.to.row - direction;
             if (boardCopy[victimRow][bestMove.to.col].piece) {
                 playerPieceKilled = true;
             }
             boardCopy[victimRow][bestMove.to.col].piece = null;
        } else if (targetPiece && targetPiece.side === Side.WHITE) {
            playerPieceKilled = true;
        }

        // Handle Double Push
        if (movingPiece.type === PieceType.PAWN && Math.abs(bestMove.from.row - bestMove.to.row) === 2) {
            nextEnPassantTarget = { row: (bestMove.from.row + bestMove.to.row) / 2, col: bestMove.from.col };
        }

        boardCopy[bestMove.to.row][bestMove.to.col].piece = { ...movingPiece, hasMoved: true };
        boardCopy[bestMove.from.row][bestMove.from.col].piece = null;

        // Promotion
        if (movingPiece.type === PieceType.PAWN && bestMove.to.row === size - 1) {
            boardCopy[bestMove.to.row][bestMove.to.col].piece!.type = PieceType.QUEEN;
        }

        // Trigger LAST WILL Relic
        if (playerPieceKilled) {
             const lastWill = relics.find(r => r.type === RelicType.LAST_WILL);
             if (lastWill) {
                 spawnRelicPiece(boardCopy, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
             }
        }

        setLastMoveFrom(bestMove.from);
        setLastMoveTo(bestMove.to);
      }

      setEnPassantTarget(nextEnPassantTarget);
      
      if (checkLossCondition(boardCopy, deck, hand)) {
          setPhase('GAME_OVER_LOSS');
      }

      if (checkWinCondition(boardCopy)) {
          handleWin();
      }

      setTurn(Side.WHITE);
      setTurnCount(c => c + 1);
      setCardsPlayed(0); 
      drawCard();
      setIsEnemyMoveLimited(false);
      return boardCopy;
    });
  };

  const handleCardClick = (card: Card) => {
    if (turn !== Side.WHITE) return;
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      setCardTargetMode(null);
      return;
    }

    // Limit check
    if (cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN) {
      alert(`You have reached the maximum of ${MAX_CARDS_PLAYED_PER_TURN} cards played this turn.`);
      return;
    }

    setSelectedCardId(card.id);
    setSelectedPiecePos(null);
    setValidMoves([]);
    if (card.type.includes('SPAWN') || card.type === CardType.EFFECT_BACK_BASE) {
      setCardTargetMode({ type: card.type, step: 'SELECT_SQUARE' });
    } else if (card.type === CardType.EFFECT_SWITCH) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else if (card.type.includes('BORROW')) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else {
      playInstantCard(card);
    }
  };

  const playInstantCard = (card: Card) => {
    const newBoard = board.map(row => [...row]);
    let played = false;
    if (card.type === CardType.EFFECT_FREEZE) {
      const enemies: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.side === Side.BLACK) enemies.push({ row: r, col: c });
      }));
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (newBoard[target.row][target.col].piece) {
            newBoard[target.row][target.col].piece!.isFrozen = true;
            played = true;
        }
      }
    } else if (card.type === CardType.EFFECT_LIMIT) {
      setIsEnemyMoveLimited(true);
      played = true;
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
            const spawnType = type.replace('SPAWN_', '') as PieceType;
            newBoard[r][c].piece = { id: uuidv4(), type: spawnType, side: Side.WHITE, hasMoved: false };
            setBoard(newBoard);
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
                    if (!newBoard[row][col].piece) {
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
                 consumeCard(selectedCardId);
             } else {
                 alert("No empty space in base rows!");
             }
        }
        return;
    }

    if (type.includes('BORROW') && piece?.side === Side.WHITE) {
        const borrowType = type.replace('EFFECT_BORROW_', '') as PieceType;
        newBoard[r][c].piece = { ...piece, tempMoveOverride: borrowType };
        setBoard(newBoard);
        consumeCard(selectedCardId);
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
        setPhase('GAME_OVER_LOSS');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* Header */}
      <GameHeader 
        phase={phase}
        isCampaign={isCampaign}
        campaignLevel={campaignLevel}
        relics={relics}
        gold={gold}
        turnCount={turnCount}
        cardsPlayed={cardsPlayed}
        onResign={() => setPhase('SETTINGS')}
        onRelicClick={setSelectedRelic}
        onOpenMap={() => setShowMapModal(true)}
      />

      {/* Main Content */}
      <main className="flex-grow flex relative overflow-hidden">
        
        {phase === 'SETTINGS' && (
           <MainMenu 
             settings={settings}
             setSettings={setSettings}
             startCampaign={startCampaign}
             initGame={initGame}
           />
        )}

        {phase === 'DECK_SELECTION' && (
          <DeckSelection onSelectDeck={selectStarterDeck} />
        )}
        
        {phase === 'MAP' && (
           <MapModal 
             mapNodes={CAMPAIGN_MAP}
             currentNodeId={currentMapNodeId}
             completedNodes={completedMapNodeIds}
             onNodeSelect={handleMapNodeSelect}
             onClose={() => {}} // Can't close in select mode
             isReadOnly={false}
           />
        )}

        {phase === 'REWARD' && (
           <Reward rewardCards={rewardCards} onSelectReward={selectReward} />
        )}

        {phase === 'SHOP' && (
           <Shop 
             gold={gold}
             shopCards={shopCards}
             shopRelics={shopRelics}
             relics={relics}
             onBuyCard={buyCard}
             onBuyRelic={buyRelic}
             onNext={() => setPhase('MAP')}
           />
        )}

        <GameOver 
          phase={phase}
          isCampaign={isCampaign}
          onMainMenu={() => setPhase('SETTINGS')}
          onRestartCampaign={startCampaign}
        />

        {phase === 'PLAYING' && (
          <div className="flex flex-col w-full h-full">
            
            <GameBoard 
              board={board}
              selectedPiecePos={selectedPiecePos}
              validMoves={validMoves}
              lastMoveFrom={lastMoveFrom}
              lastMoveTo={lastMoveTo}
              onSquareClick={handleSquareClick}
              selectedCardId={selectedCardId}
              cardTargetMode={cardTargetMode}
            />

            <PlayerHand 
              hand={hand}
              deckCount={deck.length}
              selectedCardId={selectedCardId}
              turn={turn}
              cardsPlayed={cardsPlayed}
              onCardClick={handleCardClick}
              onDeckClick={() => setShowDeckModal(true)}
            />

            {showDeckModal && (
               <DeckModal deck={deck} onClose={() => setShowDeckModal(false)} />
            )}

            {selectedRelic && (
                <RelicDetailModal 
                  relic={selectedRelic} 
                  onClose={() => setSelectedRelic(null)}
                  onSell={sellRelic}
                />
            )}
            
            {showMapModal && (
              <MapModal 
                mapNodes={CAMPAIGN_MAP}
                currentNodeId={currentMapNodeId}
                completedNodes={completedMapNodeIds}
                onNodeSelect={() => {}} // No interaction in view mode
                onClose={() => setShowMapModal(false)}
                isReadOnly={true}
              />
            )}

          </div>
        )}
      </main>
    </div>
  );
}
