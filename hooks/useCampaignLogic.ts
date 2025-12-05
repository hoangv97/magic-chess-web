import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameSettings, Card, Relic, MapNode, RelicType, GamePhase, BossType, MapNodeType, Piece, PieceType, CardType } from '../types';
import { getDeckTemplate, getStarterDecks, getRelicInfo, RELICS_IN_SHOP, REWARD_CARDS, CARDS_IN_SHOP } from '../constants';
import { generateCampaignMap } from '../utils/mapGenerator';
import { soundManager } from '../utils/soundManager';

export const getCardTypeFromPiece = (piece: Piece): CardType | null => {
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

interface UseCampaignLogicProps {
    settings: GameSettings;
}

export const useCampaignLogic = ({ settings }: UseCampaignLogicProps) => {
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
  const [eventData, setEventData] = useState<{
      title: string, 
      desc: string, 
      type: 'GOLD' | 'CARD' | 'RELIC' | 'NOTHING' | 'PICK_CARD', 
      gold?: number, 
      card?: Card, 
      relic?: Relic,
      choiceCards?: Card[]
  }>({
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
                      return newDeck;
                  }
                  return prev;
              });
          }
      }
  };

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

  const resolveUnknownNode = (node: MapNode) => {
      const rand = Math.random();
      
      if (rand < 0.35) {
          return { type: 'BATTLE', elite: Math.random() > 0.8 };
      } else if (rand < 0.45) {
          initShop();
          setPhase('SHOP');
          return { type: 'SHOP' };
      } else if (rand < 0.55) {
          setPhase('REST_SITE');
          return { type: 'REST' };
      } else if (rand < 0.70) {
          const amount = 50 + Math.floor(Math.random() * 100);
          setEventData({
              title: "Hidden Treasure",
              desc: "You stumble upon an abandoned chest containing gold.",
              type: 'GOLD',
              gold: amount
          });
          setPhase('EVENT_RESULT');
          return { type: 'EVENT' };
      } else if (rand < 0.85) {
          const choices = Array.from({length: 3}).map(() => {
              const t = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
              return { ...t, id: uuidv4() };
          });
          setEventData({
              title: "Fortune Teller",
              desc: "A mysterious figure lays out three face-down cards. 'Choose your destiny,' they whisper.",
              type: 'PICK_CARD',
              choiceCards: choices
          });
          setPhase('EVENT_RESULT');
          return { type: 'EVENT' };
      } else if (rand < 0.95) {
          const t = deckTemplate[Math.floor(Math.random() * deckTemplate.length)];
          const card = { ...t, id: uuidv4() };
          setEventData({
              title: "Lost Scroll",
              desc: "You find an ancient scroll containing a spell.",
              type: 'CARD',
              card: card
          });
          setPhase('EVENT_RESULT');
          return { type: 'EVENT' };
      } else {
          const relicTypes = Object.values(RelicType);
          const type = relicTypes[Math.floor(Math.random() * relicTypes.length)];
          setEventData({
              title: "Ancient Artifact",
              desc: "Buried in the dirt, you find a strange object.",
              type: 'RELIC',
              relic: { type, level: 1 }
          });
          setPhase('EVENT_RESULT');
          return { type: 'EVENT' };
      }
  };

  const handleEventClaim = (pickedCard?: Card) => {
      if (currentMapNodeId) setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
      
      if (eventData.type === 'GOLD' && eventData.gold) {
          setGold(prev => prev + eventData.gold!);
          soundManager.playSfx('buy');
      } else if (eventData.type === 'CARD' && eventData.card) {
          setMasterDeck(prev => [...prev, eventData.card!]);
          soundManager.playSfx('draw');
      } else if (eventData.type === 'PICK_CARD' && pickedCard) {
          setMasterDeck(prev => [...prev, pickedCard]);
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
      setPhase('MAP');
  };

  const buyCard = (card: Card) => {
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
      soundManager.playSfx('buy'); 
      setGold(prev => prev + sellValue);
      setRelics(prev => prev.filter(r => r.type !== relic.type));
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

  return {
      phase, setPhase,
      campaignLevel, setCampaignLevel,
      masterDeck, setMasterDeck,
      relics, setRelics,
      gold, setGold,
      selectedRelic, setSelectedRelic,
      shopCards, setShopCards,
      shopRelics, setShopRelics,
      rewardCards, setRewardCards,
      eventData, setEventData,
      mapNodes, setMapNodes,
      currentMapNodeId, setCurrentMapNodeId,
      completedMapNodeIds, setCompletedMapNodeIds,
      showMapModal, setShowMapModal,
      handleWin, handleLoss, handlePieceKilled,
      selectStarterDeck, initShop, resolveUnknownNode,
      handleEventClaim, selectReward, buyCard, buyRelic, sellRelic,
      handleRestTrade, handleRestRemove, handleRestLeave, restartCampaign
  };
};