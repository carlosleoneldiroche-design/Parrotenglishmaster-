
import React from 'react';
import { UserStats, Outfit } from '../types';

interface ShopViewProps {
  stats: UserStats;
  onBuyItem: (itemId: string, price: number, currency: 'gems' | 'gcd', type: 'outfit' | 'powerup') => void;
}

const ShopView: React.FC<ShopViewProps> = ({ stats, onBuyItem }) => {
  const OUTFITS: Outfit[] = [
    { id: 'pirate', name: 'Parrot Pirata', description: '¡Arrgh! Un estilo aventurero.', price: 200, currency: 'gems', imagePrompt: '', unlocked: stats.unlockedOutfits.includes('pirate') },
    { id: 'business', name: 'Parrot Ejecutivo', description: 'Listo para Wall Street.', price: 5.0, currency: 'gcd', imagePrompt: '', unlocked: stats.unlockedOutfits.includes('business') },
    { id: 'cool', name: 'Parrot Cool', description: 'Demasiado estilo para una app.', price: 150, currency: 'gems', imagePrompt: '', unlocked: stats.unlockedOutfits.includes('cool') },
    { id: 'wizard', name: 'Parrot Mago', description: 'La gramática es pura magia.', price: 10.0, currency: 'gcd', imagePrompt: '', unlocked: stats.unlockedOutfits.includes('wizard') },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="bg-gradient-to-r from-pink-500 to-rose-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-[-20px] top-[-20px] text-[15rem] opacity-10 group-hover:rotate-12 transition-transform">🛍️</div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2">Bazar de Parrot</h2>
          <p className="text-rose-100 font-bold opacity-80">Personaliza tu experiencia y protege tu progreso.</p>
        </div>
      </header>

      <section className="space-y-6">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <span className="text-yellow-500">🛡️</span> Potenciadores de Racha
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">❄️</div>
               <div>
                 <h4 className="font-black text-gray-800">Protector de Racha</h4>
                 <p className="text-xs text-gray-400 font-bold">Salva tu racha si olvidas practicar un día.</p>
                 <p className="text-xs font-black text-blue-500 mt-1">Tienes: {stats.streakFreezes}</p>
               </div>
            </div>
            <button 
              onClick={() => onBuyItem('freeze', 50, 'gems', 'powerup')}
              className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-blue-100"
            >
              50 💎
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <span className="text-emerald-500">👕</span> Armario de Parrot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTFITS.map(outfit => (
            <div key={outfit.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex flex-col items-center text-center group">
               <div className="w-24 h-24 bg-gray-50 rounded-3xl mb-4 flex items-center justify-center text-5xl group-hover:rotate-6 transition-transform">
                 {outfit.id === 'pirate' ? '🏴‍☠️' : outfit.id === 'business' ? '👔' : outfit.id === 'cool' ? '🕶️' : '🧙‍♂️'}
               </div>
               <h4 className="font-black text-gray-800">{outfit.name}</h4>
               <p className="text-[10px] text-gray-400 font-bold mb-4">{outfit.description}</p>
               
               {outfit.unlocked ? (
                 <button 
                   onClick={() => onBuyItem(outfit.id, 0, 'gems', 'outfit')}
                   className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${stats.currentOutfit === outfit.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                 >
                   {stats.currentOutfit === outfit.id ? 'EQUIPADO' : 'EQUIPAR'}
                 </button>
               ) : (
                 <button 
                   onClick={() => onBuyItem(outfit.id, outfit.price, outfit.currency, 'outfit')}
                   className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-100"
                 >
                   {outfit.price} {outfit.currency === 'gems' ? '💎' : 'GCD'}
                 </button>
               )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopView;
