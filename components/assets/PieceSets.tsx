
import React from 'react';
import { PieceSetId, PieceType, Side } from '../../types';

// --- STANDARD SET ---

const StandardWhiteKing = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" stroke="black"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="white" stroke="black"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12H13.5c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7" fill="white" stroke="black"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" stroke="black"/>
    </g>
  </svg>
);

const StandardBlackKing = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" stroke="white"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="black" stroke="white"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12H13.5c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7" fill="black" stroke="white"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" stroke="white"/>
    </g>
  </svg>
);

const StandardWhiteQueen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
      <g stroke="none">
        <circle cx="6" cy="12" r="2.75" fill="white" stroke="black" strokeWidth="1.5"/>
        <circle cx="14" cy="9" r="2.75" fill="white" stroke="black" strokeWidth="1.5"/>
        <circle cx="22.5" cy="8" r="2.75" fill="white" stroke="black" strokeWidth="1.5"/>
        <circle cx="31" cy="9" r="2.75" fill="white" stroke="black" strokeWidth="1.5"/>
        <circle cx="39" cy="12" r="2.75" fill="white" stroke="black" strokeWidth="1.5"/>
      </g>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14.5V25l-7-11 2 12zM11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="white" stroke="black"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0" fill="white" stroke="black"/>
    </g>
  </svg>
);

const StandardBlackQueen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
      <g stroke="none">
        <circle cx="6" cy="12" r="2.75" fill="black" stroke="white" strokeWidth="1.5"/>
        <circle cx="14" cy="9" r="2.75" fill="black" stroke="white" strokeWidth="1.5"/>
        <circle cx="22.5" cy="8" r="2.75" fill="black" stroke="white" strokeWidth="1.5"/>
        <circle cx="31" cy="9" r="2.75" fill="black" stroke="white" strokeWidth="1.5"/>
        <circle cx="39" cy="12" r="2.75" fill="black" stroke="white" strokeWidth="1.5"/>
      </g>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14.5V25l-7-11 2 12zM11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="black" stroke="white"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0" fill="black" stroke="white"/>
    </g>
  </svg>
);

const StandardWhiteRook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" fill="white" stroke="black"/>
        <path d="M34 14l-3 3H14l-3-3" fill="white" stroke="black"/>
        <path d="M31 17v12.5c0 2.857-2.243 5.357-5 5.357h-7c-2.757 0-5-2.5-5-5.357V17" fill="white" stroke="black"/>
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill="white" stroke="black"/>
        <path d="M11 14h23" fill="none" stroke="black" strokeLinejoin="miter" />
    </g>
  </svg>
);

const StandardBlackRook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
    <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" fill="black" stroke="white"/>
        <path d="M34 14l-3 3H14l-3-3" fill="black" stroke="white"/>
        <path d="M31 17v12.5c0 2.857-2.243 5.357-5 5.357h-7c-2.757 0-5-2.5-5-5.357V17" fill="black" stroke="white"/>
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill="black" stroke="white"/>
        <path d="M11 14h23" fill="none" stroke="white" strokeLinejoin="miter" />
    </g>
  </svg>
);

const StandardWhiteBishop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <g fill="white" stroke="black" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 9.108-4.36 5.37-11.45C9.64 22.45 15 9 22.5 9c7.5 0 12.86 13.45 8.13 15.55C26.892 31.64 32.61 35.03 36 36" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="black" strokeLinejoin="miter" fill="none"/>
      </g>
  </svg>
);

const StandardBlackBishop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <g fill="black" stroke="white" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 9.108-4.36 5.37-11.45C9.64 22.45 15 9 22.5 9c7.5 0 12.86 13.45 8.13 15.55C26.892 31.64 32.61 35.03 36 36" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="white" strokeLinejoin="miter" fill="none"/>
      </g>
  </svg>
);

const StandardWhiteKnight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="white" stroke="black"/>
        <path d="M24 18c.38 2.32-2.43 2.65-1.97 5.03C20.48 24.32 25.53 24 25.53 24v-8.7z" fill="white" stroke="black"/>
        <path d="M15.13 38.67C12.3 35.58 10.9 30 15 23.95c1.3-3.66 4.67-4.16 4.67-4.16" fill="white" stroke="black"/>
        <g fill="white" stroke="none">
          <circle cx="21" cy="14" r="1.5" fill="black"/>
          <circle cx="27" cy="12" r="1.5" fill="black"/>
        </g>
      </g>
  </svg>
);

