
import React from 'react';
import { UserStats } from '../types';

interface WalletViewProps {
  stats: UserStats;
  onConnect: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ stats, onConnect }) => {
  const isConnected = !!stats.walletAddress;

  const miningHistory = [
    { id: 1, action: 'Lección: Fundamentos', amount: 5.0, date: 'Hoy, 14:20', type: 'Reward' },
    { id: 2, action: 'Lección: Saludos', amount: 2.5, date: 'Ayer, 09:15', type: 'Reward' },
    { id: 3, action: 'Challenge: Unit 1', amount: 12.0, date: '2 días atrás', type: 'Bonus' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
        <div className="absolute right-[-20px] top-[-20px] text-[12rem] opacity-10 group-hover:rotate-12 transition-transform">🪙</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">Learning Mining Pool</span>
            <h2 className="text-4xl font-black">Tu Billetera GCD</h2>
            <p className="text-yellow-100 font-bold opacity-80">Gana criptomonedas mientras dominas el inglés.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-inner flex flex-col items-center min-w-[200px]">
            <span className="text-xs font-black text-yellow-200 uppercase tracking-widest mb-1">Balance Total</span>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">{stats.gcdBalance.toFixed(2)}</span>
              <span className="text-lg font-black text-yellow-200">GCD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="text-yellow-500">⚡</span> Estado de Conexión
            </h3>

            {isConnected ? (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl">✅</div>
                    <div>
                      <p className="text-sm font-black text-emerald-800">Billetera Conectada</p>
                      <p className="text-[11px] font-bold text-emerald-500 truncate max-w-[200px]">{stats.walletAddress}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 bg-white px-3 py-1 rounded-full border border-emerald-100">POLYGON MAINNET</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-black text-sm transition-all border-2 border-transparent">
                    VER EN EXPLORER
                  </button>
                  <button className="py-4 bg-gray-50 hover:bg-gray-100 text-red-400 rounded-2xl font-black text-sm transition-all border-2 border-transparent">
                    DESCONECTAR
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="text-6xl mb-4">🔓</div>
                <p className="text-gray-500 font-bold max-w-xs mx-auto leading-relaxed">Conecta tu billetera para empezar a recibir recompensas On-Chain de GCD COIN.</p>
                <button 
                  onClick={onConnect}
                  className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-2xl text-lg shadow-xl hover:scale-105 transition-all shadow-yellow-100"
                >
                  CONECTAR BILLETERA
                </button>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Soportamos MetaMask, Phantom y WalletConnect</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm">
             <h3 className="text-xl font-black text-gray-800 mb-6">¿Qué es GCD COIN?</h3>
             <div className="space-y-4">
               <p className="text-gray-500 text-sm leading-relaxed">GCD COIN es el token nativo de ParrotAI en la red de <strong>Polygon</strong>. Es una moneda diseñada para incentivar la educación. Cada vez que aprendes, "minas" valor real que puedes usar dentro del ecosistema o intercambiar.</p>
               <div className="flex gap-4">
                 <div className="flex-1 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <span className="block text-lg mb-1">🎓</span>
                    <span className="block text-xs font-black text-yellow-800">Learn to Earn</span>
                 </div>
                 <div className="flex-1 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="block text-lg mb-1">🔗</span>
                    <span className="block text-xs font-black text-blue-800">On-Chain Rewards</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-gray-800">Historial de Minería</h3>
              <div className="space-y-4">
                {miningHistory.map(item => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center group hover:bg-yellow-50 transition-colors">
                    <div>
                      <p className="text-sm font-black text-gray-700">{item.action}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-yellow-600">+{item.amount.toFixed(1)} GCD</p>
                      <p className="text-[9px] font-black text-yellow-400 uppercase">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full text-center text-xs font-black text-gray-300 hover:text-yellow-500 uppercase tracking-widest transition-colors py-2">
                Ver todo el historial
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletView;
