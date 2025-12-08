
import { Cell, Side, PieceType, Card, CardType, TileEffect, Position, Piece } from '../../types';
import { isValidPos } from '../gameLogic';
import { soundManager } from '../soundManager';
import { v4 as uuidv4 } from 'uuid';
import { AREA_FREEZE_DURATION, ASCEND_DURATION, IMMORTAL_LONG_DURATION } from '../../constants';

interface InstantCardResult {
    newBoard: Cell[][];
    played: boolean;
    sound?: 'spawn' | 'frozen';
    error?: string;
}

export const getBoardAfterInstantCard = (
    board: Cell[][], 
    card: Card, 
    deadPieces: PieceType[],
    setDeadPieces: (p: PieceType[]) => void,
    setIsEnemyMoveLimited: (v: boolean) => void
): InstantCardResult => {
    const newBoard = board.map((row) => row.map((cell) => ({...cell, piece: cell.piece ? {...cell.piece} : null})));
    let played = false;
    let sound: 'spawn' | 'frozen' | undefined = undefined;
    let error: string | undefined = undefined;

    if (card.type === CardType.EFFECT_FREEZE) {
      const enemies: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => { if (cell.piece?.side === Side.BLACK) enemies.push({ row: r, col: c }); }));
      if (enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (newBoard[target.row][target.col].piece) {
          newBoard[target.row][target.col].piece!.frozenTurns = 1;
          played = true;
          sound = 'frozen';
        }
      }
    } else if (card.type === CardType.EFFECT_LIMIT) {
      setIsEnemyMoveLimited(true); 
      played = true; 
      sound = 'frozen';
    } else if (card.type === CardType.EFFECT_TRAP) {
      const friends: Position[] = [];
      newBoard.forEach((row, r) => row.forEach((cell, c) => { if (cell.piece?.side === Side.WHITE && !cell.piece.trapped) friends.push({ row: r, col: c }); }));
      if (friends.length > 0) {
        const target = friends[Math.floor(Math.random() * friends.length)];
        newBoard[target.row][target.col].piece!.trapped = true;
        played = true;
        sound = 'spawn';
      } else {
          error = 'No friendly pieces available.';
      }
    } else if (card.type === CardType.SPAWN_REVIVE) {
      if (deadPieces.length === 0) { 
          error = 'No dead pieces to revive!';
      } else {
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
            sound = 'spawn';
        } else {
            error = 'No space in base rows.';
        }
      }
    }

    return { newBoard, played, sound, error };
};

interface TargetCardResult {
    newBoard: Cell[][];
    success: boolean;
    sound?: 'spawn' | 'frozen' | 'move';
    error?: string;
    lastPlayerSpawnedType?: PieceType;
    nextStep?: string;
    sourcePos?: Position;
}

