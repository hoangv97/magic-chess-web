
import React, { useMemo } from 'react';
import { GameSettings, PieceType, Side, TileEffect } from '../../types';
import { GameBoard } from '../game/GameBoard';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';
import { generateBoard } from '../../utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

interface PiecePreviewModalProps {
  settings: GameSettings;
  onClose: () => void;
}

export const PiecePreviewModal: React.FC<PiecePreviewModalProps> = ({ settings, onClose }) => {
  const t = TRANSLATIONS[settings.language].modals.info;
  const tSettings = TRANSLATIONS[settings.language].settings;

  const previewBoard = useMemo(() => {
    const size = 8;
    const board = generateBoard(size);
    
    // Add Special Tiles in the middle (Single Row)
    const specialTiles = [TileEffect.HOLE, TileEffect.WALL, TileEffect.FROZEN, TileEffect.LAVA];
    const startCol = 2;

    // Row 3
    specialTiles.forEach((effect, i) => {
        if (board[3][startCol + i]) board[3][startCol + i].tileEffect = effect;
    });

    const pieceTypes = Object.values(PieceType);
    
    pieceTypes.forEach((type, index) => {
        // Place Black Pieces (Top)
        const bRow = Math.floor(index / size);
        const bCol = index % size;
        if (bRow < size) {
            board[bRow][bCol].piece = {
                id: uuidv4(),
                type: type,
                side: Side.BLACK,
                hasMoved: false
            };
        }

        // Place White Pieces (Bottom)
        const wRow = size - 1 - Math.floor(index / size);
        const wCol = index % size;
        if (wRow >= 0) {
            board[wRow][wCol].piece = {
                id: uuidv4(),
                type: type,
                side: Side.WHITE,
                hasMoved: false
            };
        }
    });

    return board;
  }, []);

  return (
    <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-4 w-full max-w-4xl shadow-2xl relative flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Preview</h2>
            <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
                {t.close}
            </Button>
        </div>
        
        <div className="flex-grow overflow-hidden flex items-center justify-center bg-black/20 rounded-lg border border-slate-700">
             <div className="scale-75 sm:scale-100 origin-center">
                <GameBoard 
                    board={previewBoard}
                    selectedPiecePos={null}
                    validMoves={[]}
                    lastMoveFrom={null}
                    lastMoveTo={null}
                    onSquareClick={() => {}}
                    onSquareDoubleClick={() => {}}
                    selectedCardId={null}
                    cardTargetMode={null}
                    settings={{...settings, boardSize: 8}} // Force 8x8 for optimal preview density
                    selectedEnemyPos={null}
                    enemyValidMoves={[]}
                    turnCount={0}
                />
             </div>
        </div>
        
        <div className="mt-4 text-center text-slate-400 text-xs shrink-0">
            {tSettings.theme}: <span className="text-yellow-400">{tSettings.themes[settings.theme]}</span> • {tSettings.pieceSet}: <span className="text-blue-400">{tSettings.pieceSets[settings.pieceSet]}</span>
        </div>
      </div>
    </div>
  );
};
