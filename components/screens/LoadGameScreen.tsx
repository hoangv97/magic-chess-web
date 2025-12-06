
import React, { useEffect, useState } from 'react';
import { SavedGameState, GameSettings } from '../../types';
import { Button } from '../ui/Button';
import { loadFromStorage, clearFromStorage, STORAGE_KEYS } from '../../utils/storage';
import { TRANSLATIONS } from '../../utils/locales';

interface LoadGameScreenProps {
  settings: GameSettings;
  onContinue: (saveData: SavedGameState) => void;
  onNewGame: () => void;
  onBack: () => void;
}

export const LoadGameScreen: React.FC<LoadGameScreenProps> = ({ settings, onContinue, onNewGame, onBack }) => {
  const [saveData, setSaveData] = useState<SavedGameState | null>(null);

  useEffect(() => {
    const data = loadFromStorage<SavedGameState | null>(STORAGE_KEYS.CAMPAIGN, null);
    setSaveData(data);
  }, []);

  const handleDelete = () => {
    // if (confirm("Are you sure you want to delete all campaign progress? This cannot be undone.")) {
      clearFromStorage(STORAGE_KEYS.CAMPAIGN);
      setSaveData(null);
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full p-8 bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700 text-center">
        <h2 className="text-3xl font-black mb-8 text-white tracking-tighter uppercase">Campaign Mode</h2>
        
        {saveData ? (
          <div className="mb-8 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
             <h3 className="text-xl font-bold text-yellow-400 mb-2">Saved Game Found</h3>
             <p className="text-slate-300">Level: {saveData.campaignLevel}</p>
             <p className="text-slate-300">Gold: {saveData.gold}</p>
             <p className="text-slate-300">Deck Size: {saveData.masterDeck.length}</p>
             <p className="text-slate-400 text-xs mt-2 italic">Progress is saved at the start of each node.</p>
          </div>
        ) : (
          <div className="mb-8 p-4 text-slate-500 italic border border-slate-700/50 rounded-lg">
            No saved game found.
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button 
            disabled={!saveData}
            onClick={() => saveData && onContinue(saveData)} 
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 text-lg shadow-lg shadow-green-900/50"
          >
            Continue Campaign
          </Button>

          <Button 
            onClick={() => {
                if (saveData) {
                    if (confirm("Starting a new game will overwrite your current save. Continue?")) {
                        onNewGame();
                    }
                } else {
                    onNewGame();
                }
            }} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3"
          >
            New Campaign
          </Button>

          {saveData && (
             <Button onClick={handleDelete} className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800 py-2 text-sm">
               Clear Saved Data
             </Button>
          )}

          <Button onClick={onBack} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 mt-4">
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
