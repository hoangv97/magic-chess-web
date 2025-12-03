
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameSettings, Card, Relic, MapNode, RelicType, GamePhase, BossType, MapNodeType, Piece, PieceType, CardType } from '../types';
import { getDeckTemplate, getStarterDecks, getRelicInfo, RELICS_IN_SHOP, REWARD_CARDS, CARDS_IN_SHOP } from '../constants';
import { generateCampaignMap } from '../utils/mapGenerator';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameScreen } from './screens/GameScreen';
import { DeckSelection } from './screens/DeckSelection';
import { Reward } from './screens/Reward';
import { Shop } from './screens/Shop';
import { GameOver } from './screens/GameOver';
import { MapModal } from './modals/MapModal';
import { RestSite } from './screens/RestSite';
import { EventResult } from './screens/EventResult';
import { GameHeader } from './game/GameHeader';
import { TRANSLATIONS } from '../utils/locales';
import { soundManager } from '../utils/soundManager';
import { RelicDetailModal } from './modals/RelicDetailModal';

interface CampaignGameProps {
  settings: GameSettings;
  onExit: () => void;
}

const getCardTypeFromPiece = (piece: Piece): CardType | null => {
    switch (piece.type) {
        case PieceType.PAWN: return CardType.SPAWN_PAWN;
        case PieceType.KNIGHT: return CardType.SPAWN_KNIGHT;
        case PieceType.BISHOP: return CardType.SPAWN_BISHOP;
        case PieceType.ROOK: return CardType.SPAWN_ROOK;
        case PieceType.QUEEN: return CardType.SPAWN_QUEEN;
        case PieceType.FOOL: return CardType.SPAWN_FOOL;
        case PieceType.SHIP: return CardType.SPAWN_SHIP;
        case PieceType.ELEPHANT: return CardType.SPAWN_ELEPHANT;
        case PieceType.CHANCELLOR: return CardType.SPAWN_CHANCELLOR;
        case PieceType.ARCHBISHOP: return CardType.SPAWN_ARCHBISHOP;
        case PieceType.MANN: return CardType.SPAWN_MANN;
        case PieceType.AMAZON: return CardType.SPAWN_AMAZON;
        case PieceType.CENTAUR: return CardType.SPAWN_CENTAUR;
        case PieceType.ZEBRA: return CardType.SPAWN_ZEBRA;
        case PieceType.CHAMPION: return CardType.SPAWN_CHAMPION;
        case PieceType.DRAGON:
            if (piece.variant === 'LAVA') return CardType.SPAWN_DRAGON_LAVA;
            if (piece.variant === 'ABYSS') return CardType.SPAWN_DRAGON_ABYSS;
            if (piece.variant === 'FROZEN') return CardType.SPAWN_DRAGON_FROZEN;
            return CardType.SPAWN_DRAGON;
        default: return null;
    }
};

