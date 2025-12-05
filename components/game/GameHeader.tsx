
import React from 'react';
import { GamePhase, Relic, GameSettings } from '../../types';
import { getRelicInfo, MAX_CARDS_PLAYED_PER_TURN } from '../../constants';
import { Button } from '../ui/Button';
import { TRANSLATIONS } from '../../utils/locales';

interface GameHeaderProps {
  phase: GamePhase;
  isCampaign: boolean;
  campaignLevel: number;
  relics: Relic[];
  gold: number;
  turnCount: number;
  cardsPlayed: number;
  onResign: () => void;
  onRelicClick: (relic: Relic) => void;
  onOpenMap: () => void;
  settings: GameSettings;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  phase, isCampaign, campaignLevel, relics, gold, turnCount, cardsPlayed, onResign, onRelicClick, onOpenMap, settings 
}) => {
  const t = TRANSLATIONS[settings.language].header;
  const title = TRANSLATIONS[settings.language].mainMenu.title;

  return (
    <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg z-10 shrink-0">
      <div>
         <h1 className="max-sm:hidden text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
           {title}
         </h1>
         {isCampaign && <p className="max-sm:hidden text-xs text-yellow-500 font-bold tracking-widest">{t.campaignLevel} {campaignLevel}</p>}
      </div>
      
      {['PLAYING', 'SHOP', 'REWARD', 'MAP'].includes(phase) ? (
        <div className="flex gap-4 items-center">
          {/* Relics Bar */}
          {relics.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-lg border border-slate-600">
                  {relics.map((r, i) => (
                      <div key={i} className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => onRelicClick(r)}>
                          <span className="text-2xl">{getRelicInfo(settings.language, r.type).icon}</span>
                          <span className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-500 font-bold">
                              {r.level}
                          </span>
                      </div>
                  ))}
              </div>
          )}

          <div className="text-center">
             <span className="block text-[10px] uppercase text-slate-500">{t.treasury}</span>
             <span className="font-bold text-yellow-400">💰 {gold}</span>
          </div>
          {phase === 'PLAYING' && (
            <>
              <div className="text-center hidden">
                 <span className="block text-[10px] uppercase text-slate-500">{t.played}</span>
                 <span className={`font-bold ${cardsPlayed >= MAX_CARDS_PLAYED_PER_TURN ? 'text-red-500' : 'text-white'}`}>{cardsPlayed}/{MAX_CARDS_PLAYED_PER_TURN}</span>
              </div>
              <div className="text-center">
                 <span className="block text-[10px] uppercase text-slate-500">{t.turns}</span>
                 <span className={`font-bold text-white`}>{turnCount}</span>
              </div>
              
              {isCampaign && (
                <Button className="bg-slate-700 hover:bg-slate-600 text-xs px-3" onClick={onOpenMap}>
                   🗺️
                </Button>
              )}
              
            </>
          )}
          <Button className="bg-red-900/50 hover:bg-red-800 text-xs border border-red-700" onClick={onResign}>{t.resign}</Button>
        </div>
      ) : null}
    </header>
  );
};
