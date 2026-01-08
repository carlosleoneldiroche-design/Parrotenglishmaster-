
import React, { useState } from 'react';
import Logo from './Logo';

interface AuthScreenProps {
  onAuthComplete: (username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('parrot_users') || '{}');

      if (mode === 'register') {
        if (users[username]) {
          setError('El nombre de usuario ya existe.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        users[username] = { password };
        localStorage.setItem('parrot_users', JSON.stringify(users));
        onAuthComplete(username);
      } else {
        if (!users[username] || users[username].password !== password) {
          setError('Usuario o contraseña incorrectos.');
          setIsLoading(false);
          return;
        }
        onAuthComplete(username);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#fcfcfc] z-[200] flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border-2 border-gray-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <Logo size="lg" />
        
        <h1 className="text-3xl font-black text-gray-800 mt-6 mb-2">ParrotAI</h1>
        <p className="text-gray-400 font-bold mb-8 text-center leading-relaxed">
          {mode === 'login' ? '¡Bienvenido de nuevo, Master!' : 'Crea tu cuenta y empieza a ganar crypto.'}
        </p>

        <div className="flex bg-gray-100 p-1 rounded-2xl w-full mb-8">
          <button 
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${mode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            LOGIN
          </button>
          <button 
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${mode === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            REGISTRO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Usuario</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-400 rounded-2xl outline-none font-bold transition-all text-gray-700"
              placeholder="p. ej. master_parrot"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-400 rounded-2xl outline-none font-bold transition-all text-gray-700"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 animate-in shake duration-300">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'CARGANDO...' : (mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR MI CUENTA')}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Learning Mining Protocol v2.1</p>
      </div>
    </div>
  );
};

export default AuthScreen;
