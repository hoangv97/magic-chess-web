
import React, { useState } from 'react';
import { GameSettings } from './types';
import { MainMenu } from './components/screens/MainMenu';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { CampaignGame } from './components/CampaignGame';
import { CustomGame } from './components/CustomGame';

type AppMode = 'MENU' | 'SETTINGS' | 'CAMPAIGN' | 'CUSTOM';

export default function App() {
  const [mode, setMode] = useState<AppMode>('MENU');
  const [settings, setSettings] = useState<GameSettings>({ 
    boardSize: 8, 
    enemyCount: 10, 
    playerCount: 10,
    language: 'en',
    theme: 'CLASSIC',
    pieceSet: 'STANDARD'
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col overflow-hidden">
      <main className="flex-grow flex relative overflow-hidden">
        
        {mode === 'MENU' && (
           <MainMenu 
             settings={settings}
             setSettings={setSettings}
             startCampaign={() => setMode('CAMPAIGN')}
             initGame={() => setMode('CUSTOM')}
             onOpenSettings={() => setMode('SETTINGS')}
           />
        )}

        {mode === 'SETTINGS' && (
           <SettingsScreen 
             settings={settings}
             setSettings={setSettings}
             onBack={() => setMode('MENU')}
           />
        )}

        {mode === 'CAMPAIGN' && (
           <CampaignGame 
             settings={settings}
             onExit={() => setMode('MENU')}
           />
        )}

        {mode === 'CUSTOM' && (
           <CustomGame 
             settings={settings}
             onExit={() => setMode('MENU')}
           />
        )}

      </main>
    </div>
  );
}
