
import React from 'react';
import { PieceSetId, PieceType, Side } from '../../types';
import { STANDARD_PIECE_SET } from './StandardPieceSet';

export const PIECE_SETS = {
  STANDARD: STANDARD_PIECE_SET,
};

export const getPieceIcon = (set: PieceSetId, side: Side, type: PieceType): React.ReactNode => {
  return PIECE_SETS[set][side][type];
};