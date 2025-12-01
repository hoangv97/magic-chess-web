
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Cell, Piece, PieceType, Side, Position, TileEffect, Card, CardType, GameSettings, Relic, RelicType 
} from '../types';
import { 
  generateBoard, getValidMoves 
} from '../utils/gameLogic';
import { 
  getDeckTemplate, PIECE_GOLD_VALUES, MAX_CARDS_IN_HAND, MAX_CARDS_PLAYED_PER_TURN, RELIC_LEVEL_REWARDS, getTileEffectInfo 
} from '../constants';
import { TRANSLATIONS } from '../utils/locales';

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

  const initGame = (campaignMode: boolean, campaignDeck?: Card[], level: number = 1) => {
    let size = settings.boardSize;
    let eCount = settings.enemyCount;
    let pCount = settings.playerCount;

    if (campaignMode) {
      size = Math.min(6 + Math.floor((level - 1) / 2), 12);
      eCount = Math.min(2 + level, 12); 
      pCount = 0; 
    }

    const newBoard = generateBoard(size);
    
    // Place Player King
    const kingPos = { row: size - 1, col: Math.floor(size / 2) };
    newBoard[kingPos.row][kingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.WHITE,
      hasMoved: false,
      frozenTurns: 0
    };

    // Place Enemy King
    const enemyKingPos = { row: 0, col: Math.floor(size / 2) };
    newBoard[enemyKingPos.row][enemyKingPos.col].piece = {
      id: uuidv4(),
      type: PieceType.KING,
      side: Side.BLACK,
      hasMoved: false,
      frozenTurns: 0
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
          frozenTurns: 0
        };
        enemiesPlaced++;
      }
    }

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
            frozenTurns: 0
            };
            playersPlaced++;
        }
        }
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
  };

  const drawCard = useCallback(() => {
    if (deck.length > 0 && hand.length < MAX_CARDS_IN_HAND) {
      const newDeck = [...deck];
      const card = newDeck.pop();
      setDeck(newDeck);
      if (card) setHand(prev => [...prev, card]);
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

  const showCellInfo = (r: number, c: number) => {
    const cell = board[r][c];
    const piece = cell.piece;
    const effect = cell.tileEffect;
    const tileInfo = getTileEffectInfo(settings.language, effect);

    if (piece) {
       const contentChildren = [];
       
       // Status
       contentChildren.push(React.createElement('p', { key: 'status' }, [
         React.createElement('strong', { key: 's-label' }, t.tooltips.status + ' '),
         (piece.frozenTurns || 0) > 0 
           ? React.createElement('span', { key: 's-val', className: "text-blue-400" }, t.tooltips.frozen.replace('{0}', String(piece.frozenTurns)))
           : React.createElement('span', { key: 's-val', className: "text-green-400" }, t.tooltips.active)
       ]));

       // Effect override
       if (piece.tempMoveOverride) {
         contentChildren.push(React.createElement('p', { key: 'effect' }, [
           React.createElement('strong', { key: 'e-label' }, t.tooltips.effect + ' '),
           React.createElement('span', { key: 'e-val', className: "text-purple-400" }, t.tooltips.movesLike.replace('{0}', t.pieces[piece.tempMoveOverride]))
         ]));
       }

       // Terrain info inside piece info
       if (effect !== TileEffect.NONE) {
          contentChildren.push(React.createElement('div', { key: 'terrain', className: "pt-4 border-t border-slate-600" }, [
             React.createElement('p', { key: 't-head', className: "text-xs text-slate-400 uppercase tracking-widest mb-1" }, t.tooltips.currentTerrain),
             React.createElement('p', { key: 't-name', className: "font-bold text-yellow-500" }, tileInfo.name),
             React.createElement('p', { key: 't-desc' }, tileInfo.desc)
          ]));
       }

       setInfoModalContent({
           title: `${piece.side === Side.WHITE ? t.game.mainMenu.replace('Main Menu', 'Player') : 'Enemy'} ${t.pieces[piece.type]}`,
           content: React.createElement('div', { className: "space-y-4" }, contentChildren)
       });
       return;
    }

    if (effect !== TileEffect.NONE) {
        setInfoModalContent({
            title: tileInfo.name,
            content: React.createElement('p', null, tileInfo.desc)
        });
    }
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
              frozenTurns: 0
          };
      }
  };

  const executeMove = (from: Position, to: Position) => {
    const newBoard = [...board.map(row => row.map(cell => ({...cell})))];
    const piece = newBoard[from.row][from.col].piece!;
    let target = newBoard[to.row][to.col].piece;
    let nextEnPassantTarget: Position | null = null;
    let enemyKilled = false;
    let selfKilled = false;

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

    if (piece.type === PieceType.PAWN && Math.abs(from.row - to.row) === 2) {
        nextEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    }

    if (target && target.side === Side.BLACK) {
        const goldReward = PIECE_GOLD_VALUES[target.type] || 10;
        setGold(prev => prev + goldReward);
        enemyKilled = true;
    }

    newBoard[to.row][to.col].piece = { ...piece, hasMoved: true, tempMoveOverride: undefined };
    newBoard[from.row][from.col].piece = null;

    const destEffect = newBoard[to.row][to.col].tileEffect;
    if (destEffect === TileEffect.LAVA) {
        newBoard[to.row][to.col].piece = null; 
        selfKilled = true; 
    } else if (destEffect === TileEffect.MUD) {
        if (newBoard[to.row][to.col].piece) {
            newBoard[to.row][to.col].piece!.frozenTurns = 2;
        }
    }

    if (newBoard[to.row][to.col].piece && piece.type === PieceType.PAWN && to.row === 0) {
        newBoard[to.row][to.col].piece!.type = PieceType.QUEEN;
    }

    if (enemyKilled) {
        const necromancy = relics.find(r => r.type === RelicType.NECROMANCY);
        if (necromancy) {
            spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(necromancy.level, 5)]);
        }
    }
    if (selfKilled) {
        const lastWill = relics.find(r => r.type === RelicType.LAST_WILL);
        if (lastWill) {
             spawnRelicPiece(newBoard, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
        }
    }

    newBoard.forEach(row => row.forEach(cell => {
        if (cell.piece && cell.piece.side === Side.WHITE && (cell.piece.frozenTurns || 0) > 0) {
            cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
        }
    }));

    setBoard(newBoard);
    setLastMoveFrom(from);
    setLastMoveTo(to);
    setSelectedPiecePos(null);
    setValidMoves([]);
    // Clear enemy selection on player move
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);
    setEnPassantTarget(nextEnPassantTarget);

    if (checkWinCondition(newBoard)) {
        onWin();
        return;
    }

    if (checkLossCondition(newBoard, deck, hand)) {
        onLoss();
        return;
    }

    endPlayerTurn(newBoard, nextEnPassantTarget);
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
        piece: cell.piece ? { ...cell.piece } : null
      })));

      const size = boardCopy.length;
      const enemies: { pos: Position, piece: Piece, moves: Position[] }[] = [];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = boardCopy[r][c].piece;
          if (p?.side === Side.BLACK) {
             if ((p.frozenTurns || 0) > 0) {
             } else {
                let moves = getValidMoves(boardCopy, p, { row: r, col: c }, playerEnPassantTarget);
                if (isEnemyMoveLimited) {
                    moves = moves.filter(m => Math.abs(m.row - r) <= 1 && Math.abs(m.col - c) <= 1);
                }
                if (moves.length > 0) enemies.push({ pos: { row: r, col: c }, piece: p, moves });
             }
          }
        }
      }

      if (enemies.length === 0) {
        boardCopy.forEach(row => row.forEach(cell => {
            if (cell.piece && cell.piece.side === Side.BLACK && (cell.piece.frozenTurns || 0) > 0) {
                cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
            }
        }));

        setTurn(Side.WHITE);
        setTurnCount(c => c + 1);
        setCardsPlayed(0);
        drawCard();
        setIsEnemyMoveLimited(false);
        setEnPassantTarget(null);
        return boardCopy;
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
        const movingPiece = boardCopy[bestMove.from.row][bestMove.from.col].piece!;
        const targetPiece = boardCopy[bestMove.to.row][bestMove.to.col].piece;
        let playerPieceKilled = false;
        
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

        if (movingPiece.type === PieceType.PAWN && Math.abs(bestMove.from.row - bestMove.to.row) === 2) {
            nextEnPassantTarget = { row: (bestMove.from.row + bestMove.to.row) / 2, col: bestMove.from.col };
        }

        boardCopy[bestMove.to.row][bestMove.to.col].piece = { ...movingPiece, hasMoved: true };
        boardCopy[bestMove.from.row][bestMove.from.col].piece = null;

        const effect = boardCopy[bestMove.to.row][bestMove.to.col].tileEffect;
        if (effect === TileEffect.LAVA) {
            boardCopy[bestMove.to.row][bestMove.to.col].piece = null;
        } else if (effect === TileEffect.MUD) {
            if (boardCopy[bestMove.to.row][bestMove.to.col].piece) {
                boardCopy[bestMove.to.row][bestMove.to.col].piece!.frozenTurns = 2;
            }
        }

        if (boardCopy[bestMove.to.row][bestMove.to.col].piece && movingPiece.type === PieceType.PAWN && bestMove.to.row === size - 1) {
            boardCopy[bestMove.to.row][bestMove.to.col].piece!.type = PieceType.QUEEN;
        }

        if (playerPieceKilled) {
             const lastWill = relics.find(r => r.type === RelicType.LAST_WILL);
             if (lastWill) {
                 spawnRelicPiece(boardCopy, Side.WHITE, RELIC_LEVEL_REWARDS[Math.min(lastWill.level, 5)]);
             }
        }

        setLastMoveFrom(bestMove.from);
        setLastMoveTo(bestMove.to);
      }

      boardCopy.forEach(row => row.forEach(cell => {
          if (cell.piece && cell.piece.side === Side.BLACK && (cell.piece.frozenTurns || 0) > 0) {
              cell.piece.frozenTurns = (cell.piece.frozenTurns || 0) - 1;
          }
      }));

      setEnPassantTarget(nextEnPassantTarget);
      
      if (checkLossCondition(boardCopy, deck, hand)) {
          onLoss();
      }

      if (checkWinCondition(boardCopy)) {
          onWin();
      }

      setTurn(Side.WHITE);
      setTurnCount(c => c + 1);
      setCardsPlayed(0); 
      drawCard();
      setIsEnemyMoveLimited(false);
      return boardCopy;
    });
  };

  const handleSquareClick = (r: number, c: number) => {
    if (turn !== Side.WHITE) return;

    const clickedPiece = board[r][c].piece;
    const isSelfPiece = clickedPiece?.side === Side.WHITE;
    const isEnemyPiece = clickedPiece?.side === Side.BLACK;

    if (selectedCardId && cardTargetMode) {
      handleCardTargeting(r, c, clickedPiece);
      return;
    }

    // Check for valid move FIRST to allow capturing enemies
    const isMoveValid = validMoves.some(m => m.row === r && m.col === c);
    if (selectedPiecePos && isMoveValid) {
      executeMove(selectedPiecePos, { row: r, col: c });
      return;
    }

    if (isSelfPiece) {
      // Clear enemy selection
      setSelectedEnemyPos(null);
      setEnemyValidMoves([]);

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

    if (isEnemyPiece) {
       // Clear player selection
       setSelectedPiecePos(null);
       setValidMoves([]);

       if (selectedEnemyPos?.row === r && selectedEnemyPos?.col === c) {
           setSelectedEnemyPos(null);
           setEnemyValidMoves([]);
       } else {
           setSelectedEnemyPos({ row: r, col: c });
           // Visualize moves for enemy. Pass null for enPassantTarget as they cannot capture their own shadow
           const moves = getValidMoves(board, clickedPiece!, { row: r, col: c }, null);
           setEnemyValidMoves(moves);
       }
       return;
    }

    // Deselect everything on clicking empty non-valid space
    setSelectedPiecePos(null);
    setValidMoves([]);
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);
  };

  const handleSquareDoubleClick = (r: number, c: number) => {
      showCellInfo(r, c);
  };

  const handleCardClick = (card: Card) => {
    if (turn !== Side.WHITE) return;
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      setCardTargetMode(null);
      return;
    }

    if (cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN) {
      alert(`You have reached the maximum of ${MAX_CARDS_PLAYED_PER_TURN} cards played this turn.`);
      return;
    }

    setSelectedCardId(card.id);
    setSelectedPiecePos(null);
    setValidMoves([]);
    setSelectedEnemyPos(null);
    setEnemyValidMoves([]);

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
            newBoard[target.row][target.col].piece!.frozenTurns = 1;
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
            const cell = newBoard[r][c];
            if (cell.tileEffect === TileEffect.WALL || cell.tileEffect === TileEffect.HOLE) {
                alert("Cannot spawn on an obstacle.");
                return;
            }
            const spawnType = type.replace('SPAWN_', '') as PieceType;
            newBoard[r][c].piece = { id: uuidv4(), type: spawnType, side: Side.WHITE, hasMoved: false, frozenTurns: 0 };
            
            if (cell.tileEffect === TileEffect.MUD) {
                newBoard[r][c].piece!.frozenTurns = 2;
            }
            if (cell.tileEffect === TileEffect.LAVA) {
                newBoard[r][c].piece = null;
            }

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
        onLoss();
    }
  };

  return {
    gameState: {
      board, turn, turnCount, selectedPiecePos, validMoves, lastMoveFrom, lastMoveTo, 
      deck, hand, cardsPlayed, selectedCardId, cardTargetMode, showDeckModal, selectedRelic, infoModalContent,
      selectedEnemyPos, enemyValidMoves
    },
    actions: {
      initGame, handleSquareClick, handleSquareDoubleClick, handleCardClick, 
      setShowDeckModal, setSelectedRelic, setInfoModalContent
    }
  };
};
