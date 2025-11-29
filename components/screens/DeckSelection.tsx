
import React from 'react';
import { getDeckTemplate, getStarterDecks } from '../../constants';
import { TRANSLATIONS } from '../../utils/locales';
import { GameSettings } from '../../types';

interface DeckSelectionProps {
  onSelectDeck: (index: number) => void;
  settings: GameSettings;
}

export const DeckSelection: React.FC<DeckSelectionProps> = ({ onSelectDeck, settings }) => {
  const t = TRANSLATIONS[settings.language].deckSelection;
  const decks = getStarterDecks(settings.language);
  const template = getDeckTemplate(settings.language);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900">
       <h2 className="text-3xl font-bold mb-2 text-white">{t.title}</h2>
       <p className="text-slate-400 mb-8">{t.desc}</p>
       <div className="flex flex-wrap gap-6 justify-center">
          {decks.map((starter, idx) => (
            <div key={idx} 
                 onClick={() => onSelectDeck(idx)}
                 className="w-64 bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 hover:scale-105 transition-all cursor-pointer rounded-xl p-6 flex flex-col shadow-xl">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{starter.name}</h3>
                <p className="text-sm text-slate-300 mb-4 h-10">{starter.description}</p>
                <div className="space-y-1 bg-slate-900/50 p-2 rounded">
                  {starter.cards.map((c, i) => (
                     <div key={i} className="text-xs text-slate-400 flex items-center">
                        <span className="mr-2 text-yellow-600">▪</span> 
                        {template.find(t => t.type === c)?.title}
                     </div>
                  ))}
                </div>
            </div>
          ))}
       </div>
    </div>
  );
};
