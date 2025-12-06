
import React, { useState, useEffect } from 'react';
import { GameSettings, GamePhase } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameScreen } from './screens/GameScreen';
import { GameOver } from './screens/GameOver';
import { SettingsScreen } from './screens/SettingsScreen';

interface CustomGameProps {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  onExit: () => void;
}

export const CustomGame: React.FC<CustomGameProps> = ({ settings, setSettings, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('PLAYING');
  const [gold, setGold] = useState(0); // Dummy state for hook
  const [showSettings, setShowSettings] = useState(false);

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

  const showGameScreen = phase === 'PLAYING' || phase === 'GAME_OVER_WIN' || phase === 'GAME_OVER_LOSS';

  return (
    <>
      {showGameScreen && (
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
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      <GameOver 
          phase={phase}
          isCampaign={false}
          onMainMenu={onExit}
          onRestartCampaign={() => {}}
          settings={settings}
      />

      {showSettings && (
        <SettingsScreen 
          settings={settings} 
          setSettings={setSettings} 
          onBack={() => setShowSettings(false)} 
        />
      )}
    </>
  );
};
