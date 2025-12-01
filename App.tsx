
import React, { useState, useEffect } from 'react';
import { GameSettings } from './types';
import { MainMenu } from './components/screens/MainMenu';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { CampaignGame } from './components/CampaignGame';
import { CustomGame } from './components/CustomGame';
import { soundManager } from './utils/soundManager';

type AppMode = 'MENU' | 'SETTINGS' | 'CAMPAIGN' | 'CUSTOM';

export default function App() {
  const [mode, setMode] = useState<AppMode>('MENU');
  const [settings, setSettings] = useState<GameSettings>({ 
    boardSize: 8, 
    enemyCount: 10, 
    playerCount: 10,
    language: 'en',
    theme: 'CLASSIC',
    pieceSet: 'STANDARD',
    soundEnabled: true,
    soundVolume: 0.5
  });

  // Initialize sound manager with default/saved settings
  useEffect(() => {
    soundManager.init();
    soundManager.updateSettings(settings);
  }, []);

  // Stop music when returning to menu
  useEffect(() => {
    if (mode === 'MENU') {
      soundManager.stopMusic();
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      <main className="flex-grow flex relative overflow-hidden">
        
        {mode === 'MENU' && (
           <MainMenu 
             settings={settings}
             setSettings={setSettings}
             startCampaign={() => {
               soundManager.playSfx('click');
               setMode('CAMPAIGN');
             }}
             initGame={() => {
               soundManager.playSfx('click');
               setMode('CUSTOM');
             }}
             onOpenSettings={() => {
               soundManager.playSfx('click');
               setMode('SETTINGS');
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
           />
        )}

        {mode === 'CAMPAIGN' && (
           <CampaignGame 
             settings={settings}
             onExit={() => {
               soundManager.playSfx('click');
               setMode('MENU');
             }}
           />
        )}

        {mode === 'CUSTOM' && (
           <CustomGame 
             settings={settings}
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
