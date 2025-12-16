
import React, { useState, useEffect } from 'react';
import { GameSettings, BossType, SavedGameState } from './types';
import { MainMenu } from './components/screens/MainMenu';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { WikiScreen } from './components/screens/WikiScreen';
import { CustomGameSetup } from './components/screens/CustomGameSetup';
import { CreditsScreen } from './components/screens/CreditsScreen';
import { LoadGameScreen } from './components/screens/LoadGameScreen';
import { CampaignGame } from './components/CampaignGame';
import { CustomGame } from './components/CustomGame';
import { soundManager } from './utils/soundManager';
import { loadFromStorage, saveToStorage, STORAGE_KEYS, clearFromStorage } from './utils/storage';

type AppMode = 'MENU' | 'SETTINGS' | 'CAMPAIGN' | 'CUSTOM' | 'WIKI' | 'CUSTOM_SETUP' | 'CREDITS' | 'LOAD_GAME';

const DEFAULT_SETTINGS: GameSettings = { 
  boardSize: 8, 
  enemyCount: 10, 
  playerCount: 10,
  language: 'en',
  theme: 'CLASSIC',
  pieceSet: 'STANDARD',
  soundEnabled: false,
  soundVolume: 0.5,
  customBossType: BossType.NONE
};

export default function App() {
  const [mode, setMode] = useState<AppMode>('MENU');
  
  // Load settings from local storage using utility
  const [settings, setSettings] = useState<GameSettings>(() => {
     return loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  });

  // State to hold loaded game data to pass to CampaignGame
  const [loadedGameData, setLoadedGameData] = useState<SavedGameState | null>(null);

  // Save settings on change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Initialize sound manager with default/saved settings
  useEffect(() => {
    soundManager.init();
    soundManager.updateSettings(settings);
  }, [settings]); 

  // Stop music when returning to menu
  useEffect(() => {
    if (mode === 'MENU') {
      soundManager.stopMusic();
    }
  }, [mode]);
  
  const resetSettings = () => {
      setSettings(DEFAULT_SETTINGS);
      soundManager.playSfx('click');
  };

  const handleStartCampaignFlow = () => {
      soundManager.playSfx('click');
      setMode('LOAD_GAME');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      <main className="flex-grow flex relative overflow-hidden">
        
        {mode === 'MENU' && (
           <MainMenu 
             settings={settings}
             setSettings={setSettings}
             startCampaign={handleStartCampaignFlow}
             onCustomSetup={() => {
               soundManager.playSfx('click');
               setMode('CUSTOM_SETUP');
             }}
             onOpenSettings={() => {
               soundManager.playSfx('click');
               setMode('SETTINGS');
             }}
             onOpenWiki={() => {
               soundManager.playSfx('click');
               setMode('WIKI');
             }}
             onCredits={() => {
               soundManager.playSfx('click');
               setMode('CREDITS');
             }}
           />
        )}

        {mode === 'LOAD_GAME' && (
            <LoadGameScreen 
                settings={settings}
                onContinue={(data) => {
                    soundManager.playSfx('click');
                    setLoadedGameData(data);
                    setMode('CAMPAIGN');
                }}
                onNewGame={() => {
                    soundManager.playSfx('click');
                    clearFromStorage(STORAGE_KEYS.CAMPAIGN);
                    setLoadedGameData(null);
                    setMode('CAMPAIGN');
                }}
                onBack={() => {
                    soundManager.playSfx('click');
                    setMode('MENU');
                }}
            />
        )}

        {mode === 'CUSTOM_SETUP' && (
            <CustomGameSetup 
              settings={settings}
              setSettings={setSettings}
              onStart={() => {
                  soundManager.playSfx('click');
                  setMode('CUSTOM');
              }}
              onBack={() => {
                  soundManager.playSfx('click');
                  setMode('MENU');
              }}
            />
        )}

        {mode === 'SETTINGS' && (
           <SettingsScreen 
             settings={settings}
             setSettings={setSettings}
             onBack={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
             onReset={resetSettings}
           />
        )}

        {mode === 'WIKI' && (
           <WikiScreen 
             settings={settings}
             onBack={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
           />
        )}

        {mode === 'CREDITS' && (
           <CreditsScreen 
             settings={settings}
             onBack={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
           />
        )}

        {mode === 'CAMPAIGN' && (
           <CampaignGame 
             settings={settings}
             setSettings={setSettings}
             initialSaveData={loadedGameData}
             onExit={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
           />
        )}

        {mode === 'CUSTOM' && (
           <CustomGame 
             settings={settings}
             setSettings={setSettings}
             onExit={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
           />
        )}

      </main>
    </div>
  );
}