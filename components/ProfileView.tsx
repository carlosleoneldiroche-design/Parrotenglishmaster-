
import React from 'react';
import { UserStats, Achievement, ActivityDay } from '../types';

interface ProfileViewProps {
  stats: UserStats;
}

const ProfileView: React.FC<ProfileViewProps> = ({ stats }) => {
  const maxXP = Math.max(...stats.activityHistory.map(d => d.xp), 1);
  
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-white shadow-lg">
            🦜
          </div>
          <h2 className="text-2xl font-black text-gray-800">Master Learner</h2>
          <p className="text-sm font-bold text-gray-400">Desde: Marzo 2024</p>
          <div className="mt-6 flex gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Nivel {stats.level}</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{stats.streak} Días de Racha</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Actividad Semanal (XP)</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats.activityHistory.slice(-7).map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex flex-col justify-end h-full">
                   <div 
                    className="w-full bg-emerald-500 rounded-t-xl transition-all duration-1000 group-hover:bg-emerald-400"
                    style={{ height: `${(day.xp / maxXP) * 100}%` }}
                   >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                       {day.xp} XP
                     </div>
                   </div>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="bg-white p-10 rounded-[3rem] border-2 border-gray-50 shadow-sm">
        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <span className="text-yellow-500 text-2xl">🏆</span> Vitrina de Logros
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.achievements.map(ach => (
            <div 
              key={ach.id} 
              className={`p-6 rounded-[2.5rem] border-2 transition-all text-center flex flex-col items-center gap-3 relative overflow-hidden group ${
                ach.isUnlocked 
                ? 'bg-yellow-50 border-yellow-200 shadow-yellow-100 shadow-lg' 
                : 'bg-gray-50 border-gray-100 grayscale opacity-60'
              }`}
            >
              {ach.isUnlocked && (
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              )}
              <span className="text-5xl mb-2 group-hover:scale-125 transition-transform duration-500">{ach.icon}</span>
              <h4 className="text-sm font-black text-gray-800 leading-tight">{ach.title}</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-tight">{ach.description}</p>
              
              {!ach.isUnlocked && (
                <div className="w-full mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(ach.progress/ach.target)*100}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-gray-400 mt-1 block uppercase">{ach.progress}/{ach.target}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Resumen de Vocabulario</h3>
            <p className="text-indigo-100 text-sm font-bold opacity-80 mb-6">Has aprendido 142 palabras esta semana.</p>
            <div className="flex gap-4">
               <div className="text-center">
                 <span className="text-3xl font-black">84%</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Retención</p>
               </div>
               <div className="w-px h-10 bg-white/20 self-center" />
               <div className="text-center">
                 <span className="text-3xl font-black">12</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Nuevos Modismos</p>
               </div>
            </div>
          </div>
          <span className="absolute -right-4 -bottom-4 text-[10rem] opacity-10 group-hover:rotate-12 transition-transform">📚</span>
        </div>

        <div className="bg-emerald-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Fluidez Social</h3>
            <p className="text-emerald-100 text-sm font-bold opacity-80 mb-6">Tu pronunciación ha mejorado un 15% este mes.</p>
            <button className="px-6 py-2 bg-white text-emerald-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">Ver Detalles Fonéticos</button>
          </div>
          <span className="absolute -right-4 -bottom-4 text-[10rem] opacity-10 group-hover:rotate-12 transition-transform">🗣️</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
