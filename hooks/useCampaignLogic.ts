
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameSettings, Card, Relic, MapNode, RelicType, GamePhase, BossType, MapNodeType, Piece, CardType, SavedGameState } from '../types';
import { getDeckTemplate, getStarterDecks, getRelicInfo, RELICS_IN_SHOP, REWARD_CARDS, CARDS_IN_SHOP } from '../constants';
import { generateCampaignMap } from '../utils/mapGenerator';
import { soundManager } from '../utils/soundManager';
import { saveToStorage, clearFromStorage, STORAGE_KEYS } from '../utils/storage';
import { getRandomCards } from '../utils/random';
import { generateShopContent, getCardTypeFromPiece, resolveUnknownNodeResult } from '../utils/campaignLogic';

interface UseCampaignLogicProps {
    settings: GameSettings;
    initialSaveData?: SavedGameState | null;
}

export const useCampaignLogic = ({ settings, initialSaveData }: UseCampaignLogicProps) => {
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
  const [showDeckModal, setShowDeckModal] = useState(false);

  const deckTemplate = getDeckTemplate(settings.language);

  // Initialize from save or generate new
  useEffect(() => {
    if (initialSaveData) {
        setCampaignLevel(initialSaveData.campaignLevel);
        setMasterDeck(initialSaveData.masterDeck);
        setRelics(initialSaveData.relics);
        setGold(initialSaveData.gold);
        setMapNodes(initialSaveData.mapNodes);
        setCurrentMapNodeId(initialSaveData.currentMapNodeId);
        setCompletedMapNodeIds(initialSaveData.completedMapNodeIds);
        setPhase('MAP');
    } else {
        setMapNodes(generateCampaignMap());
    }
  }, [initialSaveData]);

  // Save Progress Logic
  const saveProgress = useCallback(() => {
      // Don't save if we haven't even selected a deck yet
      if (phase === 'DECK_SELECTION' && masterDeck.length === 0) return;

      const saveData: SavedGameState = {
          campaignLevel,
          masterDeck,
          relics,
          gold,
          mapNodes,
          currentMapNodeId,
          completedMapNodeIds
      };
      saveToStorage(STORAGE_KEYS.CAMPAIGN, saveData);
  }, [campaignLevel, masterDeck, relics, gold, mapNodes, currentMapNodeId, completedMapNodeIds, phase]);

  // Auto-save when critical state changes (Map, Shop, Rest)
  useEffect(() => {
      if (phase === 'MAP' || phase === 'SHOP' || phase === 'REST_SITE') {
          saveProgress();
      }
  }, [phase, saveProgress, gold, masterDeck, relics, completedMapNodeIds]);

  const handleWin = () => {
    if (currentMapNodeId) {
        setCompletedMapNodeIds(prev => [...prev, currentMapNodeId]);
    }
    
    if (campaignLevel >= 50) { 
        clearFromStorage(STORAGE_KEYS.CAMPAIGN);
        setPhase('GAME_OVER_WIN');
        return;
    }

    // Weighted rewards based on deck state
    const rewards = getRandomCards(REWARD_CARDS, deckTemplate, masterDeck);
    setRewardCards(rewards);
    setPhase('REWARD');
  };

  const handleLoss = () => {
    clearFromStorage(STORAGE_KEYS.CAMPAIGN);
    setPhase('GAME_OVER_LOSS');
  };

  const handlePieceKilled = (piece: Piece) => {
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
      const content = generateShopContent(settings.language, masterDeck, relics);
      setShopCards(content.shopCards);
      setShopRelics(content.shopRelics);
  };

  const resolveUnknownNode = (node: MapNode) => {
      const result = resolveUnknownNodeResult(settings.language, masterDeck, relics);
      
      if (result.type === 'BATTLE') {
          return { type: 'BATTLE', elite: result.elite };
      } else if (result.type === 'SHOP') {
          initShop();
          setPhase('SHOP');
          return { type: 'SHOP' };
      } else if (result.type === 'REST') {
          setPhase('REST_SITE');
          return { type: 'REST' };
      } else if (result.type === 'EVENT' && result.eventData) {
          setEventData(result.eventData);
          setPhase('EVENT_RESULT');
          return { type: 'EVENT' };
      }
      return { type: 'UNKNOWN' };
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
    setMasterDeck([]);
    setCurrentMapNodeId(null);
    setCompletedMapNodeIds([]);
    setMapNodes(generateCampaignMap());
    clearFromStorage(STORAGE_KEYS.CAMPAIGN);
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
      showDeckModal, setShowDeckModal,
      handleWin, handleLoss, handlePieceKilled,
      selectStarterDeck, initShop, resolveUnknownNode,
      handleEventClaim, selectReward, buyCard, buyRelic, sellRelic,
      handleRestTrade, handleRestRemove, handleRestLeave, restartCampaign
  };
};
