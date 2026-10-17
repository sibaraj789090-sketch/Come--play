import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  ChevronDown,
  Shield,
  Send,
  MessageSquare,
  HelpCircle,
  PhoneCall,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const Footer: React.FC = () => {
  const { setIsAdminView, isAdminView, showToast } = useGaming();
  const { install, isInstallable, isInstalled } = usePWAInstall();

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'features',
      title: 'Features',
      content:
        'Instant UPI Withdrawals in 2 minutes · Provably Fair RNG Gaming · High Odds Sportsbook · Mega Fantasy Leagues · Dedicated 24/7 Support in Hindi & English.',
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: 'Email: support@comeplay.com · Official Telegram: @ComePlayOfficial · 24x7 Live Chat Support.',
    },
    {
      id: 'help',
      title: 'Help & Guides',
      content: 'How to Play Aviator · Mines Strategy · Rummy Rules · How to deposit via PhonePe/GPay · UPI verification troubleshooting.',
    },
    {
      id: 'faq',
      title: 'FAQ',
      content: 'Is ComePlay legal in India? Yes, skill-based games and interactive sports entertainment operate in compliance. Minimum withdrawal is ₹300 with zero deduction.',
    },
  ];

  return (
    <footer className="bg-[#080c16] border-t border-slate-800/80 mt-10 pt-8 pb-20 sm:pb-10 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Accordions */}
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          {sections.map((sec) => (
            <div key={sec.id} className="border border-slate-800/80 rounded-xl overflow-hidden bg-[#0d1322]">
              <button
                onClick={() => toggle(sec.id)}
                className="w-full px-4 py-3 text-left font-bold text-gray-300 flex items-center justify-between hover:text-white"
              >
                <span>{sec.title}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openSection === sec.id ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>
              {openSection === sec.id && (
                <div className="px-4 pb-3 pt-1 text-gray-400 border-t border-slate-800/60 leading-relaxed text-[11px]">
                  {sec.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social channels matching Screenshot #2 */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          {[
            { name: 'Telegram', icon: '✈️' },
            { name: 'Discord', icon: '👾' },
            { name: 'X', icon: '✖️' },
            { name: 'WhatsApp', icon: '💬' },
            { name: 'Facebook', icon: '📘' },
            { name: 'Instagram', icon: '📸' },
          ].map((soc) => (
            <button
              key={soc.name}
              onClick={() => showToast(`Opening official ${soc.name} channel...`)}
              className="w-9 h-9 rounded-full bg-[#121929] hover:bg-[#1a253c] border border-slate-800 flex items-center justify-center text-sm hover:scale-110 transition shadow-sm"
              title={soc.name}
            >
              <span>{soc.icon}</span>
            </button>
          ))}
        </div>

        {/* Currency ticker matching screenshot #2 */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>1 USDT = $1.00 USD ≈ ₹88.50 INR</span>
        </div>

        {/* Bottom bar with Admin portal link & copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] border-t border-slate-800/60 pt-4 text-gray-500">
          <div>
            © 2026 ComePlay Gaming & Entertainment Inc. All Rights Reserved. 18+ Play Responsibly.
          </div>

          <div className="flex items-center gap-4">
            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA App</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Control Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
