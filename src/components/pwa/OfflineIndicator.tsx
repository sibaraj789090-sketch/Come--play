import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-14 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-950 shadow-2xl animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
