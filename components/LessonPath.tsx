
import React from 'react';
import { Lesson } from '../types';

interface LessonPathProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
}

const LessonPath: React.FC<LessonPathProps> = ({ lessons, onSelectLesson }) => {
  // Group lessons into units of 5 for themed regions
  const units = [];
  for (let i = 0; i < lessons.length; i += 5) {
    units.push(lessons.slice(i, i + 5));
  }

  const getUnitTheme = (index: number) => {
    const themes = [
      { name: 'Viajero Global', color: 'from-green-400 to-emerald-600', icon: '✈️' },
      { name: 'Business Pro', color: 'from-blue-400 to-indigo-600', icon: '💼' },
      { name: 'Academic Mastery', color: 'from-purple-400 to-pink-600', icon: '🎓' },
      { name: 'Social Fluency', color: 'from-yellow-400 to-orange-600', icon: '🗣️' },
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-12 px-4 select-none">
      {/* Background World Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-pulse">☁️</div>
        <div className="absolute top-80 right-20 text-5xl animate-bounce">☁️</div>
        <div className="absolute top-[600px] left-20 text-6xl">☁️</div>
      </div>

      {units.map((unit, unitIdx) => {
        const theme = getUnitTheme(unitIdx);
        return (
          <section key={unitIdx} className="mb-32 last:mb-0">
            {/* Region Header */}
            <div className={`mb-12 p-6 rounded-3xl bg-gradient-to-r ${theme.color} text-white shadow-xl relative overflow-hidden group`}>
              <div className="absolute -right-4 -top-4 text-8xl opacity-20 group-hover:scale-110 transition-transform duration-700">
                {theme.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Unidad {unitIdx + 1}</h3>
                <h2 className="text-2xl font-black">{theme.name}</h2>
                <div className="flex gap-2 mt-4">
                   {unit.map((l, idx) => (
                     <div key={idx} className={`h-1.5 flex-1 rounded-full ${l.status === 'completed' ? 'bg-white' : 'bg-white/30'}`} />
                   ))}
                </div>
              </div>
            </div>

            <div className="relative flex flex-col items-center">
              {/* Dynamic Connecting SVG Path for this unit */}
              <svg className="absolute top-0 w-full h-full pointer-events-none" style={{ zIndex: 0, minHeight: unit.length * 140 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d={unit.map((_, i) => {
                    const x = 50 + Math.sin((unitIdx * 5 + i) * 1.2) * 25;
                    const y = i * 140 + 60;
                    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
                  }).join(' ')}
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="16" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path 
                  d={unit.filter(l => l.status === 'completed' || (unit.indexOf(l) > 0 && unit[unit.indexOf(l)-1].status === 'completed')).map((_, i) => {
                    const x = 50 + Math.sin((unitIdx * 5 + i) * 1.2) * 25;
                    const y = i * 140 + 60;
                    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
                  }).join(' ')}
                  fill="none" 
                  stroke="#4ade80" 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-all duration-1000 shadow-lg"
                  filter="url(#glow)"
                />
              </svg>

              {unit.map((lesson, idx) => {
                const isCompleted = lesson.status === 'completed';
                const isAvailable = lesson.status === 'available';
                const isBoss = lesson.type === 'boss';
                const isStory = lesson.type === 'story';
                const globalIdx = unitIdx * 5 + idx;
                const offset = Math.sin(globalIdx * 1.2) * 25; // Matching SVG path logic

                return (
                  <div 
                    key={lesson.id} 
                    className="relative z-10 mb-[140px] last:mb-0 group cursor-pointer"
                    style={{ left: `${offset}%` }}
                    onClick={() => (isAvailable || isCompleted) && onSelectLesson(lesson)}
                  >
                    {/* Lesson Node */}
                    <div className={`
                      ${isBoss ? 'w-32 h-32' : isStory ? 'w-28 h-28' : 'w-24 h-24'} 
                      rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 shadow-[0_10px_0_0_#16a34a] hover:translate-y-[-4px] hover:shadow-[0_14px_0_0_#16a34a]' 
                        : isAvailable 
                          ? 'bg-blue-500 shadow-[0_10px_0_0_#2563eb] hover:translate-y-[-4px] hover:shadow-[0_14px_0_0_#2563eb] animate-bounce-slow' 
                          : 'bg-gray-200 shadow-[0_10px_0_0_#cbd5e1] cursor-not-allowed'}
                    `}>
                      <span className={`text-4xl ${!isAvailable && !isCompleted ? 'opacity-30 grayscale' : ''}`}>
                        {isBoss ? '👑' : isStory ? '📖' : isCompleted ? '✅' : '🌟'}
                      </span>
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg text-yellow-900 border-2 border-white">
                          MAX
                        </div>
                      )}
                    </div>

                    {/* Tooltip Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 pointer-events-none">
                      <div className={`
                        px-4 py-3 rounded-2xl border-2 whitespace-nowrap transition-all duration-300
                        ${isAvailable ? 'bg-white border-blue-400 opacity-100 scale-100 shadow-xl' : 'bg-white border-gray-100 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 shadow-md'}
                      `}>
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                              {isBoss ? 'DESAFÍO FINAL' : isStory ? 'HISTORIA' : `LECCIÓN ${globalIdx + 1}`}
                            </span>
                            <span className="text-sm font-extrabold text-gray-800">{lesson.title}</span>
                            <p className="text-[11px] font-bold text-gray-500 mt-1 max-w-[180px] text-center whitespace-normal leading-tight">
                              {lesson.description}
                            </p>
                         </div>
                      </div>
                      {/* Pointer arrow */}
                      <div className={`mx-auto w-3 h-3 rotate-45 border-l-2 border-t-2 bg-white -mt-[112px] transition-opacity ${isAvailable ? 'border-blue-400 opacity-100' : 'border-gray-100 opacity-0 group-hover:opacity-100'}`} style={{ marginTop: '-12px', transform: 'translateY(-100%) rotate(45deg)' }} />
                    </div>

                    {/* Locked Fog Overlay */}
                    {!isAvailable && !isCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl drop-shadow-md">🔒</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LessonPath;
