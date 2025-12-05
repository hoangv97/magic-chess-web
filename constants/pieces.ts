
import { PieceType } from '../types';

export const LEGEND_PIECE_POOL = [
  PieceType.ELEPHANT,
  PieceType.ZEBRA,
  PieceType.FOOL,
  PieceType.SHIP,
  PieceType.CHANCELLOR,
  PieceType.ARCHBISHOP,
  PieceType.MANN,
  PieceType.AMAZON,
  PieceType.CENTAUR,
  PieceType.CHAMPION,
  PieceType.DRAGON
];

export const PIECE_GOLD_VALUES: Record<PieceType, number> = {
  [PieceType.KING]: 100,
  [PieceType.QUEEN]: 50,
  [PieceType.BISHOP]: 25,
  [PieceType.KNIGHT]: 20,
  [PieceType.ROOK]: 15,
  [PieceType.PAWN]: 10,
  [PieceType.ELEPHANT]: 20,
  [PieceType.GIRAFFE]: 25,
  [PieceType.UNICORN]: 30,
  [PieceType.ZEBRA]: 25,
  [PieceType.MANN]: 20,
  [PieceType.CENTAUR]: 35,
  [PieceType.COMMONER]: 15,
  [PieceType.CHAMPION]: 40,
  [PieceType.WIZARD]: 35,
  [PieceType.FOOL]: 15,
  [PieceType.ARCHBISHOP]: 50,
  [PieceType.CHANCELLOR]: 50,
  [PieceType.AMAZON]: 75,
  [PieceType.DRAGON]: 60,
  [PieceType.SHIP]: 30,
};
