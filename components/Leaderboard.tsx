
import React from 'react';

const MOCK_LEADERS = [
  { id: 1, name: 'Alex Rivera', xp: 12450, avatar: '🦊', rank: 1, trend: 'up' },
  { id: 2, name: 'Satoshi N.', xp: 11200, avatar: '🐱', rank: 2, trend: 'up' },
  { id: 3, name: 'Elena G.', xp: 9800, avatar: '🐰', rank: 3, trend: 'down' },
  { id: 4, name: 'Tú', xp: 1240, avatar: '🦜', rank: 14, trend: 'stable', isUser: true },
  { id: 5, name: 'Marco Polo', xp: 8500, avatar: '🐼', rank: 5, trend: 'up' },
  { id: 6, name: 'Sofia K.', xp: 7200, avatar: '🐨', rank: 6, trend: 'down' },
  { id: 7, name: 'John Doe', xp: 6800, avatar: '🦁', rank: 7, trend: 'stable' },
];

const Leaderboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="bg-gradient-to-br from-blue-600 to-indigo-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute right-[-20px] top-[-20px] text-[15rem] opacity-10 group-hover:rotate-12 transition-transform">🏆</div>
        <div className="relative z-10 space-y-4">
          <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Liga de Diamante</span>
          <h2 className="text-4xl font-black">Salón de la Fama</h2>
          <p className="text-blue-100 font-bold opacity-80 max-w-sm">Quedan 2 días para que finalice la temporada. ¡No bajes la guardia!</p>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800">Ranking Global</h3>
          <div className="flex gap-2">
            <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">ESTA SEMANA</span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {MOCK_LEADERS.map((leader) => (
            <div 
              key={leader.id} 
              className={`p-6 flex items-center gap-6 transition-colors hover:bg-gray-50/50 ${leader.isUser ? 'bg-emerald-50/50 border-y-2 border-emerald-100' : ''}`}
            >
              <div className="w-10 text-center">
                {leader.rank <= 3 ? (
                  <span className={`text-2xl ${leader.rank === 1 ? 'text-yellow-400' : leader.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`}>
                    {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="font-black text-gray-300">#{leader.rank}</span>
                )}
              </div>

              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">
                {leader.avatar}
              </div>

              <div className="flex-1">
                <h4 className={`font-black ${leader.isUser ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {leader.name} {leader.isUser && '(Tú)'}
                </h4>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{leader.xp.toLocaleString()} XP</span>
                   {leader.trend === 'up' && <span className="text-green-500 text-[10px] font-black">▲</span>}
                   {leader.trend === 'down' && <span className="text-red-500 text-[10px] font-black">▼</span>}
                </div>
              </div>

              <div className="text-right">
                {leader.isUser && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-100">ZONA DE ASCENSO</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-yellow-50 rounded-[2.5rem] border-2 border-yellow-100 flex items-center gap-6">
        <div className="text-4xl">⚡</div>
        <div>
          <h4 className="font-black text-yellow-800">Consejo Pro</h4>
          <p className="text-sm font-bold text-yellow-600 opacity-80">Completa una lección perfecta para recibir un multiplicador de XP x2 durante 15 minutos.</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
