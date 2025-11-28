
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameSettings, GamePhase, Cell, Piece, PieceType, Side, Card, CardType, Position, Relic, RelicType 
} from './types';
import { PIECE_ICONS, DECK_TEMPLATE, PIECE_GOLD_VALUES, STARTER_DECKS, RELIC_INFO, RELIC_LEVEL_REWARDS } from './constants';
import { generateBoard, getValidMoves, isValidPos } from './utils/gameLogic';

// --- Components ---

const Button = ({ children, onClick, className = "", disabled = false }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

interface CardComponentProps {
  card: Card;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  showCost?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, selected, onClick, disabled, showCost = false }) => (
  <div 
    onClick={() => !disabled && onClick()}
    className={`
      flex-shrink-0 w-32 h-44 border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 relative
      ${selected ? 'border-yellow-400 bg-yellow-50 -translate-y-4 shadow-xl ring-2 ring-yellow-400 text-black' : 'border-gray-600 bg-slate-800 text-white hover:-translate-y-2 hover:shadow-lg'}
      ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
    `}
  >
    <div className="text-[10px] font-bold uppercase tracking-wider text-center border-b border-gray-500 pb-1 mb-1 truncate">
      {card.title}
    </div>
    <div className="flex-grow flex items-center justify-center text-center">
      {/* Icon placeholder based on type */}
      <span className="text-3xl">
        {card.type.includes('SPAWN') && '⚔️'}
        {card.type.includes('SWITCH') && '🔄'}
        {card.type.includes('FREEZE') && '❄️'}
        {card.type.includes('LIMIT') && '🐌'}
        {card.type.includes('BORROW') && '🎭'}
        {card.type.includes('BACK') && '↩️'}
      </span>
    </div>
    <div className="text-[9px] text-center leading-tight opacity-90 mb-1">
      {card.description}
    </div>
    {showCost && (
      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-sm text-xs z-10">
        ${card.cost}
      </div>
    )}
  </div>
);

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETTINGS');
  const [settings, setSettings] = useState<GameSettings>({ boardSize: 8, enemyCount: 6, playerCount: 4 });
  
  // Campaign State
  const [isCampaign, setIsCampaign] = useState(false);
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [masterDeck, setMasterDeck] = useState<Card[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [shopCards, setShopCards] = useState<Card[]>([]);
  const [shopRelics, setShopRelics] = useState<Relic[]>([]); // New shop relics
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  const [gold, setGold] = useState(0); // Persistent Gold

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
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null); // For dialog

  // --- Logic Helpers ---

  const startCampaign = () => {
    setIsCampaign(true);
    setGold(0);
    setCampaignLevel(1);
    setRelics([]);
    setPhase('DECK_SELECTION');
  };

  const selectStarterDeck = (index: number) => {
    const starter = STARTER_DECKS[index];
    const newMasterDeck = starter.cards.map(type => {
      const template = DECK_TEMPLATE.find(t => t.type === type)!;
      return { ...template, id: uuidv4() };
    });
    setMasterDeck(newMasterDeck);
    initGame(true, newMasterDeck, 1);
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
    // Only draw if hand size < 7
    if (deck.length > 0 && hand.length < 7) {
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
        // Generate Rewards
        const rewards = Array.from({length: 3}).map(() => {
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
      const shop = Array.from({length: 5}).map(() => {
          const t = DECK_TEMPLATE[Math.floor(Math.random() * DECK_TEMPLATE.length)];
          return { ...t, id: uuidv4() };
      });
      setShopCards(shop);

      // Generate Shop Relics (2 slots)
      const shopR: Relic[] = [];
      const relicTypes = [RelicType.LAST_WILL, RelicType.NECROMANCY];
      // Pick 2 random types (duplicates allowed in generation pool, but distinct slots)
      for(let i=0; i<2; i++) {
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

  const nextLevel = () => {
      const nextLvl = campaignLevel + 1;
      setCampaignLevel(nextLvl);
      initGame(true, masterDeck, nextLvl);
  };

  const endPlayerTurn = (currentBoard: Cell[][], currentEnPassantTarget: Position | null) => {
    setTurn(Side.BLACK);
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
    if (cardsPlayed >= 3) {
      alert("You have reached the maximum of 3 cards played this turn.");
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

  const getCellSizeClass = () => {
     const size = board.length;
     if (size >= 10) return "w-10 h-10 sm:w-12 sm:h-12";
     return "w-12 h-12 sm:w-16 sm:h-16";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg z-10 shrink-0">
        <div>
           <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
             CHESS EVOLUTION
           </h1>
           {isCampaign && <p className="text-xs text-yellow-500 font-bold tracking-widest">CAMPAIGN LEVEL {campaignLevel}</p>}
        </div>
        
        {phase === 'PLAYING' || phase === 'SHOP' || phase === 'REWARD' ? (
          <div className="flex gap-4 items-center">
            {/* Relics Bar */}
            {relics.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-lg border border-slate-600">
                    {relics.map((r, i) => (
                        <div key={i} className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setSelectedRelic(r)}>
                            <span className="text-2xl">{RELIC_INFO[r.type].icon}</span>
                            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-500 font-bold">
                                {r.level}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-center px-4 py-1 bg-slate-700 rounded-lg border border-slate-600">
               <span className="block text-[10px] uppercase text-slate-400">Treasury</span>
               <span className="font-bold text-yellow-400 text-lg">💰 {gold}</span>
            </div>
            {phase === 'PLAYING' && (
              <>
                <div className="text-center">
                   <span className="block text-[10px] uppercase text-slate-500">Played</span>
                   <span className={`font-bold ${cardsPlayed >= 3 ? 'text-red-500' : 'text-white'}`}>{cardsPlayed}/3</span>
                </div>
                <Button className="bg-red-900/50 hover:bg-red-800 text-xs border border-red-700" onClick={() => setPhase('SETTINGS')}>Resign</Button>
              </>
            )}
          </div>
        ) : null}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex relative overflow-hidden">
        
        {/* SETTINGS MENU */}
        {phase === 'SETTINGS' && (
           <div className="m-auto bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
             <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tighter">NEW GAME</h2>
             
             <Button 
                onClick={startCampaign}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 text-xl mb-6 shadow-purple-900/50"
             >
               👑 Start Campaign
             </Button>
             
             <div className="border-t border-slate-700 my-6"></div>
             
             <h3 className="text-sm uppercase text-slate-500 font-bold mb-4 text-center">Custom Game</h3>

             <div className="mb-4">
               <label className="block text-sm font-bold mb-2 text-slate-300">Board Size: {settings.boardSize}</label>
               <input 
                 type="range" min="6" max="12" value={settings.boardSize}
                 onChange={(e) => setSettings({...settings, boardSize: parseInt(e.target.value)})}
                 className="w-full accent-yellow-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
               />
             </div>
             <div className="mb-6">
               <label className="block text-sm font-bold mb-2 text-slate-300">Enemies: {settings.enemyCount}</label>
               <input 
                 type="range" min="1" max="10" value={settings.enemyCount}
                 onChange={(e) => setSettings({...settings, enemyCount: parseInt(e.target.value)})}
                 className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
               />
             </div>

             <Button 
               onClick={() => initGame(false)} 
               className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-3"
             >
               Start Custom Game
             </Button>
           </div>
        )}

        {/* DECK SELECTION */}
        {phase === 'DECK_SELECTION' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900">
             <h2 className="text-3xl font-bold mb-2 text-white">Choose Your Army</h2>
             <p className="text-slate-400 mb-8">Select a starter deck to begin your campaign.</p>
             <div className="flex flex-wrap gap-6 justify-center">
                {STARTER_DECKS.map((starter, idx) => (
                  <div key={idx} 
                       onClick={() => selectStarterDeck(idx)}
                       className="w-64 bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 hover:scale-105 transition-all cursor-pointer rounded-xl p-6 flex flex-col shadow-xl">
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">{starter.name}</h3>
                      <p className="text-sm text-slate-300 mb-4 h-10">{starter.description}</p>
                      <div className="space-y-1 bg-slate-900/50 p-2 rounded">
                        {starter.cards.map((c, i) => (
                           <div key={i} className="text-xs text-slate-400 flex items-center">
                              <span className="mr-2 text-yellow-600">▪</span> 
                              {DECK_TEMPLATE.find(t => t.type === c)?.title}
                           </div>
                        ))}
                      </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* REWARD SCREEN */}
        {phase === 'REWARD' && (
           <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-black text-yellow-400 mb-4 animate-bounce">VICTORY!</h2>
              <p className="text-xl text-white mb-8">Choose a card to add to your deck</p>
              <div className="flex gap-6 mb-12">
                 {rewardCards.map(card => (
                   <div key={card.id} className="scale-125">
                     <CardComponent 
                       card={card} 
                       selected={false} 
                       disabled={false} 
                       onClick={() => selectReward(card)} 
                     />
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* SHOP SCREEN */}
        {phase === 'SHOP' && (
           <div className="w-full h-full flex flex-col items-center p-8 bg-slate-900 overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Merchant's Camp</h2>
                <p className="text-slate-400">Spend your gold to reinforce your army.</p>
              </div>
              
              {/* Relic Shop Section */}
              {shopRelics.length > 0 && (
                <div className="mb-12 w-full max-w-4xl">
                    <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-purple-500/30 pb-2">Ancient Relics</h3>
                    <div className="flex gap-6 justify-center">
                        {shopRelics.map((relic, idx) => {
                             const info = RELIC_INFO[relic.type];
                             const existing = relics.find(r => r.type === relic.type);
                             const level = existing ? existing.level : 0;
                             const cost = info.basePrice * (level + 1);
                             
                             return (
                                <div key={idx} className="bg-slate-800 border border-purple-500/50 rounded-lg p-4 w-64 flex flex-col items-center hover:bg-slate-800/80 transition-colors shadow-lg shadow-purple-900/20">
                                    <div className="text-5xl mb-2">{info.icon}</div>
                                    <div className="font-bold text-white">{info.name}</div>
                                    <div className="text-xs text-purple-300 uppercase font-bold mb-2">{existing ? `Upgrade to Lvl ${level + 1}` : "New Artifact"}</div>
                                    <p className="text-xs text-slate-400 text-center mb-4 h-12 flex items-center justify-center">
                                        {info.description(level + 1)}
                                    </p>
                                    <Button 
                                        disabled={gold < cost}
                                        onClick={() => buyRelic(relic, idx)}
                                        className={`w-full ${gold >= cost ? 'bg-purple-600 hover:bg-purple-500' : 'bg-slate-700'}`}
                                    >
                                        Buy {cost}g
                                    </Button>
                                </div>
                             );
                        })}
                    </div>
                </div>
              )}

              {/* Cards Shop Section */}
              <div className="w-full max-w-4xl mb-12">
                 <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-500/30 pb-2">Battle Cards</h3>
                 <div className="flex flex-wrap gap-8 justify-center">
                    {shopCards.map(card => (
                    <div key={card.id} className="relative group">
                        <CardComponent 
                        card={card} 
                        selected={false} 
                        disabled={gold < card.cost} 
                        onClick={() => buyCard(card)}
                        showCost={true}
                        />
                        {gold < card.cost && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-red-500 font-bold rotate-12 border-2 border-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            TOO EXPENSIVE
                        </div>
                        )}
                    </div>
                    ))}
                    {shopCards.length === 0 && <div className="text-slate-500 italic">Sold Out</div>}
                 </div>
              </div>

              <Button 
                onClick={nextLevel} 
                className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 text-xl shadow-lg shadow-green-900/50"
              >
                Next Battle &rarr;
              </Button>
           </div>
        )}

        {/* GAME OVER */}
        {(phase === 'GAME_OVER_WIN' || phase === 'GAME_OVER_LOSS') && (
           <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
             <div className="text-center p-8 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl">
               <h2 className={`text-6xl font-black mb-4 ${phase === 'GAME_OVER_WIN' ? 'text-green-400' : 'text-red-500'}`}>
                 {phase === 'GAME_OVER_WIN' ? 'VICTORY' : 'DEFEAT'}
               </h2>
               <p className="text-slate-300 mb-8 text-xl">
                 {phase === 'GAME_OVER_WIN' ? (isCampaign ? 'The enemy army has been annihilated!' : 'You have won!') : (isCampaign ? 'Your army is depleted.' : 'You have lost.')}
               </p>
               <div className="flex gap-4 justify-center">
                 <Button onClick={() => setPhase('SETTINGS')} className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-xl">
                   Main Menu
                 </Button>
                 {phase === 'GAME_OVER_LOSS' && isCampaign && (
                    <Button onClick={startCampaign} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 text-xl">
                      Restart Campaign
                    </Button>
                 )}
               </div>
             </div>
           </div>
        )}

        {/* PLAYING BOARD */}
        {phase === 'PLAYING' && (
          <div className="flex flex-col w-full h-full">
            
            {/* Board Area */}
            <div className="flex-grow flex items-center justify-center p-4 bg-[#1a1c23] overflow-auto">
               <div 
                 className="grid bg-[#3d2e23] p-2 rounded shadow-2xl border-4 border-[#2a2018]"
                 style={{ 
                   gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))` 
                 }}
               >
                 {board.map((row, r) => (
                   row.map((cell, c) => {
                     const isDark = (r + c) % 2 === 1;
                     const isSelected = selectedPiecePos?.row === r && selectedPiecePos?.col === c;
                     const isValid = validMoves.some(m => m.row === r && m.col === c);
                     const isLastFrom = lastMoveFrom?.row === r && lastMoveFrom?.col === c;
                     const isLastTo = lastMoveTo?.row === r && lastMoveTo?.col === c;
                     const size = board.length;

                     // Card Targeting Highlight
                     const isCardTarget = selectedCardId && cardTargetMode && (
                        (cardTargetMode.type.includes('SPAWN') && r >= size - 2 && !cell.piece) ||
                        (cardTargetMode.type.includes('SWITCH') && cell.piece?.side === Side.WHITE) ||
                        (cardTargetMode.type.includes('BORROW') && cell.piece?.side === Side.WHITE) ||
                        (cardTargetMode.type.includes('BACK') && cell.piece?.side === Side.WHITE && cell.piece.type !== PieceType.KING)
                     );

                     return (
                       <div 
                         key={`${r}-${c}`}
                         onClick={() => handleSquareClick(r, c)}
                         className={`
                           ${getCellSizeClass()} flex items-center justify-center relative select-none
                           ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'}
                           ${isSelected ? 'ring-inset ring-4 ring-yellow-400' : ''}
                           ${isCardTarget ? 'ring-inset ring-4 ring-blue-500 cursor-copy' : ''}
                           ${(isLastFrom || isLastTo) ? 'after:absolute after:inset-0 after:bg-yellow-500/30' : ''}
                           ${isValid ? 'cursor-pointer' : ''}
                         `}
                       >
                         {(c === 0) && <span className={`absolute left-0.5 top-0.5 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{size - r}</span>}
                         {(r === size - 1) && <span className={`absolute right-0.5 bottom-0 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{String.fromCharCode(97 + c)}</span>}

                         {isValid && !cell.piece && <div className="w-3 h-3 rounded-full bg-black/20" />}
                         {isValid && cell.piece && <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />}

                         {cell.piece && (
                           <div className={`
                             w-4/5 h-4/5 transition-transform duration-200
                             ${cell.piece.side === Side.WHITE ? 'text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)]' : 'text-black drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]'}
                             ${cell.piece.isFrozen ? 'brightness-50 grayscale opacity-80' : ''}
                           `}>
                             {PIECE_ICONS[cell.piece.type]}
                             {cell.piece.isFrozen && <div className="absolute -top-1 -right-1 text-base">❄️</div>}
                             {cell.piece.tempMoveOverride && <div className="absolute -bottom-1 -right-1 text-xs bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center border border-white">✨</div>}
                           </div>
                         )}
                       </div>
                     );
                   })
                 ))}
               </div>
            </div>

            {/* Hand Area */}
            <div className="h-56 bg-slate-900 border-t border-slate-700 flex flex-col relative z-20 shrink-0">
               <div className="flex-grow flex items-center px-4 space-x-4">
                  
                  {/* Cards Container */}
                  <div className="flex-grow flex items-center overflow-x-auto hide-scrollbar space-x-4 h-full">
                      {hand.length === 0 && (
                        <div className="w-full text-center text-slate-500 italic">
                          Your hand is empty.
                        </div>
                      )}
                      {hand.map((card) => (
                        <CardComponent 
                          key={card.id} 
                          card={card} 
                          selected={selectedCardId === card.id} 
                          onClick={() => handleCardClick(card)}
                          disabled={turn !== Side.WHITE}
                        />
                      ))}
                  </div>

                  {/* Deck Pile Button */}
                  <div 
                    onClick={() => setShowDeckModal(true)}
                    className="w-24 h-40 border-2 border-slate-600 bg-slate-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:-translate-y-1 transition-all shadow-lg shrink-0 ml-4 group"
                  >
                     <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🎴</div>
                     <div className="font-bold text-lg text-white">{deck.length}</div>
                     <div className="text-[10px] text-slate-400 uppercase tracking-wider">Deck</div>
                  </div>

               </div>
               
               <div className="h-8 bg-slate-800 text-center text-xs text-slate-400 flex items-center justify-center border-t border-slate-700">
                  {selectedCardId 
                    ? <span className="text-yellow-400 animate-pulse">Select a target on the board to cast spell</span> 
                    : turn === Side.WHITE ? `Your Turn: Play cards (${3 - cardsPlayed} left) or move a piece.` : "Enemy Turn..."}
               </div>
            </div>

            {/* Deck Modal */}
            {showDeckModal && (
               <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col p-8">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-bold text-white">Your Remaining Deck ({deck.length})</h2>
                     <Button onClick={() => setShowDeckModal(false)} className="bg-slate-700 hover:bg-slate-600 text-white">Close</Button>
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    <div className="flex flex-wrap gap-4 justify-center">
                       {deck.length === 0 && <p className="text-slate-500 italic">Deck is empty.</p>}
                       {deck.map((card, i) => (
                          <div key={i} className="opacity-80 hover:opacity-100 transition-opacity">
                             <CardComponent card={card} selected={false} onClick={() => {}} disabled={false} />
                          </div>
                       ))}
                    </div>
                  </div>
               </div>
            )}

            {/* Relic Dialog */}
            {selectedRelic && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center">
                     <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 max-w-sm w-full shadow-2xl relative">
                         <div className="text-6xl text-center mb-4">{RELIC_INFO[selectedRelic.type].icon}</div>
                         <h3 className="text-2xl font-bold text-center text-white mb-1">{RELIC_INFO[selectedRelic.type].name}</h3>
                         <p className="text-purple-400 text-center font-bold mb-4">Level {selectedRelic.level}</p>
                         <p className="text-slate-300 text-center mb-8">
                             {RELIC_INFO[selectedRelic.type].description(selectedRelic.level)}
                         </p>
                         
                         <div className="flex gap-4">
                             <Button onClick={() => setSelectedRelic(null)} className="flex-1 bg-slate-600 hover:bg-slate-500">Close</Button>
                             <Button onClick={() => sellRelic(selectedRelic)} className="flex-1 bg-red-600 hover:bg-red-500">
                                 Sell (+{Math.floor(RELIC_INFO[selectedRelic.type].basePrice * selectedRelic.level * 0.5)}g)
                             </Button>
                         </div>
                     </div>
                </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
