import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, Copy, Check, Share2, Users, Gift, Sparkles, MessageCircle } from 'lucide-react';

export const ReferralModal: React.FC = () => {
  const { isReferralOpen, closeReferral, currentUser, adminSettings } = useGaming();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isReferralOpen) return null;

  const refCode = currentUser?.referralCode || 'COME888';
  const shareUrl = `${window.location.origin}?ref=${refCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = encodeURIComponent(
    `🔥 Play Aviator, Mines & Cricket with me on ComePlay! Register with my code ${refCode} and get ₹100 Welcome Bonus instantly: ${shareUrl}`
  );
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#121929] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1e1529] to-amber-950 px-4 py-3.5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="font-gaming font-black text-lg text-white">
              REFER & EARN ₹{adminSettings.referralBonus}
            </span>
          </div>
          <button onClick={closeReferral} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Rewards breakdown graphic */}
          <div className="bg-gradient-to-b from-[#1c142b] to-[#0f172a] p-4 rounded-xl border border-amber-500/30 text-center space-y-2">
            <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Friend Registers → You Earn
            </div>
            <div className="text-3xl font-black text-amber-300 font-mono-num gold-gradient-text">
              ₹{adminSettings.referralBonus} CASH
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-gray-400 block text-[10px]">Instant on Signup</span>
                <span className="font-bold text-emerald-400 font-mono-num">₹80.00</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-gray-400 block text-[10px]">On 1st Game Bet</span>
                <span className="font-bold text-cyan-400 font-mono-num">₹30.00</span>
              </div>
            </div>
          </div>

          {/* Referral Code Box */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
              Your Exclusive Referral Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0f1d] border border-amber-500/50 rounded-xl px-4 py-2.5 text-base font-black tracking-widest text-amber-400 font-mono-num text-center">
                {refCode}
              </div>
              <button
                onClick={copyCode}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-md"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </a>
            <button
              onClick={copyLink}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* User Referral Stats */}
          <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800 flex items-center justify-around text-center text-xs">
            <div>
              <div className="text-[10px] text-gray-400">Total Invites</div>
              <div className="text-base font-bold text-white font-mono-num">14 Friends</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-gray-400">Earned Commission</div>
              <div className="text-base font-bold text-emerald-400 font-mono-num">₹1,540.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
