import React from 'react';
import { GamePhase, Relic } from '../../types';
import { RELIC_INFO } from '../../constants';
import { Button } from '../ui/Button';

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
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  phase, isCampaign, campaignLevel, relics, gold, turnCount, cardsPlayed, onResign, onRelicClick 
}) => {
  return (
    <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg z-10 shrink-0">
      <div>
         <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
           CHESS EVOLUTION
         </h1>
         {isCampaign && <p className="text-xs text-yellow-500 font-bold tracking-widest">CAMPAIGN LEVEL {campaignLevel}</p>}
      </div>
      
      {phase === 'PLAYING' || phase === 'SHOP' || phase === 'REWARD' ? (
        <div className="flex gap-4 items-center">
          {/* Relics Bar */}
          {relics.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded-lg border border-slate-600">
                  {relics.map((r, i) => (
                      <div key={i} className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => onRelicClick(r)}>
                          <span className="text-2xl">{RELIC_INFO[r.type].icon}</span>
                          <span className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-500 font-bold">
                              {r.level}
                          </span>
                      </div>
                  ))}
              </div>
          )}

          <div className="text-center px-4 py-1 bg-slate-700 rounded-lg border border-slate-600">
             <span className="block text-[10px] uppercase text-slate-400">Treasury</span>
             <span className="font-bold text-yellow-400 text-lg">💰 {gold}</span>
          </div>
          {phase === 'PLAYING' && (
            <>
              <div className="text-center">
                 <span className="block text-[10px] uppercase text-slate-500">Played</span>
                 <span className={`font-bold ${cardsPlayed >= 3 ? 'text-red-500' : 'text-white'}`}>{cardsPlayed}/3</span>
              </div>
              <div className="text-center">
                 <span className="block text-[10px] uppercase text-slate-500">Turns</span>
                 <span className={`font-bold text-white`}>{turnCount}</span>
              </div>
              <Button className="bg-red-900/50 hover:bg-red-800 text-xs border border-red-700" onClick={onResign}>Resign</Button>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
};