const StandardBlackKnight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="black" stroke="white"/>
        <path d="M24 18c.38 2.32-2.43 2.65-1.97 5.03C20.48 24.32 25.53 24 25.53 24v-8.7z" fill="black" stroke="white"/>
        <path d="M15.13 38.67C12.3 35.58 10.9 30 15 23.95c1.3-3.66 4.67-4.16 4.67-4.16" fill="black" stroke="white"/>
        <g fill="black" stroke="none">
          <circle cx="21" cy="14" r="1.5" fill="white"/>
          <circle cx="27" cy="12" r="1.5" fill="white"/>
        </g>
      </g>
  </svg>
);

const StandardWhitePawn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="white" stroke="black" strokeLinecap="round" />
  </svg>
);

const StandardBlackPawn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" className="w-full h-full fill-black stroke-white stroke-[1.5]">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="black" stroke="white" strokeLinecap="round" />
  </svg>
);

// --- SIMPLE SET (Minimalist) ---

const SimpleWhiteKing = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♔</text></svg>;
const SimpleBlackKing = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♚</text></svg>;
const SimpleWhiteQueen = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♕</text></svg>;
const SimpleBlackQueen = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♛</text></svg>;
const SimpleWhiteRook = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♖</text></svg>;
const SimpleBlackRook = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♜</text></svg>;
const SimpleWhiteBishop = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♗</text></svg>;
const SimpleBlackBishop = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♝</text></svg>;
const SimpleWhiteKnight = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♘</text></svg>;
const SimpleBlackKnight = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♞</text></svg>;
const SimpleWhitePawn = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="white" stroke="black" strokeWidth="1">♙</text></svg>;
const SimpleBlackPawn = () => <svg viewBox="0 0 45 45"><text x="50%" y="70%" fontSize="30" textAnchor="middle" fill="black" stroke="white" strokeWidth="1">♟︎</text></svg>;


export const PIECE_SETS = {
  STANDARD: {
    [Side.WHITE]: {
      [PieceType.KING]: <StandardWhiteKing />,
      [PieceType.QUEEN]: <StandardWhiteQueen />,
      [PieceType.ROOK]: <StandardWhiteRook />,
      [PieceType.BISHOP]: <StandardWhiteBishop />,
      [PieceType.KNIGHT]: <StandardWhiteKnight />,
      [PieceType.PAWN]: <StandardWhitePawn />,
    },
    [Side.BLACK]: {
      [PieceType.KING]: <StandardBlackKing />,
      [PieceType.QUEEN]: <StandardBlackQueen />,
      [PieceType.ROOK]: <StandardBlackRook />,
      [PieceType.BISHOP]: <StandardBlackBishop />,
      [PieceType.KNIGHT]: <StandardBlackKnight />,
      [PieceType.PAWN]: <StandardBlackPawn />,
    }
  },
  SIMPLE: {
    [Side.WHITE]: {
      [PieceType.KING]: <SimpleWhiteKing />,
      [PieceType.QUEEN]: <SimpleWhiteQueen />,
      [PieceType.ROOK]: <SimpleWhiteRook />,
      [PieceType.BISHOP]: <SimpleWhiteBishop />,
      [PieceType.KNIGHT]: <SimpleWhiteKnight />,
      [PieceType.PAWN]: <SimpleWhitePawn />,
    },
    [Side.BLACK]: {
      [PieceType.KING]: <SimpleBlackKing />,
      [PieceType.QUEEN]: <SimpleBlackQueen />,
      [PieceType.ROOK]: <SimpleBlackRook />,
      [PieceType.BISHOP]: <SimpleBlackBishop />,
      [PieceType.KNIGHT]: <SimpleBlackKnight />,
      [PieceType.PAWN]: <SimpleBlackPawn />,
    }
  }
};

export const getPieceIcon = (set: PieceSetId, side: Side, type: PieceType): React.ReactNode => {
  return PIECE_SETS[set][side][type];
};
