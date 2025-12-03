import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameSettings, Card, Relic, MapNode, RelicType, GamePhase, BossType } from '../types';
import { getDeckTemplate, getStarterDecks, getRelicInfo, RELICS_IN_SHOP, REWARD_CARDS, CARDS_IN_SHOP, getTileEffectInfo } from '../constants';
import { generateCampaignMap } from '../utils/mapGenerator';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameScreen } from './screens/GameScreen';
import { DeckSelection } from './screens/DeckSelection';
import { Reward } from './screens/Reward';
import { Shop } from './screens/Shop';
import { GameOver } from './screens/GameOver';
import { MapModal } from './modals/MapModal';
import { TRANSLATIONS } from '../utils/locales';
import { soundManager } from '../utils/soundManager';

interface CampaignGameProps {
  settings: GameSettings;
  onExit: () => void;
}

export const CampaignGame: React.FC<CampaignGameProps> = ({ settings, onExit }) => {
  // Campaign State
  const [phase, setPhase] = useState<GamePhase>('DECK_SELECTION');
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [masterDeck, setMasterDeck] = useState<Card[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [gold, setGold] = useState(0);
  
  // Shop & Reward State
  const [shopCards, setShopCards] = useState<Card[]>([]);
  const [shopRelics, setShopRelics] = useState<Relic[]>([]); 
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  
  // Map State
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [currentMapNodeId, setCurrentMapNodeId] = useState<string | null>(null);
  const [completedMapNodeIds, setCompletedMapNodeIds] = useState<string[]>([]);
  const [showMapModal, setShowMapModal] = useState(false);

  const deckTemplate = getDeckTemplate(settings.language);

  // Initialize Map
  useEffect(() => {
    setMapNodes(generateCampaignMap());
  }, []);

  const handleWin = () => {
    if (currentMapNodeId) {
        setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
    }
    
    if (campaignLevel >= 50) { 
        setPhase('GAME_OVER_WIN');
        return;
    }

    const rewards = Array.from({length: REWARD_CARDS}).map(() => {
        const t = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
        return { ...t, id: uuidv4() };
    });
    setRewardCards(rewards);
    setPhase('REWARD');
  };

  const handleLoss = () => {
    setPhase('GAME_OVER_LOSS');
  };

  const { gameState, actions } = useGameLogic({
    settings,
    isCampaign: true,
    relics,
    setGold,
    onWin: handleWin,
    onLoss: handleLoss
  });

  const selectStarterDeck = (index: number) => {
    soundManager.playSfx('click');
    const starter = getStarterDecks(settings.language)[index];
    const newMasterDeck = starter.cards.map(type => {
      const template = deckTemplate.find(t => t.type === type)!;
      return { ...template, id: uuidv4() };
    });
    setMasterDeck(newMasterDeck);
    setPhase('MAP');
  };

  const handleMapNodeSelect = (node: MapNode) => {
      soundManager.playSfx('click');
      setCurrentMapNodeId(node.id);
      setCampaignLevel(node.level);
      // Pass boss type from map node
      actions.initGame(true, masterDeck, node.level, node.bossType || BossType.NONE);
      setPhase('PLAYING');
  };

  const selectReward = (card: Card) => {
      soundManager.playSfx('draw');
      setMasterDeck(prev => [...prev, card]);
      
      const shop = Array.from({length: CARDS_IN_SHOP}).map(() => {
          const t = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
          return { ...t, id: uuidv4() };
      });
      setShopCards(shop);

      const shopR: Relic[] = [];
      const relicTypes = Object.values(RelicType);
      
      for(let i = 0; i < RELICS_IN_SHOP; i++) {
          const type = relicTypes[Math.floor(Math.random() * relicTypes.length)];
          shopR.push({ type, level: 1 });
      }
      setShopRelics(shopR);

      setPhase('SHOP');
  };

  const buyCard = (card: Card) => {
      // Check for discount
      let cost = card.cost;
      const hasDiscount = relics.some(r => r.type === RelicType.DISCOUNT_CARD);
      if (hasDiscount) {
          cost = Math.floor(cost * 0.5);
      }

      if (gold >= cost) {
          soundManager.playSfx('buy');
          setGold(prev => prev - cost);
          setMasterDeck(prev => [...prev, card]);
          setShopCards(prev => prev.filter(c => c.id !== card.id));
      } else {
        soundManager.playSfx('click'); // Or some error sound
      }
  };

  const buyRelic = (relic: Relic, index: number) => {
      const info = getRelicInfo(settings.language, relic.type);
      const existing = relics.find(r => r.type === relic.type);
      const currentLevel = existing ? existing.level : 0;
      let cost = info.basePrice * (currentLevel + 1);

      // Check for discount
      const hasDiscount = relics.some(r => r.type === RelicType.DISCOUNT_RELIC);
      if (hasDiscount) {
          cost = Math.floor(cost * 0.5);
      }

      if (gold >= cost) {
          soundManager.playSfx('buy');
          setGold(prev => prev - cost);
          
          if (existing) {
              setRelics(prev => prev.map(r => r.type === relic.type ? { ...r, level: r.level + 1 } : r));
          } else {
              setRelics(prev => [...prev, { type: relic.type, level: 1 }]);
          }

          const newShopRelics = [...shopRelics];
          newShopRelics.splice(index, 1);
          setShopRelics(newShopRelics);
      } else {
        soundManager.playSfx('click');
      }
  };

  const sellRelic = (relic: Relic) => {
      const info = getRelicInfo(settings.language, relic.type);
      const sellValue = Math.floor(info.basePrice * relic.level * 0.5);
      soundManager.playSfx('buy'); // Coins sound
      setGold(prev => prev + sellValue);
      setRelics(prev => prev.filter(r => r.type !== relic.type));
      actions.setSelectedRelic(null);
  };
  
  const restartCampaign = () => {
    soundManager.playSfx('click');
    setGold(0);
    setCampaignLevel(1);
    setRelics([]);
    setCurrentMapNodeId(null);
    setCompletedMapNodeIds([]);
    setMapNodes(generateCampaignMap());
    setPhase('DECK_SELECTION');
  };

  // Determine if GameScreen should be visible
  const showGameScreen = phase === 'PLAYING' || phase === 'GAME_OVER_WIN' || phase === 'GAME_OVER_LOSS';

  return (
    <>
      {phase === 'DECK_SELECTION' && (
          <DeckSelection onSelectDeck={selectStarterDeck} settings={settings} />
      )}
      
      {phase === 'MAP' && (
           <MapModal 
             mapNodes={mapNodes}
             currentNodeId={currentMapNodeId}
             completedNodes={completedMapNodeIds}
             onNodeSelect={handleMapNodeSelect}
             onClose={() => {}} 
             isReadOnly={false}
             settings={settings}
           />
      )}

      {phase === 'REWARD' && (
           <Reward rewardCards={rewardCards} onSelectReward={selectReward} settings={settings} />
      )}

      {phase === 'SHOP' && (
           <Shop 
             gold={gold}
             shopCards={shopCards}
             shopRelics={shopRelics}
             relics={relics}
             onBuyCard={buyCard}
             onBuyRelic={buyRelic}
             onNext={() => {
               soundManager.playSfx('click');
               setPhase('MAP');
             }}
             settings={settings}
           />
      )}

      {/* Render Game Screen in background for Game Over to overlay */}
      {showGameScreen && (
        <GameScreen 
          settings={settings}
          gameState={gameState}
          actions={actions}
          isCampaign={true}
          campaignLevel={campaignLevel}
          relics={relics}
          gold={gold}
          mapNodes={mapNodes}
          currentMapNodeId={currentMapNodeId}
          completedMapNodeIds={completedMapNodeIds}
          showMapModal={showMapModal}
          onOpenMap={() => {
            soundManager.playSfx('click');
            setShowMapModal(true);
          }}
          onCloseMap={() => {
            soundManager.playSfx('click');
            setShowMapModal(false);
          }}
          onResign={onExit}
          onSellRelic={sellRelic}
        />
      )}

      <GameOver 
          phase={phase}
          isCampaign={true}
          onMainMenu={onExit}
          onRestartCampaign={restartCampaign}
          settings={settings}
      />
    </>
  );
};