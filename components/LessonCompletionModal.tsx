
import React, { useEffect, useState } from 'react';
import { UserStats } from '../types';

interface LessonCompletionModalProps {
  stats: UserStats;
  results: {
    total: number;
    correct: number;
    xp: number;
    gems: number;
    gcd?: number;
  };
  onClose: () => void;
}

const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({ results, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const accuracy = Math.round((results.correct / results.total) * 100);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className={`bg-white rounded-[3rem] w-full max-w-lg p-10 text-center shadow-2xl transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}>
        <div className="relative mb-8">
          <div className="text-8xl animate-bounce">🦜</div>
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-2xl rotate-12 shadow-lg animate-pulse">
            ¡EXCELENTE!
          </div>
        </div>

        <h2 className="text-4xl font-black text-gray-800 mb-2">¡Lección completada!</h2>
        <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-sm">Cripto-Minería Educativa Activa</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-100">
            <span className="block text-2xl mb-1">🎯</span>
            <span className="block text-xl font-black text-emerald-600">{accuracy}%</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Precisión</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100">
            <span className="block text-2xl mb-1">⚡</span>
            <span className="block text-xl font-black text-blue-600">+{results.xp}</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Total XP</span>
          </div>
          <div className="bg-purple-50 p-4 rounded-3xl border-2 border-purple-100">
            <span className="block text-2xl mb-1">💎</span>
            <span className="block text-xl font-black text-purple-600">+{results.gems}</span>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">Gemas</span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-3xl border-2 border-yellow-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -top-1 -right-1 opacity-10 text-4xl group-hover:scale-150 transition-transform">🪙</div>
            <span className="block text-2xl mb-1">🪙</span>
            <span className="block text-xl font-black text-yellow-600">+{results.gcd?.toFixed(1) || '0.0'}</span>
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">GCD COIN</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 delay-500 ease-out" 
              style={{ width: `${accuracy}%` }} 
            />
          </div>
          {results.gcd && results.gcd > 0 ? (
            <p className="text-sm font-bold text-yellow-600 bg-yellow-50 py-2 px-4 rounded-full inline-block border border-yellow-100">
              💰 Has minado {results.gcd} GCD COIN con tu conocimiento.
            </p>
          ) : (
            <p className="text-sm font-bold text-gray-500">
              {accuracy === 100 ? "¡Puntuación perfecta! Eres una leyenda." : "¡Sigue así para ganar más GCD!"}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-10 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-[0_6px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all tracking-wide"
        >
          ¡CONTINUAR!
        </button>
      </div>
      
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute animate-ping opacity-20 bg-yellow-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonCompletionModal;
