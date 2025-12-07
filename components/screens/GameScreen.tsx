
import React from 'react';
import { GameHeader } from '../game/GameHeader';
import { GameBoard } from '../game/GameBoard';
import { PlayerHand } from '../game/PlayerHand';
import { DeckModal } from '../modals/DeckModal';
import { RelicDetailModal } from '../modals/RelicDetailModal';
import { InfoModal } from '../modals/InfoModal';
import { MapModal } from '../modals/MapModal';
import { GameSettings, Relic, MapNode } from '../../types';

interface GameScreenProps {
  settings: GameSettings;
  gameState: any; // Type inferred from useGameLogic return
  actions: any;
  isCampaign: boolean;
  campaignLevel: number;
  relics: Relic[];
  gold: number;
  mapNodes: MapNode[];
  currentMapNodeId: string | null;
  completedMapNodeIds: string[];
  showMapModal: boolean;
  onOpenMap: () => void;
  onCloseMap: () => void;
  onResign: () => void;
  onSellRelic: (relic: Relic) => void;
  onOpenSettings: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  settings, gameState, actions, isCampaign, campaignLevel, relics, gold,
  mapNodes, currentMapNodeId, completedMapNodeIds, showMapModal, onOpenMap, onCloseMap, onResign, onSellRelic, onOpenSettings
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      <GameHeader 
        phase="PLAYING"
        isCampaign={isCampaign}
        campaignLevel={campaignLevel}
        relics={relics}
        gold={gold}
        turnCount={gameState.turnCount}
        cardsPlayed={gameState.cardsPlayed}
        onResign={onResign}
        onRelicClick={actions.setSelectedRelic}
        onOpenMap={onOpenMap}
        settings={settings}
        onOpenSettings={onOpenSettings}
      />

      <GameBoard 
        board={gameState.board}
        selectedPiecePos={gameState.selectedPiecePos}
        validMoves={gameState.validMoves}
        lastMoveFrom={gameState.lastMoveFrom}
        lastMoveTo={gameState.lastMoveTo}
        onSquareClick={actions.handleSquareClick}
        onSquareDoubleClick={actions.handleSquareDoubleClick}
        selectedCardId={gameState.selectedCardId}
        cardTargetMode={gameState.cardTargetMode}
        settings={settings}
        selectedEnemyPos={gameState.selectedEnemyPos}
        enemyValidMoves={gameState.enemyValidMoves}
        checkState={gameState.checkState}
        activeBoss={gameState.activeBoss}
        turnCount={gameState.turnCount}
      />

      <PlayerHand 
        hand={gameState.hand}
        deckCount={gameState.deck.length}
        selectedCardId={gameState.selectedCardId}
        turn={gameState.turn}
        cardsPlayed={gameState.cardsPlayed}
        onCardClick={actions.handleCardClick}
        onDeckClick={() => actions.setShowDeckModal(true)}
        settings={settings}
        activeBoss={gameState.activeBoss}
      />

      {gameState.showDeckModal && (
          <DeckModal 
            deck={gameState.deck} 
            onClose={() => actions.setShowDeckModal(false)} 
            activeBoss={gameState.activeBoss}
            pieceSet={settings.pieceSet}
          />
      )}

      {gameState.selectedRelic && (
          <RelicDetailModal 
            relic={gameState.selectedRelic} 
            onClose={() => actions.setSelectedRelic(null)}
            onSell={onSellRelic}
            settings={settings}
          />
      )}
      
      {showMapModal && (
        <MapModal 
          mapNodes={mapNodes}
          currentNodeId={currentMapNodeId}
          completedNodes={completedMapNodeIds}
          onNodeSelect={() => {}} 
          onClose={onCloseMap}
          isReadOnly={true}
          settings={settings}
        />
      )}

      {gameState.infoModalContent && (
        <InfoModal 
          title={gameState.infoModalContent.title}
          content={gameState.infoModalContent.content}
          onClose={() => actions.setInfoModalContent(null)}
        />
      )}
    </div>
  );
};
