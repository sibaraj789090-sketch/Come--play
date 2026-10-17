import React, { useState } from 'react';
import { GamingProvider, useGaming } from './context/GamingContext';
import { PWAInstallBar } from './components/pwa/PWAInstallBar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';

// Views
import { PromoHeroBanner } from './components/home/PromoHeroBanner';
import { SuggestedPredictions } from './components/home/SuggestedPredictions';
import { LiveBetsFeed } from './components/home/LiveBetsFeed';
import { GamesGrid } from './components/casino/GamesGrid';
import { SportsMatchesList } from './components/sports/SportsMatchesList';
import { FantasyView } from './components/fantasy/FantasyView';
import { RummyView } from './components/rummy/RummyView';
import { AdminPanel } from './components/admin/AdminPanel';

// Modals & Games
import { AviatorGame } from './components/games/AviatorGame';
import { MinesGame } from './components/games/MinesGame';
import { SevenUpDownGame } from './components/games/SevenUpDownGame';
import { LimboGame } from './components/games/LimboGame';
import { RummySimulator } from './components/games/RummySimulator';
import { SlotMachineGame } from './components/games/SlotMachineGame';
import { GaneshaFortuneGame } from './components/games/GaneshaFortuneGame';
import { AuthModal } from './components/modals/AuthModal';
import { UserWalletModal } from './components/modals/UserWalletModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { ReferralModal } from './components/modals/ReferralModal';
import { SportsBetModal } from './components/sports/SportsBetModal';
import { MyBetsModal } from './components/modals/MyBetsModal';
import { GameCategory } from './types/gaming';
import { Bell, Flame, ShieldAlert } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeGame,
    adminSettings,
    isAdminView,
    setIsAdminView,
  } = useGaming();

  const [currentTab, setCurrentTab] = useState<GameCategory>('explore');
  const [isMyBetsOpen, setIsMyBetsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* 1. PWA Download Top Bar */}
      <PWAInstallBar />

      {/* 2. Top Header & Navigation */}
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* 3. Site Announcement Banner */}
      {adminSettings.siteAnnouncement && !isAdminView && (
        <div className="bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-cyan-950/60 border-b border-cyan-800/40 px-3 py-1.5 text-xs flex items-center gap-2 overflow-hidden">
          <Bell className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <span className="font-semibold text-cyan-200">
              {adminSettings.siteAnnouncement}
            </span>
          </div>
        </div>
      )}

      {/* 4. Maintenance Notice if locked by Admin */}
      {adminSettings.maintenanceMode && !isAdminView && (
        <div className="bg-rose-950/80 border-b border-rose-500 px-4 py-2 text-center text-xs text-rose-200 font-bold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Platform is currently undergoing scheduled maintenance. Bet settlement is live.</span>
        </div>
      )}

      {/* 5. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {isAdminView ? (
          <AdminPanel />
        ) : (
          <>
            {/* EXPLORE TAB (Home View matching Screenshots #1, #2, #5) */}
            {currentTab === 'explore' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Hero Referral & IPL banner */}
                <PromoHeroBanner />

                {/* Suggested Predictions matching screenshot #1 */}
                <SuggestedPredictions />

                {/* Casino Hot Picks Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span className="font-gaming uppercase">Top Rated Games</span>
                    </h3>
                    <button
                      onClick={() => setCurrentTab('casino')}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      View All Games
                    </button>
                  </div>
                  <GamesGrid forcedCategory="Lobby" />
                </div>

                {/* Live Bets Real-time Ticker matching screenshot #2 */}
                <LiveBetsFeed />
              </div>
            )}

            {/* CASINO TAB matching Screenshots #3, #4, #6 */}
            {currentTab === 'casino' && (
              <div className="space-y-4 animate-in fade-in">
                <GamesGrid />
                <LiveBetsFeed />
              </div>
            )}

            {/* FANTASY TAB matching Screenshot #1 & #3 */}
            {currentTab === 'fantasy' && (
              <div className="space-y-4 animate-in fade-in">
                <FantasyView />
              </div>
            )}

            {/* RUMMY TAB matching Screenshot #8 */}
            {currentTab === 'rummy' && (
              <div className="space-y-4 animate-in fade-in">
                <RummyView />
              </div>
            )}

            {/* SPORTS TAB matching Screenshot #7 */}
            {currentTab === 'sports' && (
              <div className="space-y-4 animate-in fade-in">
                <SportsMatchesList />
              </div>
            )}
          </>
        )}
      </main>

      {/* 6. Footer */}
      {!isAdminView && <Footer />}

      {/* 7. Bottom Navigation (Mobile) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenMyBets={() => setIsMyBetsOpen(true)}
      />

      {/* 8. Playable Game Overlays */}
      {(activeGame === 'aviator' || activeGame === 'aviator-pro') && <AviatorGame />}
      {(activeGame === 'mines' || activeGame === 'mines-star' || activeGame === 'chicken' || activeGame === 'chicken-road-2' || activeGame === 'squid-game') && (
        <MinesGame />
      )}
      {(activeGame === '7up-7down' || activeGame === '7up-7down-1000x' || activeGame === 'sic-bo') && (
        <SevenUpDownGame />
      )}
      {(activeGame === 'limbo' || activeGame === 'dice' || activeGame === 'twist' || activeGame === 'ballonix' || activeGame === 'go-rush' || activeGame === 'color-prediction') && (
        <LimboGame />
      )}
      {(activeGame === 'rummy-sim' || activeGame === 'teenpatti' || activeGame === 'teen-patti-anime' || activeGame === 'super-andar-bahar') && (
        <RummySimulator />
      )}
      {(activeGame === 'ganesha-fortune' || activeGame === 'ganesha-gold') && (
        <GaneshaFortuneGame />
      )}
      {activeGame &&
        ![
          'aviator',
          'aviator-pro',
          'mines',
          'mines-star',
          'chicken',
          'chicken-road-2',
          'squid-game',
          '7up-7down',
          '7up-7down-1000x',
          'sic-bo',
          'limbo',
          'dice',
          'twist',
          'ballonix',
          'go-rush',
          'color-prediction',
          'rummy-sim',
          'teenpatti',
          'teen-patti-anime',
          'super-andar-bahar',
          'ganesha-fortune',
          'ganesha-gold',
        ].includes(activeGame) && <SlotMachineGame />}

      {/* 9. User Dialogs & Modals */}
      <AuthModal />
      <UserWalletModal />
      <DepositModal />
      <WithdrawModal />
      <ReferralModal />
      <SportsBetModal />
      <MyBetsModal isOpen={isMyBetsOpen} onClose={() => setIsMyBetsOpen(false)} />

      {/* 10. PWA Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <GamingProvider>
      <MainApp />
    </GamingProvider>
  );
}
