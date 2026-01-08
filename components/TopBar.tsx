
import React, { useState } from 'react';
import { UserStats, SupportedLanguage } from '../types';

interface TopBarProps {
  stats: UserStats;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

const SUPPORTED_LANGUAGES: {code: SupportedLanguage, flag: string}[] = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'hi', flag: '🇮🇳' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'ru', flag: '🇷🇺' },
  { code: 'pt', flag: '🇧🇷' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'ko', flag: '🇰🇷' },
  { code: 'id', flag: '🇮🇩' },
  { code: 'tr', flag: '🇹🇷' },
  { code: 'vi', flag: '🇻🇳' },
  { code: 'pl', flag: '🇵🇱' },
  { code: 'nl', flag: '🇳🇱' },
  { code: 'sv', flag: '🇸🇪' },
  { code: 'el', flag: '🇬🇷' },
  { code: 'he', flag: '🇮🇱' },
  { code: 'th', flag: '🇹🇭' },
];

const TOOLTIP_TRANSLATIONS: Record<string, any> = {
  es: { streak: "Racha: Días seguidos practicando", gems: "Gemas: Monedas para recompensas", hearts: "Vidas", dailyGoal: "Meta XP", gcd: "GCD COIN" },
};

const TopBar: React.FC<TopBarProps> = ({ stats, onLanguageChange }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const progress = Math.min((stats.dailyXP / stats.dailyGoal) * 100, 100);
  
  const currentFlag = SUPPORTED_LANGUAGES.find(l => l.code === stats.nativeLanguage)?.flag || '🌍';
  const tooltips = TOOLTIP_TRANSLATIONS[stats.nativeLanguage] || TOOLTIP_TRANSLATIONS.es;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 mb-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:border-emerald-400 transition-all"
          >
            {currentFlag}
          </button>
          
          {showLangMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-100 rounded-[1.5rem] shadow-xl p-3 grid grid-cols-4 md:grid-cols-5 gap-2 z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onLanguageChange(lang.code); setShowLangMenu(false); }}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-xl hover:bg-emerald-50 transition-colors ${stats.nativeLanguage === lang.code ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''}`}
                >
                  {lang.flag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 md:w-48" title={tooltips.dailyGoal}>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-extrabold text-gray-400 tracking-wider uppercase">Meta Diaria</span>
            <span className="text-xs font-bold text-blue-500">{stats.dailyXP} / {stats.dailyGoal} XP</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div 
              className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 justify-end w-full md:w-auto">
        <div className="flex items-center gap-2 group cursor-help bg-yellow-50 px-3 py-1.5 rounded-2xl border border-yellow-100" title={tooltips.gcd}>
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-[10px] text-white font-black border border-white shadow-sm">G</div>
          <span className="font-black text-yellow-700">{stats.gcdBalance.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 group cursor-help" title={tooltips.streak}>
          <span className="text-xl transition-transform group-hover:scale-125">🔥</span>
          <span className="font-bold text-orange-500">{stats.streak}</span>
        </div>
        <div className="flex items-center gap-2 group cursor-help" title={tooltips.gems}>
          <span className="text-xl transition-transform group-hover:rotate-12">💎</span>
          <span className="font-bold text-blue-400">{stats.gems}</span>
        </div>
        <div className="flex items-center gap-2 group cursor-help" title={tooltips.hearts}>
          <span className="text-xl transition-transform group-hover:scale-110">❤️</span>
          <span className="font-bold text-red-500">{stats.hearts}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
