import React from 'react';
import { GameSettings, BossType, MapNodeType } from '../types';
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
import { soundManager } from '../utils/soundManager';
import { RelicDetailModal } from './modals/RelicDetailModal';
import { useCampaignLogic } from '../hooks/useCampaignLogic';

interface CampaignGameProps {
  settings: GameSettings;
  onExit: () => void;
}

export const CampaignGame: React.FC<CampaignGameProps> = ({ settings, onExit }) => {
  const campaign = useCampaignLogic({ settings });
  
  const { gameState, actions } = useGameLogic({
    settings,
    isCampaign: true,
    relics: campaign.relics,
    setGold: campaign.setGold,
    onWin: campaign.handleWin,
    onLoss: campaign.handleLoss,
    onPieceKilled: campaign.handlePieceKilled
  });

  const handleMapNodeSelect = (node: any) => {
      soundManager.playSfx('click');
      campaign.setCurrentMapNodeId(node.id);
      campaign.setCampaignLevel(node.level);

      if (node.type === MapNodeType.SHOP) {
          campaign.initShop();
          campaign.setPhase('SHOP');
      } else if (node.type === MapNodeType.REST) {
          campaign.setPhase('REST_SITE');
      } else if (node.type === MapNodeType.UNKNOWN) {
          const result = campaign.resolveUnknownNode(node);
          if (result.type === 'BATTLE') {
             actions.initGame(
                true, 
                campaign.masterDeck, 
                node.level, 
                BossType.NONE, 
                result.elite
             );
             campaign.setPhase('PLAYING');
          }
      } else {
          // BATTLE, BOSS, or MINI_BOSS
          actions.initGame(
              true, 
              campaign.masterDeck, 
              node.level, 
              node.bossType || BossType.NONE,
              node.type === MapNodeType.MINI_BOSS // isElite
          );
          campaign.setPhase('PLAYING');
      }
  };

  const CommonHeader = () => (
    <GameHeader 
        phase={campaign.phase}
        isCampaign={true}
        campaignLevel={campaign.campaignLevel}
        relics={campaign.relics}
        gold={campaign.gold}
        turnCount={0}
        cardsPlayed={0}
        onResign={onExit}
        onRelicClick={(r) => campaign.setSelectedRelic(r)}
        onOpenMap={() => campaign.setShowMapModal(true)}
        settings={settings}
    />
  );

  const showGameScreen = campaign.phase === 'PLAYING' || campaign.phase === 'GAME_OVER_WIN' || campaign.phase === 'GAME_OVER_LOSS';

  return (
    <>
      {campaign.phase === 'DECK_SELECTION' && (
          <div className="flex flex-col h-full w-full">
             <div className=""><CommonHeader /></div>
             <DeckSelection onSelectDeck={campaign.selectStarterDeck} settings={settings} />
          </div>
      )}
      
      {campaign.phase === 'MAP' && (
        <div className="flex flex-col h-full w-full">
             <div className=""><CommonHeader /></div>
             <div className="">
                <MapModal 
                    mapNodes={campaign.mapNodes}
                    currentNodeId={campaign.currentMapNodeId}
                    completedNodes={campaign.completedMapNodeIds}
                    onNodeSelect={handleMapNodeSelect}
                    onClose={() => {}} 
                    isReadOnly={false}
                    settings={settings}
                />
             </div>
           
        </div>
      )}

      {campaign.phase === 'REWARD' && (
           <div className="flex flex-col h-full w-full">
               <CommonHeader />
               <Reward rewardCards={campaign.rewardCards} onSelectReward={campaign.selectReward} settings={settings} />
           </div>
      )}

      {campaign.phase === 'SHOP' && (
           <div className="flex flex-col h-full w-full">
               <CommonHeader />
               <Shop 
                    gold={campaign.gold}
                    shopCards={campaign.shopCards}
                    shopRelics={campaign.shopRelics}
                    relics={campaign.relics}
                    onBuyCard={campaign.buyCard}
                    onBuyRelic={campaign.buyRelic}
                    onNext={() => {
                        soundManager.playSfx('click');
                        if (campaign.currentMapNodeId) campaign.setCompletedMapNodeIds(prev => [...prev, campaign.currentMapNodeId!]);
                        campaign.setPhase('MAP');
                    }}
                    settings={settings}
                />
           </div>
      )}

      {campaign.phase === 'REST_SITE' && (
          <div className="flex flex-col h-full w-full">
              <CommonHeader />
              <RestSite 
                  deck={campaign.masterDeck} 
                  onTrade={campaign.handleRestTrade} 
                  onRemove={campaign.handleRestRemove} 
                  onLeave={campaign.handleRestLeave} 
                  settings={settings}
              />
          </div>
      )}

      {campaign.phase === 'EVENT_RESULT' && (
          <div className="flex flex-col h-full w-full">
              <CommonHeader />
              <EventResult 
                  title={campaign.eventData.title}
                  description={campaign.eventData.desc}
                  rewardType={campaign.eventData.type}
                  rewardGold={campaign.eventData.gold}
                  rewardCard={campaign.eventData.card}
                  rewardRelic={campaign.eventData.relic}
                  choiceCards={campaign.eventData.choiceCards}
                  onContinue={campaign.handleEventClaim}
                  settings={settings}
              />
          </div>
      )}

      {showGameScreen && (
        <GameScreen 
          settings={settings}
          gameState={gameState}
          actions={actions}
          isCampaign={true}
          campaignLevel={campaign.campaignLevel}
          relics={campaign.relics}
          gold={campaign.gold}
          mapNodes={campaign.mapNodes}
          currentMapNodeId={campaign.currentMapNodeId}
          completedMapNodeIds={campaign.completedMapNodeIds}
          showMapModal={campaign.showMapModal}
          onOpenMap={() => {
            soundManager.playSfx('click');
            campaign.setShowMapModal(true);
          }}
          onCloseMap={() => {
            soundManager.playSfx('click');
            campaign.setShowMapModal(false);
          }}
          onResign={onExit}
          onSellRelic={(r) => {
              campaign.sellRelic(r);
              // Update local state if needed via actions if we had relic state in useGameLogic, but we use campaign.relics
          }}
        />
      )}

      <GameOver 
          phase={campaign.phase}
          isCampaign={true}
          onMainMenu={onExit}
          onRestartCampaign={campaign.restartCampaign}
          settings={settings}
      />

      {campaign.selectedRelic && (
          <RelicDetailModal 
            relic={campaign.selectedRelic} 
            onClose={() => campaign.setSelectedRelic(null)}
            onSell={campaign.sellRelic}
            settings={settings}
          />
      )}
    </>
  );
};