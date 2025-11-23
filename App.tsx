import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameSettings, GamePhase, Cell, Piece, PieceType, Side, Card, CardType, Position 
} from './types';
import { PIECE_ICONS, DECK_TEMPLATE } from './constants';
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
}

const CardComponent: React.FC<CardComponentProps> = ({ card, selected, onClick, disabled }) => (
  <div 
    onClick={() => !disabled && onClick()}
    className={`
      flex-shrink-0 w-32 h-44 border-2 rounded-lg p-3 flex flex-col justify-between cursor-pointer transition-all duration-200
      ${selected ? 'border-yellow-400 bg-yellow-50 -translate-y-4 shadow-xl ring-2 ring-yellow-400' : 'border-gray-600 bg-slate-800 text-white hover:-translate-y-2 hover:shadow-lg'}
      ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
    `}
  >
    <div className="text-xs font-bold uppercase tracking-wider text-center border-b border-gray-500 pb-1 mb-1 truncate">
      {card.title}
    </div>
    <div className="flex-grow flex items-center justify-center text-center">
      {/* Icon placeholder based on type */}
      <span className="text-2xl">
        {card.type.includes('SPAWN') && '⚔️'}
        {card.type.includes('SWITCH') && '🔄'}
        {card.type.includes('FREEZE') && '❄️'}
        {card.type.includes('LIMIT') && '🐌'}
        {card.type.includes('BORROW') && '🎭'}
        {card.type.includes('BACK') && '↩️'}
      </span>
    </div>
    <div className="text-[10px] text-center leading-tight opacity-90">
      {card.description}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETTINGS');
  const [settings, setSettings] = useState<GameSettings>({ boardSize: 8, enemyCount: 6, playerCount: 4 });
  
  // Game State
  const [board, setBoard] = useState<Cell[][]>([]);
  const [turn, setTurn] = useState<Side>(Side.WHITE);
  const [turnCount, setTurnCount] = useState(1);
  const [selectedPiecePos, setSelectedPiecePos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMoveFrom, setLastMoveFrom] = useState<Position | null>(null);
  const [lastMoveTo, setLastMoveTo] = useState<Position | null>(null);
  const [isEnemyMoveLimited, setIsEnemyMoveLimited] = useState(false);

  // Card State
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardTargetMode, setCardTargetMode] = useState<{
    type: CardType; 
    step: 'SELECT_PIECE_1' | 'SELECT_PIECE_2' | 'SELECT_SQUARE';
    sourcePos?: Position;
  } | null>(null);

  // --- Logic Helpers ---

  const initGame = () => {
    const size = settings.boardSize;
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

    // Place Random Enemies (Restricted to first 2 rows: 0, 1)
    let enemiesPlaced = 0;
    const enemyTypes = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN, PieceType.QUEEN];
    let safety = 0;
    
    while (enemiesPlaced < settings.enemyCount && safety < 1000) {
      safety++;
      const r = Math.floor(Math.random() * 2); // 0 or 1
      const c = Math.floor(Math.random() * size);
      
      if (!newBoard[r][c].piece) {
        newBoard[r][c].piece = {
          id: uuidv4(),
          type: enemyTypes[Math.floor(Math.random() * enemyTypes.length)],
          side: Side.BLACK,
          hasMoved: false
        };
        enemiesPlaced++;
      }
    }

    // Place Random Player Pieces (Restricted to last 2 rows: size-2, size-1)
    let playersPlaced = 0;
    const playerTypes = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.PAWN];
    safety = 0;

    while (playersPlaced < settings.playerCount && safety < 1000) {
      safety++;
      const r = (size - 2) + Math.floor(Math.random() * 2); // size-2 or size-1
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

    // Init Deck
    const newDeck = Array.from({ length: 20 }).map(() => {
        const template = DECK_TEMPLATE[Math.floor(Math.random() * DECK_TEMPLATE.length)];
        return { ...template, id: uuidv4() };
    });
    
    // Draw initial hand (3 cards)
    const initialHand = newDeck.splice(0, 3);

    setBoard(newBoard);
    setDeck(newDeck);
    setHand(initialHand);
    setTurn(Side.WHITE);
    setPhase('PLAYING');
    setTurnCount(1);
    setSelectedPiecePos(null);
    setValidMoves([]);
    setIsEnemyMoveLimited(false);
  };

  const drawCard = useCallback(() => {
    if (deck.length > 0) {
      const newDeck = [...deck];
      const card = newDeck.pop();
      setDeck(newDeck);
      if (card) setHand(prev => [...prev, card]);
    }
  }, [deck]);

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== Side.WHITE) return;

    const clickedPiece = board[r][c].piece;
    const isSelfPiece = clickedPiece?.side === Side.WHITE;
    const isEnemyPiece = clickedPiece?.side === Side.BLACK;
    const isEmpty = !clickedPiece;

    // --- Card Targeting Mode ---
    if (selectedCardId && cardTargetMode) {
      handleCardTargeting(r, c, clickedPiece);
      return;
    }

    // --- Normal Movement Mode ---
    
    // 1. Select own piece
    if (isSelfPiece) {
      if (selectedPiecePos?.row === r && selectedPiecePos?.col === c) {
        // Deselect
        setSelectedPiecePos(null);
        setValidMoves([]);
      } else {
        // Select
        setSelectedPiecePos({ row: r, col: c });
        const moves = getValidMoves(board, clickedPiece!, { row: r, col: c });
        setValidMoves(moves);
      }
      return;
    }

    // 2. Move to valid square
    const isMoveValid = validMoves.some(m => m.row === r && m.col === c);
    if (selectedPiecePos && isMoveValid) {
      executeMove(selectedPiecePos, { row: r, col: c });
      // End turn triggers automatically in executeMove
    }
  };

  const executeMove = (from: Position, to: Position) => {
    const newBoard = [...board.map(row => [...row])]; // Deep copy
    const piece = newBoard[from.row][from.col].piece!;
    const target = newBoard[to.row][to.col].piece;

    // Move logic
    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined }; // Clear temp moves
    newBoard[from.row][from.col].piece = null;

    setBoard(newBoard);
    setLastMoveFrom(from);
    setLastMoveTo(to);
    setSelectedPiecePos(null);
    setValidMoves([]);

    // Check Win
    if (target?.type === PieceType.KING && target.side === Side.BLACK) {
      setPhase('GAME_OVER_WIN');
      return;
    }

    // End Turn
    endPlayerTurn();
  };

  const endPlayerTurn = () => {
    setTurn(Side.BLACK);
    // Trigger AI after delay
    setTimeout(executeEnemyTurn, 800);
  };

  const executeEnemyTurn = () => {
    setBoard(prevBoard => {
      const size = prevBoard.length;
      // 1. Unfreeze enemies
      const boardCopy = prevBoard.map(row => row.map(cell => ({
        ...cell,
        piece: cell.piece ? { ...cell.piece, isFrozen: false } : null
      })));

      // 2. Find all enemies and their moves
      const enemies: { pos: Position, piece: Piece, moves: Position[] }[] = [];
      let playerKingPos: Position | null = null;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardCopy[r][c].piece;
          if (p?.side === Side.BLACK && !p.isFrozen) {
            let moves = getValidMoves(boardCopy, p, { row: r, col: c });
            
            // Apply LIMIT card effect
            if (isEnemyMoveLimited) {
                // Filter moves that are distance > 1
                moves = moves.filter(m => Math.abs(m.row - r) <= 1 && Math.abs(m.col - c) <= 1);
            }
            
            if (moves.length > 0) {
              enemies.push({ pos: { row: r, col: c }, piece: p, moves });
            }
          }
          if (p?.side === Side.WHITE && p.type === PieceType.KING) {
            playerKingPos = { row: r, col: c };
          }
        }
      }

      if (enemies.length === 0) {
        // Stalemate or trapped. Pass turn.
        setTurn(Side.WHITE);
        drawCard();
        setIsEnemyMoveLimited(false); // Reset effect
        return boardCopy;
      }

      // 3. AI Strategy: Capture > Advance towards King > Random
      let bestMove: { from: Position, to: Position } | null = null;
      
      // Try to capture King
      for (const e of enemies) {
        const kingKill = e.moves.find(m => boardCopy[m.row][m.col].piece?.type === PieceType.KING);
        if (kingKill) {
          bestMove = { from: e.pos, to: kingKill };
          break;
        }
      }

      // Try to capture any piece
      if (!bestMove) {
        const captures: { from: Position, to: Position, value: number }[] = [];
        enemies.forEach(e => {
          e.moves.forEach(m => {
            const target = boardCopy[m.row][m.col].piece;
            if (target?.side === Side.WHITE) {
               let val = 1;
               if (target.type === PieceType.QUEEN) val = 5;
               captures.push({ from: e.pos, to: m, value: val });
            }
          });
        });
        if (captures.length > 0) {
          captures.sort((a, b) => b.value - a.value);
          bestMove = captures[0];
        }
      }

      // Random move
      if (!bestMove) {
         const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
         const randomMove = randomEnemy.moves[Math.floor(Math.random() * randomEnemy.moves.length)];
         bestMove = { from: randomEnemy.pos, to: randomMove };
      }

      // Execute
      if (bestMove) {
        const captured = boardCopy[bestMove.to.row][bestMove.to.col].piece;
        boardCopy[bestMove.to.row][bestMove.to.col].piece = { ...boardCopy[bestMove.from.row][bestMove.from.col].piece!, hasMoved: true };
        boardCopy[bestMove.from.row][bestMove.from.col].piece = null;
        
        setLastMoveFrom(bestMove.from);
        setLastMoveTo(bestMove.to);

        if (captured?.type === PieceType.KING) {
          setPhase('GAME_OVER_LOSS');
        }
      }

      // Reset turn to Player
      setTurn(Side.WHITE);
      setTurnCount(c => c + 1);
      drawCard(); // Player draws a card at start of their turn
      setIsEnemyMoveLimited(false); // Reset limited movement
      
      return boardCopy;
    });
  };

  // --- Card Logic ---

  const handleCardClick = (card: Card) => {
    if (turn !== Side.WHITE) return;
    
    if (selectedCardId === card.id) {
      // Deselect
      setSelectedCardId(null);
      setCardTargetMode(null);
      return;
    }

    setSelectedCardId(card.id);
    setSelectedPiecePos(null);
    setValidMoves([]);

    // Determine targeting mode
    if (card.type.includes('SPAWN') || card.type === CardType.EFFECT_BACK_BASE) {
      setCardTargetMode({ type: card.type, step: 'SELECT_SQUARE' });
    } else if (card.type === CardType.EFFECT_SWITCH) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else if (card.type.includes('BORROW')) {
      setCardTargetMode({ type: card.type, step: 'SELECT_PIECE_1' });
    } else {
      // Instant effects (Freeze, Limit)
      playInstantCard(card);
    }
  };

  const playInstantCard = (card: Card) => {
    const newBoard = board.map(row => [...row]);
    let played = false;

    if (card.type === CardType.EFFECT_FREEZE) {
      // Find all enemies
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

    // SPAWN
    if (type.includes('SPAWN')) {
        // Can only spawn on last 2 rows (Base) and empty
        if (r >= settings.boardSize - 2 && !piece) {
            const spawnType = type.replace('SPAWN_', '') as PieceType;
            newBoard[r][c].piece = {
                id: uuidv4(),
                type: spawnType,
                side: Side.WHITE,
                hasMoved: false
            };
            setBoard(newBoard);
            consumeCard(selectedCardId);
        } else {
            // Invalid spawn target feedback
            alert("Can only spawn on empty squares in your base rows (bottom 2 rows).");
        }
        return;
    }

    // BACK TO BASE
    if (type === CardType.EFFECT_BACK_BASE) {
        if (step === 'SELECT_SQUARE') {
             // Logic is slightly inverted: Select piece THEN auto-move? Or Select Piece then Select Target? 
             // Simplification: Select friendly piece, it teleports to nearest empty base slot.
             if (piece?.side === Side.WHITE && piece.type !== PieceType.KING) {
                 // Find empty base slot
                 let targetPos: Position | null = null;
                 const baseRows = [settings.boardSize - 1, settings.boardSize - 2];
                 const center = Math.floor(settings.boardSize / 2);
                 const cols = Array.from({length: settings.boardSize}, (_, i) => i).sort((a,b) => Math.abs(a-center) - Math.abs(b-center));
                 
                 // Search bottom-up, center-out
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
        }
        return;
    }

    // BORROW
    if (type.includes('BORROW')) {
        if (piece?.side === Side.WHITE) {
            const borrowType = type.replace('EFFECT_BORROW_', '') as PieceType;
            newBoard[r][c].piece = { ...piece, tempMoveOverride: borrowType };
            setBoard(newBoard);
            consumeCard(selectedCardId);
        }
        return;
    }

    // SWITCH
    if (type === CardType.EFFECT_SWITCH) {
        if (step === 'SELECT_PIECE_1') {
            if (piece?.side === Side.WHITE) {
                setCardTargetMode({ ...cardTargetMode, step: 'SELECT_PIECE_2', sourcePos: { row: r, col: c } });
            }
        } else if (step === 'SELECT_PIECE_2') {
             if (piece?.side === Side.WHITE && cardTargetMode.sourcePos) {
                 const p1 = newBoard[cardTargetMode.sourcePos.row][cardTargetMode.sourcePos.col].piece;
                 const p2 = piece;
                 if (p1 && p2) {
                    newBoard[cardTargetMode.sourcePos.row][cardTargetMode.sourcePos.col].piece = p2;
                    newBoard[r][c].piece = p1;
                    setBoard(newBoard);
                    consumeCard(selectedCardId);
                 }
             }
        }
        return;
    }
  };

  const consumeCard = (id: string) => {
    setHand(prev => prev.filter(c => c.id !== id));
    setSelectedCardId(null);
    setCardTargetMode(null);
  };

  // --- Render ---

  // Calculate cell sizing dynamically
  const getCellSizeClass = () => {
     if (settings.boardSize >= 10) return "w-10 h-10 sm:w-12 sm:h-12";
     return "w-12 h-12 sm:w-16 sm:h-16";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
        <div>
           <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
             CHESS EVOLUTION
           </h1>
           <p className="text-xs text-slate-400">Deck-building Strategy</p>
        </div>
        {phase === 'PLAYING' && (
          <div className="flex gap-4 items-center">
            <div className="text-center">
               <span className="block text-xs uppercase text-slate-500">Turn</span>
               <span className={`font-bold ${turn === Side.WHITE ? 'text-green-400' : 'text-red-400'}`}>
                 {turn === Side.WHITE ? 'PLAYER' : 'ENEMY'}
               </span>
            </div>
            <div className="text-center">
               <span className="block text-xs uppercase text-slate-500">Deck</span>
               <span className="font-bold">{deck.length}</span>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-xs" onClick={() => setPhase('SETTINGS')}>Resign</Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex relative overflow-hidden">
        
        {phase === 'SETTINGS' && (
           <div className="m-auto bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
             <h2 className="text-xl font-bold mb-6 text-white text-center">New Game Setup</h2>
             
             <div className="mb-6">
               <label className="block text-sm font-bold mb-2 text-slate-300">Board Size: {settings.boardSize}x{settings.boardSize}</label>
               <input 
                 type="range" min="6" max="12" step="1" 
                 value={settings.boardSize}
                 onChange={(e) => setSettings({...settings, boardSize: parseInt(e.target.value)})}
                 className="w-full accent-yellow-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-xs text-slate-500 mt-1">
                 <span>6x6</span><span>12x12</span>
               </div>
             </div>

             <div className="mb-6">
               <label className="block text-sm font-bold mb-2 text-slate-300">Enemy Random Pieces: {settings.enemyCount}</label>
               <input 
                 type="range" min="1" max="10" step="1" 
                 value={settings.enemyCount}
                 onChange={(e) => setSettings({...settings, enemyCount: parseInt(e.target.value)})}
                 className="w-full accent-red-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
               />
             </div>

             <div className="mb-8">
               <label className="block text-sm font-bold mb-2 text-slate-300">Player Random Pieces: {settings.playerCount}</label>
               <input 
                 type="range" min="0" max="10" step="1" 
                 value={settings.playerCount}
                 onChange={(e) => setSettings({...settings, playerCount: parseInt(e.target.value)})}
                 className="w-full accent-green-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
               />
             </div>

             <Button 
               onClick={initGame} 
               className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-slate-900 py-3 text-lg"
             >
               Start Campaign
             </Button>
           </div>
        )}

        {(phase.includes('GAME_OVER')) && (
           <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
             <div className="text-center">
               <h2 className={`text-6xl font-black mb-4 ${phase === 'GAME_OVER_WIN' ? 'text-green-400' : 'text-red-500'}`}>
                 {phase === 'GAME_OVER_WIN' ? 'VICTORY' : 'DEFEAT'}
               </h2>
               <p className="text-slate-300 mb-8 text-xl">
                 {phase === 'GAME_OVER_WIN' ? 'The Enemy King has fallen.' : 'Your King has been captured.'}
               </p>
               <Button onClick={() => setPhase('SETTINGS')} className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-xl">
                 Play Again
               </Button>
             </div>
           </div>
        )}

        {phase === 'PLAYING' && (
          <div className="flex flex-col w-full h-full">
            
            {/* Board Area */}
            <div className="flex-grow flex items-center justify-center p-4 bg-[#1a1c23]">
               <div 
                 className="grid bg-[#3d2e23] p-2 rounded shadow-2xl border-4 border-[#2a2018]"
                 style={{ 
                   gridTemplateColumns: `repeat(${settings.boardSize}, minmax(0, 1fr))` 
                 }}
               >
                 {board.map((row, r) => (
                   row.map((cell, c) => {
                     const isDark = (r + c) % 2 === 1;
                     const isSelected = selectedPiecePos?.row === r && selectedPiecePos?.col === c;
                     const isValid = validMoves.some(m => m.row === r && m.col === c);
                     const isLastFrom = lastMoveFrom?.row === r && lastMoveFrom?.col === c;
                     const isLastTo = lastMoveTo?.row === r && lastMoveTo?.col === c;
                     
                     // Card Targeting Highlight
                     const isCardTarget = selectedCardId && cardTargetMode && (
                        (cardTargetMode.type.includes('SPAWN') && r >= settings.boardSize - 2 && !cell.piece) ||
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
                         {/* Coordinate Labels (optional, small) */}
                         {(c === 0) && <span className={`absolute left-0.5 top-0.5 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{settings.boardSize - r}</span>}
                         {(r === settings.boardSize - 1) && <span className={`absolute right-0.5 bottom-0 text-[8px] ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>{String.fromCharCode(97 + c)}</span>}

                         {/* Valid Move Indicator */}
                         {isValid && !cell.piece && (
                           <div className="w-3 h-3 rounded-full bg-black/20" />
                         )}
                         {isValid && cell.piece && (
                           <div className="absolute inset-0 border-4 border-red-500/50 rounded-full animate-pulse" />
                         )}

                         {/* Piece */}
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
            <div className="h-56 bg-slate-900 border-t border-slate-700 flex flex-col relative z-20">
               <div className="flex-grow flex items-center overflow-x-auto hide-scrollbar px-4 space-x-4">
                  {/* Empty state */}
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
               
               {/* Instructions Bar */}
               <div className="h-8 bg-slate-800 text-center text-xs text-slate-400 flex items-center justify-center border-t border-slate-700">
                  {selectedCardId 
                    ? <span className="text-yellow-400 animate-pulse">Select a target on the board to cast spell</span> 
                    : "Draw a card each turn. Move pieces to capture the Enemy King."}
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}