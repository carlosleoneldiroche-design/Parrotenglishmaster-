
import React from 'react';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress?: string;
  onConnectWallet: () => void;
  onOpenShare: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, walletAddress, onConnectWallet, onOpenShare, onLogout }) => {
  const navItems = [
    { id: 'learn', label: 'APRENDER', icon: '🏠' },
    { id: 'profile', label: 'MI PERFIL', icon: '👤' },
    { id: 'shop', label: 'TIENDA', icon: '🛍️' },
    { id: 'chat', label: 'CHATEAR', icon: '💬' },
    { id: 'live-talk', label: 'AI TALK', icon: '🎙️' },
    { id: 'video-lab', label: 'VIDEO LAB', icon: '🎬' },
    { id: 'wallet', label: 'WALLET', icon: '🪙' },
    { id: 'saved-phrases', label: 'REPASO', icon: '🔖' },
    { id: 'leaderboard', label: 'RANKING', icon: '🏆' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r-2 flex md:flex-col p-2 md:p-6 z-50">
      <div className="hidden md:flex items-center gap-3 mb-10 px-2">
        <Logo size="sm" />
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">PARROTAI</h1>
      </div>
      
      <nav className="flex md:flex-col flex-1 justify-around md:justify-start gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black transition-all whitespace-nowrap ${
              activeTab === item.id 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
              : 'hover:bg-gray-50 text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:inline text-sm uppercase tracking-wider">{item.label}</span>
          </button>
        ))}

        <button
          onClick={onOpenShare}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl font-black transition-all whitespace-nowrap text-purple-600 hover:bg-purple-50 group"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">🎁</span>
          <span className="hidden md:inline text-sm uppercase tracking-wider">INVITAR</span>
        </button>
      </nav>

      <div className="hidden md:block mt-6">
        {walletAddress ? (
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col gap-1 overflow-hidden">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">POLYGON CONNECTED</span>
            <span className="text-[11px] font-bold text-indigo-700 truncate">{walletAddress}</span>
          </div>
        ) : (
          <button 
            onClick={onConnectWallet}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-black rounded-2xl text-xs shadow-lg hover:scale-105 transition-all shadow-yellow-100"
          >
            CONECTAR WALLET
          </button>
        )}
      </div>
      
      <div className="hidden md:block mt-auto pt-6 border-t border-gray-100 space-y-4">
        <button 
          onClick={onLogout}
          className="w-full py-3 text-gray-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
        >
          <span>🚪</span> SALIR DE LA CUENTA
        </button>
        <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 text-center">Nivel A2 en camino</p>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
