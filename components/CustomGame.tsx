
import React, { useState, useEffect } from 'react';
import { GameSettings, GamePhase } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameScreen } from './screens/GameScreen';
import { GameOver } from './screens/GameOver';

interface CustomGameProps {
  settings: GameSettings;
  onExit: () => void;
}

export const CustomGame: React.FC<CustomGameProps> = ({ settings, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('PLAYING');
  const [gold, setGold] = useState(0); // Dummy state for hook

  const { gameState, actions } = useGameLogic({
    settings,
    isCampaign: false,
    relics: [],
    setGold,
    onWin: () => setPhase('GAME_OVER_WIN'),
    onLoss: () => setPhase('GAME_OVER_LOSS')
  });

  useEffect(() => {
    actions.initGame(false);
  }, []);

  return (
    <>
      <GameOver 
          phase={phase}
          isCampaign={false}
          onMainMenu={onExit}
          onRestartCampaign={() => {}}
          settings={settings}
      />

      {phase === 'PLAYING' && (
        <GameScreen 
          settings={settings}
          gameState={gameState}
          actions={actions}
          isCampaign={false}
          campaignLevel={0}
          relics={[]}
          gold={gold}
          mapNodes={[]}
          currentMapNodeId={null}
          completedMapNodeIds={[]}
          showMapModal={false}
          onOpenMap={() => {}}
          onCloseMap={() => {}}
          onResign={onExit}
          onSellRelic={() => {}}
        />
      )}
    </>
  );
};