export const CampaignGame: React.FC<CampaignGameProps> = ({ settings, onExit }) => {
  // Campaign State
  const [phase, setPhase] = useState<GamePhase>('DECK_SELECTION');
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [masterDeck, setMasterDeck] = useState<Card[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [gold, setGold] = useState(0);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  
  // Shop & Reward State
  const [shopCards, setShopCards] = useState<Card[]>([]);
  const [shopRelics, setShopRelics] = useState<Relic[]>([]); 
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  
  // Event State
  const [eventData, setEventData] = useState<{title: string, desc: string, type: 'GOLD' | 'CARD' | 'RELIC' | 'NOTHING', gold?: number, card?: Card, relic?: Relic}>({
      title: '', desc: '', type: 'NOTHING'
  });

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

  const handlePieceKilled = (piece: Piece) => {
      // Check if current boss is Soul Eater
      const currentNode = mapNodes.find(n => n.id === currentMapNodeId);
      const isSoulEater = currentNode?.bossType === BossType.SOUL_EATER;
      
      if (isSoulEater) {
          const cardType = getCardTypeFromPiece(piece);
          if (cardType) {
              setMasterDeck(prev => {
                  const idx = prev.findIndex(c => c.type === cardType);
                  if (idx > -1) {
                      const newDeck = [...prev];
                      newDeck.splice(idx, 1);
                      // Visual or audio feedback could be added here if desired, 
                      // but logic happens silently affecting next game.
                      return newDeck;
                  }
                  return prev;
              });
          }
      }
  };

  const { gameState, actions } = useGameLogic({
    settings,
    isCampaign: true,
    relics,
    setGold,
    onWin: handleWin,
    onLoss: handleLoss,
    onPieceKilled: handlePieceKilled
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

  const initShop = () => {
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
  };

  const handleMapNodeSelect = (node: MapNode) => {
      soundManager.playSfx('click');
      setCurrentMapNodeId(node.id);
      setCampaignLevel(node.level);

      if (node.type === MapNodeType.SHOP) {
          initShop();
          setPhase('SHOP');
      } else if (node.type === MapNodeType.REST) {
          setPhase('REST_SITE');
      } else if (node.type === MapNodeType.UNKNOWN) {
          resolveUnknownNode(node);
      } else {
          // BATTLE or BOSS
          actions.initGame(true, masterDeck, node.level, node.bossType || BossType.NONE);
          setPhase('PLAYING');
      }
  };

  const resolveUnknownNode = (node: MapNode) => {
      const rand = Math.random();
      
      if (rand < 0.4) {
          // It's a trap! (Battle)
          actions.initGame(true, masterDeck, node.level, BossType.NONE);
          setPhase('PLAYING');
      } else if (rand < 0.5) {
          // It's a merchant
          initShop();
          setPhase('SHOP');
      } else if (rand < 0.6) {
          // It's a rest site
          setPhase('REST_SITE');
      } else if (rand < 0.75) {
          // Gold
          const amount = 50 + Math.floor(Math.random() * 100);
          setEventData({
              title: "Hidden Treasure",
              desc: "You stumble upon an abandoned chest containing gold.",
              type: 'GOLD',
              gold: amount
          });
          setPhase('EVENT_RESULT');
      } else if (rand < 0.9) {
          // Card
          const t = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
          const card = { ...t, id: uuidv4() };
          setEventData({
              title: "Lost Scroll",
              desc: "You find an ancient scroll containing a spell.",
              type: 'CARD',
              card: card
          });
          setPhase('EVENT_RESULT');
      } else {
          // Relic
          const relicTypes = Object.values(RelicType);
          const type = relicTypes[Math.floor(Math.random() * relicTypes.length)];
          setEventData({
              title: "Ancient Artifact",
              desc: "Buried in the dirt, you find a strange object.",
              type: 'RELIC',
              relic: { type, level: 1 }
          });
          setPhase('EVENT_RESULT');
      }
  };

  const handleEventClaim = () => {
      if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
      
      if (eventData.type === 'GOLD' && eventData.gold) {
          setGold(prev => prev + eventData.gold!);
          soundManager.playSfx('buy');
      } else if (eventData.type === 'CARD' && eventData.card) {
          setMasterDeck(prev => [...prev, eventData.card!]);
          soundManager.playSfx('draw');
      } else if (eventData.type === 'RELIC' && eventData.relic) {
          const r = eventData.relic!;
          const existing = relics.find(existing => existing.type === r.type);
          if (existing) {
              setRelics(prev => prev.map(item => item.type === r.type ? { ...item, level: item.level + 1 } : item));
          } else {
              setRelics(prev => [...prev, r]);
          }
          soundManager.playSfx('buy');
      }
      setPhase('MAP');
  };

  const selectReward = (card: Card) => {
      soundManager.playSfx('draw');
      setMasterDeck(prev => [...prev, card]);
      // Now go to map
      setPhase('MAP');
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
        soundManager.playSfx('click'); 
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
      if (gameState.selectedRelic?.type === relic.type) {
          actions.setSelectedRelic(null);
      }
      if (selectedRelic?.type === relic.type) {
          setSelectedRelic(null);
      }
  };

  const handleRestTrade = (cardToRemove: Card, newCards: Card[]) => {
      const newDeck = masterDeck.filter(c => c.id !== cardToRemove.id);
      setMasterDeck([...newDeck, ...newCards]);
      soundManager.playSfx('buy');
      if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
      setPhase('MAP');
  };

  const handleRestRemove = (cardToRemove: Card) => {
      const newDeck = masterDeck.filter(c => c.id !== cardToRemove.id);
      setMasterDeck(newDeck);
      soundManager.playSfx('buy');
      if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
      setPhase('MAP');
  };

  const handleRestLeave = () => {
      if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
      setPhase('MAP');
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

  const CommonHeader = () => (
    <GameHeader 
        phase={phase}
        isCampaign={true}
        campaignLevel={campaignLevel}
        relics={relics}
        gold={gold}
        turnCount={0}
        cardsPlayed={0}
        onResign={onExit}
        onRelicClick={(r) => setSelectedRelic(r)}
        onOpenMap={() => setShowMapModal(true)}
        settings={settings}
    />
  );

  // Determine if GameScreen should be visible
  const showGameScreen = phase === 'PLAYING' || phase === 'GAME_OVER_WIN' || phase === 'GAME_OVER_LOSS';

  return (
    <>
      {phase === 'DECK_SELECTION' && (
          <div className="flex flex-col h-full">
             <div className="shrink-0"><CommonHeader /></div>
             <DeckSelection onSelectDeck={selectStarterDeck} settings={settings} />
          </div>
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
           <div className="flex flex-col h-full w-full">
               <CommonHeader />
               <Reward rewardCards={rewardCards} onSelectReward={selectReward} settings={settings} />
           </div>
      )}

      {phase === 'SHOP' && (
           <div className="flex flex-col h-full w-full">
               <CommonHeader />
               <Shop 
                    gold={gold}
                    shopCards={shopCards}
                    shopRelics={shopRelics}
                    relics={relics}
                    onBuyCard={buyCard}
                    onBuyRelic={buyRelic}
                    onNext={() => {
                        soundManager.playSfx('click');
                        if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
                        setPhase('MAP');
                    }}
                    settings={settings}
                />
           </div>
      )}

      {phase === 'REST_SITE' && (
          <div className="flex flex-col h-full w-full">
              <CommonHeader />
              <RestSite 
                  deck={masterDeck} 
                  onTrade={handleRestTrade} 
                  onRemove={handleRestRemove} 
                  onLeave={handleRestLeave} 
                  settings={settings}
              />
          </div>
      )}

      {phase === 'EVENT_RESULT' && (
          <div className="flex flex-col h-full w-full">
              <CommonHeader />
              <EventResult 
                  title={eventData.title}
                  description={eventData.desc}
                  rewardType={eventData.type}
                  rewardGold={eventData.gold}
                  rewardCard={eventData.card}
                  rewardRelic={eventData.relic}
                  onContinue={handleEventClaim}
                  settings={settings}
              />
          </div>
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

      {selectedRelic && (
          <RelicDetailModal 
            relic={selectedRelic} 
            onClose={() => setSelectedRelic(null)}
            onSell={sellRelic}
            settings={settings}
          />
      )}
    </>
  );
};