export const getBoardAfterTargetCard = (
    board: Cell[][],
    cardType: CardType,
    step: string,
    targetPos: Position,
    sourcePos: Position | undefined,
    clickedPiece: Piece | null
): TargetCardResult => {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
    const size = board.length;
    const { row: r, col: c } = targetPos;
    let result: TargetCardResult = { newBoard, success: false };

    if (cardType.includes('SPAWN')) {
      if (r >= size - 2 && !clickedPiece) {
        if (newBoard[r][c].tileEffect === TileEffect.WALL || newBoard[r][c].tileEffect === TileEffect.HOLE) { 
            return { newBoard, success: false, error: 'Cannot spawn on an obstacle.' };
        }
        let spawnType = PieceType.PAWN;
        let variant: 'LAVA' | 'ABYSS' | 'FROZEN' | undefined = undefined;
        if (cardType.includes('DRAGON')) {
          spawnType = PieceType.DRAGON;
          if (cardType.includes('LAVA')) variant = 'LAVA';
          if (cardType.includes('ABYSS')) variant = 'ABYSS';
          if (cardType.includes('FROZEN')) variant = 'FROZEN';
        } else {
            const map: Record<string, PieceType> = {
                'SPAWN_QUEEN': PieceType.QUEEN, 'SPAWN_ROOK': PieceType.ROOK, 'SPAWN_BISHOP': PieceType.BISHOP, 'SPAWN_KNIGHT': PieceType.KNIGHT, 'SPAWN_PAWN': PieceType.PAWN,
                'SPAWN_FOOL': PieceType.FOOL, 'SPAWN_SHIP': PieceType.SHIP, 'SPAWN_ELEPHANT': PieceType.ELEPHANT, 'SPAWN_CHANCELLOR': PieceType.CHANCELLOR,
                'SPAWN_ARCHBISHOP': PieceType.ARCHBISHOP, 'SPAWN_MANN': PieceType.MANN, 'SPAWN_AMAZON': PieceType.AMAZON, 'SPAWN_CENTAUR': PieceType.CENTAUR,
                'SPAWN_ZEBRA': PieceType.ZEBRA, 'SPAWN_CHAMPION': PieceType.CHAMPION
            };
            if (map[cardType]) spawnType = map[cardType];
        }
        newBoard[r][c].piece = { id: uuidv4(), type: spawnType, side: Side.WHITE, hasMoved: false, frozenTurns: 0, immortalTurns: 0, variant };
        if (newBoard[r][c].tileEffect === TileEffect.FROZEN) newBoard[r][c].piece!.frozenTurns = 2;
        if (newBoard[r][c].tileEffect === TileEffect.LAVA && spawnType !== PieceType.DRAGON) newBoard[r][c].piece = null;
        
        return { newBoard, success: true, sound: 'spawn', lastPlayerSpawnedType: spawnType };
      } else {
          return { newBoard, success: false, error: 'Can only spawn on empty squares in your base rows.' };
      }
    }

    if (cardType === CardType.EFFECT_BACK_BASE) {
      if (step === 'SELECT_SQUARE' && clickedPiece?.side === Side.WHITE && clickedPiece.type !== PieceType.KING) {
        let targetSpot: Position | null = null;
        const baseRows = [size - 1, size - 2];
        const center = Math.floor(size / 2);
        const cols = Array.from({ length: size }, (_, i) => i).sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
        for (let row of baseRows) {
          for (let col of cols) {
            if (!newBoard[row][col].piece && newBoard[row][col].tileEffect !== TileEffect.WALL && newBoard[row][col].tileEffect !== TileEffect.HOLE) {
              targetSpot = { row, col };
              break;
            }
          }
          if (targetSpot) break;
        }
        if (targetSpot) {
          newBoard[targetSpot.row][targetSpot.col].piece = { ...clickedPiece, hasMoved: false };
          newBoard[r][c].piece = null;
          return { newBoard, success: true, sound: 'spawn' };
        } else {
            return { newBoard, success: false, error: 'No valid empty space in base rows!' };
        }
      }
      return { newBoard, success: false };
    }

    if (cardType.includes('BORROW') && clickedPiece?.side === Side.WHITE) {
      const borrowType = cardType.replace('EFFECT_BORROW_', '') as PieceType;
      newBoard[r][c].piece = { ...clickedPiece, tempMoveOverride: borrowType };
      return { newBoard, success: true, sound: 'spawn' };
    }

    if (cardType === CardType.EFFECT_IMMORTAL && step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...clickedPiece, immortalTurns: 2 };
        return { newBoard, success: true, sound: 'spawn' };
    }
    if (cardType === CardType.EFFECT_IMMORTAL_LONG && step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...clickedPiece, immortalTurns: IMMORTAL_LONG_DURATION };
        return { newBoard, success: true, sound: 'spawn' };
    }
    if (cardType === CardType.EFFECT_MIMIC && step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE) {
        newBoard[r][c].piece = { ...clickedPiece, mimic: true };
        return { newBoard, success: true, sound: 'spawn' };
    }
    if (cardType === CardType.EFFECT_ASCEND) {
      if (step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE && clickedPiece.type === PieceType.PAWN) {
        const promotions = [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT];
        const promo = promotions[Math.floor(Math.random() * promotions.length)];
        newBoard[r][c].piece = { ...clickedPiece, type: promo, ascendedTurns: ASCEND_DURATION };
        return { newBoard, success: true, sound: 'spawn' };
      } else if (clickedPiece?.type !== PieceType.PAWN) {
          return { newBoard, success: false, error: 'Ascend can only be used on a Pawn.' };
      }
      return { newBoard, success: false };
    }
    if (cardType === CardType.EFFECT_AREA_FREEZE && step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE) {
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
      return { newBoard, success: true, sound: 'frozen' };
    }
    if (cardType === CardType.EFFECT_SWITCH) {
      if (step === 'SELECT_PIECE_1' && clickedPiece?.side === Side.WHITE) {
        return { newBoard, success: false, nextStep: 'SELECT_PIECE_2', sourcePos: { row: r, col: c } };
      } else if (step === 'SELECT_PIECE_2' && clickedPiece?.side === Side.WHITE && sourcePos) {
        const p1 = newBoard[sourcePos.row][sourcePos.col].piece;
        const p2 = clickedPiece;
        if (p1 && p2) {
          newBoard[sourcePos.row][sourcePos.col].piece = p2;
          newBoard[r][c].piece = p1;
          return { newBoard, success: true, sound: 'move' };
        }
      }
      return { newBoard, success: false };
    }

    return { newBoard, success: false };
};
