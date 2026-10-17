import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X, Smartphone, CheckCircle, Apple } from 'lucide-react';

export const PWAInstallBar: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDownloadClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div className="bg-[#121c2d] border-b border-cyan-900/40 px-3 py-2 text-xs flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-white p-0.5 rounded transition"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Smartphone className="w-3.5 h-3.5 text-white" />
          </div>

          <div className="flex flex-col truncate">
            <span className="font-semibold text-gray-200 truncate flex items-center gap-1.5">
              Download the APK for exclusive benefits.
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 inline" /> 100% Trusted & Secure.
            </span>
          </div>
        </div>

        <button
          onClick={handleDownloadClick}
          className="ml-2 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded text-xs flex items-center gap-1 flex-shrink-0 transition shadow-sm active:scale-95"
        >
          <Download className="w-3 h-3" />
          <span>Download</span>
        </button>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#162032] border border-cyan-800/60 p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Apple className="w-5 h-5" />
                <span>Install on iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Launch <strong className="text-cyan-400">ComePlay</strong> anytime with 1-tap app experience!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 rounded-xl font-bold text-sm shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
