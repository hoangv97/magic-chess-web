
import React, { useState } from 'react';
import { GameSettings, CardType, BossType, RelicType, TileEffect } from '../../types';
import { TRANSLATIONS } from '../../utils/locales';
import { getDeckTemplate, getRelicInfo, getTileEffectInfo, getBossIcon, getTileVisuals } from '../../constants';
import { Button } from '../ui/Button';
import { CardComponent } from '../ui/CardComponent';

interface WikiScreenProps {
  settings: GameSettings;
  onBack: () => void;
}

export const WikiScreen: React.FC<WikiScreenProps> = ({ settings, onBack }) => {
  const t = TRANSLATIONS[settings.language].wiki;
  const [activeTab, setActiveTab] = useState<'RULES' | 'CARDS' | 'BOSSES' | 'RELICS' | 'TERRAIN'>('RULES');

  const deckTemplate = getDeckTemplate(settings.language);

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => {
    let count = undefined;
    if (id === 'CARDS') {
      count = Object.values(CardType).length;
    } else if (id === 'BOSSES') {
      count = Object.values(BossType).filter(b => b !== BossType.NONE).length;
    } else if (id === 'RELICS') {
      count = Object.values(RelicType).length;
    } else if (id === 'TERRAIN') {
      count = Object.values(TileEffect).length;
    }
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 font-bold transition-all border-b-4 ${
          activeTab === id 
            ? 'border-yellow-400 text-yellow-400' 
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        {label} {count ? `(${count})` : ''}
      </button>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center">
      <div className="w-full max-w-5xl h-full flex flex-col p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-tighter">
            {t.title}
          </h2>
          <Button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6">
            {TRANSLATIONS[settings.language].settings.back}
          </Button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto shrink-0">
          <TabButton id="RULES" label={t.tabs.rules} />
          <TabButton id="CARDS" label={t.tabs.cards} />
          <TabButton id="BOSSES" label={t.tabs.bosses} />
          <TabButton id="RELICS" label={t.tabs.relics} />
          <TabButton id="TERRAIN" label={t.tabs.terrain} />
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-inner">
          
          {activeTab === 'RULES' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              {Object.values(t.rules).map((rule: any, idx) => (
                <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-600 shadow-lg">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">{rule.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'CARDS' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
              {Object.values(CardType).map((type) => {
                const template = deckTemplate.find(c => c.type === type);
                if (!template) return null;
                // Construct a dummy card for display
                const dummyCard = { ...template, id: 'wiki', title: template.title, description: template.description };
                
                return (
                  <div key={type} className="scale-100 hover:scale-110 transition-transform">
                    <CardComponent 
                      card={dummyCard as any} 
                      selected={false} 
                      disabled={false} 
                      onClick={() => {}} 
                      showCost={true}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'BOSSES' && (
            <div className="grid md:grid-cols-2 gap-6">
              {Object.values(BossType).filter(b => b !== BossType.NONE).map((type) => {
                const info = TRANSLATIONS[settings.language].bosses[type];
                return (
                  <div key={type} className="bg-slate-800 p-6 rounded-lg border border-red-900/50 shadow-lg flex flex-col gap-2 relative overflow-hidden group hover:border-red-500 transition-colors">
                    <div className="absolute -right-4 -top-4 text-9xl opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      {getBossIcon(type)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getBossIcon(type)}</div>
                      <h3 className="text-2xl font-bold text-red-400">{info.name}</h3>
                    </div>
                    <p className="text-slate-400 italic mb-2">{info.desc}</p>
                    <div className="mt-auto pt-4 border-t border-slate-700">
                      <span className="text-xs font-bold bg-red-900 text-red-100 px-2 py-1 rounded">ABILITY</span>
                      <p className="text-sm text-slate-300 mt-2">{'ability' in info ? info.ability : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'RELICS' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(RelicType).map((type) => {
                const info = getRelicInfo(settings.language, type);
                return (
                  <div key={type} className="bg-slate-800 p-6 rounded-lg border border-purple-500/30 shadow-lg flex items-start gap-4 hover:bg-slate-700/50 transition-colors">
                    <div className="text-5xl bg-slate-900 p-2 rounded-lg border border-slate-700">{info.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-300">{info.name}</h3>
                      <p className="text-xs text-slate-500 mb-2 font-mono">Base Cost: {info.basePrice}g</p>
                      <p className="text-sm text-slate-300">{info.description(1)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'TERRAIN' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(TileEffect).map((type) => {
                const info = getTileEffectInfo(settings.language, type);
                const visuals = getTileVisuals(type);

                return (
                  <div key={type} className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg flex flex-col gap-3">
                    <div className={`h-24 w-full rounded-lg ${visuals.colorClass} border-2 flex items-center justify-center text-4xl shadow-inner relative overflow-hidden`}>
                       {visuals.icon}
                       {visuals.animation && <div className={visuals.animation}></div>}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{info.name}</h3>
                      <p className="text-sm text-slate-400">{info.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
