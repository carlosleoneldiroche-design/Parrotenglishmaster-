
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LessonPath from './components/LessonPath';
import ExerciseView from './components/ExerciseView';
import VideoLab from './components/VideoLab';
import LiveChat from './components/LiveChat';
import TextChat from './components/TextChat';
import MascotHero from './components/MascotHero';
import ProfileView from './components/ProfileView';
import Leaderboard from './components/Leaderboard';
import ShopView from './components/ShopView';
import AuthScreen from './components/AuthScreen';
import LessonCompletionModal from './components/LessonCompletionModal';
import WalletView from './components/WalletView';
import ShareModal from './components/ShareModal';
import Logo from './components/Logo';
import { Lesson, UserStats, Exercise, SavedPhrase, UserGoal, Mission, SupportedLanguage, Achievement, ActivityDay } from './types';
import { generateLessonExercises } from './services/geminiService';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Madrugador', description: 'Completa una lección antes de las 8 AM.', icon: '🌅', isUnlocked: true, progress: 1, target: 1 },
  { id: '2', title: 'Cripto-Estudiante', description: 'Gana tus primeros 10 GCD COINS.', icon: '🪙', isUnlocked: true, progress: 10, target: 10 },
];

const INITIAL_STATS: UserStats = {
  hearts: 5,
  streak: 0,
  streakFreezes: 0,
  gems: 50,
  xp: 0,
  dailyXP: 0,
  dailyGoal: 50,
  completedLessons: [],
  savedPhrases: [],
  level: 'A1',
  nativeLanguage: 'es',
  missions: [
    { id: '1', title: 'Aprende 3 palabras', target: 3, current: 0, reward: 20, completed: false },
    { id: '2', title: 'Meta diaria XP', target: 50, current: 0, reward: 50, completed: false },
  ],
  gcdBalance: 0,
  achievements: INITIAL_ACHIEVEMENTS,
  activityHistory: [{ date: new Date().toISOString().split('T')[0], xp: 0 }],
  currentOutfit: 'default',
  unlockedOutfits: ['default']
};

const INITIAL_LESSONS: Lesson[] = [
  { id: '1', title: 'Check-in y Seguridad', description: 'Vocabulario esencial para el aeropuerto.', exercises: [], status: 'available', type: 'regular' },
  { id: '2', title: 'Reservas en el Hotel', description: 'Cómo solicitar servicios.', exercises: [], status: 'locked', type: 'regular' },
  { id: '3', title: 'Restaurantes del Mundo', description: 'Dominar el arte de pedir comida.', exercises: [], status: 'locked', type: 'regular' },
  { id: '4', title: 'Superviviente Turístico', description: 'Demuestra que puedes moverte solo.', exercises: [], status: 'locked', type: 'boss' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('parrot_session'));
  const [activeTab, setActiveTab] = useState('learn');
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [lessonResults, setLessonResults] = useState<any | null>(null);
  const [setupStep, setSetupStep] = useState<'language' | 'goal' | 'complete'>('complete');

  useEffect(() => {
    if (currentUser) {
      const savedData = localStorage.getItem(`parrot_stats_${currentUser}`);
      if (savedData) setStats(JSON.parse(savedData));
      else setSetupStep('language');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(`parrot_stats_${currentUser}`, JSON.stringify(stats));
  }, [stats, currentUser]);

  // Recuperación automática de corazones (1 cada 2 horas)
  useEffect(() => {
    const timer = setInterval(() => {
      if (stats.hearts < 5) {
        setStats(prev => ({ ...prev, hearts: Math.min(5, prev.hearts + 1) }));
      }
    }, 2 * 60 * 60 * 1000); 
    return () => clearInterval(timer);
  }, [stats.hearts]);

  const handleAuthComplete = (username: string) => setCurrentUser(username);
  const handleLogout = () => { localStorage.removeItem('parrot_session'); setCurrentUser(null); };

  const startLesson = async (lesson: Lesson) => {
    if (stats.hearts <= 0) return alert("¡No tienes corazones! Espera a que se recarguen.");
    setIsLoading(true);
    try {
      const exercises = await generateLessonExercises(lesson.title, stats.goal, stats.nativeLanguage);
      setCurrentLesson({ ...lesson, exercises });
      setExerciseIndex(0);
      setCorrectCount(0);
    } catch (error) {
      alert("Error cargando lección.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextExercise = (isCorrect: boolean) => {
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    if (!isCorrect) setStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    else setCorrectCount(newCorrectCount);

    if (currentLesson && exerciseIndex < currentLesson.exercises.length - 1) {
      setExerciseIndex(prev => prev + 1);
    } else {
      finishLesson(newCorrectCount);
    }
  };

  const finishLesson = (finalCorrectCount: number) => {
    if (!currentLesson) return;
    const totalXP = finalCorrectCount * 15;
    const accuracy = finalCorrectCount / currentLesson.exercises.length;
    const totalGems = 20 + (accuracy === 1 ? 30 : 0);
    const gcdReward = accuracy >= 0.8 ? 2.5 : 0;

    setLessonResults({ total: currentLesson.exercises.length, correct: finalCorrectCount, xp: totalXP, gems: totalGems, gcd: gcdReward });
    
    setStats(prev => ({
      ...prev,
      streak: prev.streak + 1,
      gems: prev.gems + totalGems,
      xp: prev.xp + totalXP,
      dailyXP: prev.dailyXP + totalXP,
      gcdBalance: prev.gcdBalance + gcdReward
    }));

    setLessons(prev => prev.map((l, i) => {
      if (l.id === currentLesson.id) return { ...l, status: 'completed' as const };
      const currentIdx = prev.findIndex(item => item.id === currentLesson.id);
      if (i === currentIdx + 1) return { ...l, status: 'available' as const };
      return l;
    }));
    setCurrentLesson(null);
  };

  if (!currentUser) return <AuthScreen onAuthComplete={handleAuthComplete} />;

  if (setupStep !== 'complete') {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-10 overflow-y-auto">
        <div className="max-w-xl w-full text-center space-y-10">
          <Logo size="lg" />
          <h1 className="text-4xl font-black text-gray-800">Personaliza tu Parrot</h1>
          {setupStep === 'language' ? (
            <div className="grid grid-cols-2 gap-4">
              {['es', 'pt', 'fr', 'de'].map(lang => (
                <button key={lang} onClick={() => { setStats(s => ({ ...s, nativeLanguage: lang as any })); setSetupStep('goal'); }} className="p-8 border-2 border-gray-100 rounded-[2.5rem] hover:border-emerald-500 font-black uppercase tracking-widest transition-all">
                  {lang === 'es' ? '🇪🇸 Español' : lang === 'pt' ? '🇧🇷 Português' : lang === 'fr' ? '🇫🇷 Français' : '🇩🇪 Deutsch'}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {['TRAVEL', 'WORK', 'CONVERSATION'].map(goal => (
                <button key={goal} onClick={() => { setStats(s => ({ ...s, goal: goal as any })); setSetupStep('complete'); }} className="p-8 border-2 border-gray-100 rounded-[2.5rem] hover:border-emerald-500 font-black uppercase transition-all">
                  {goal === 'TRAVEL' ? '✈️ Viajar' : goal === 'WORK' ? '💼 Trabajo' : '🗣️ Fluidez'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentLesson) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {isLoading && <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center gap-6">
          <Logo size="lg" />
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-emerald-600 animate-pulse">CREANDO TU LECCIÓN...</p>
        </div>}
        <div className="max-w-4xl mx-auto w-full p-6 flex items-center gap-6">
          <button onClick={() => setCurrentLesson(null)} className="text-4xl text-gray-300">✕</button>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((exerciseIndex + 1) / (currentLesson.exercises.length || 5)) * 100}%` }} />
          </div>
          <div className="flex items-center gap-2 text-red-500 font-black text-xl">❤️ {stats.hearts}</div>
        </div>
        <div className="flex-1 p-4 md:p-10">
          <ExerciseView 
            exercise={currentLesson.exercises[exerciseIndex]} 
            onNext={handleNextExercise} 
            onSave={(p) => setStats(s => ({...s, savedPhrases: [{...p, id: Date.now().toString(), timestamp: Date.now(), masteryLevel: 0}, ...s.savedPhrases]}))} 
            isSaved={stats.savedPhrases.some(p => p.original === currentLesson.exercises[exerciseIndex]?.question)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fcfcfc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} walletAddress={stats.walletAddress} onConnectWallet={() => setStats(p => ({...p, walletAddress: "0x74...f4"}))} onOpenShare={() => setIsShareModalOpen(true)} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <TopBar stats={stats} onLanguageChange={(l) => setStats(s => ({...s, nativeLanguage: l}))} />
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          {activeTab === 'learn' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-center min-h-[300px]">
                <h2 className="text-4xl font-black mb-4">¡Hola, {currentUser}!</h2>
                <p className="text-emerald-100 font-bold">Racha de {stats.streak} días. Has ganado {stats.gcdBalance.toFixed(1)} GCD COINS.</p>
              </div>
              <div className="lg:col-span-4"><MascotHero outfitId={stats.currentOutfit} /></div>
              <div className="lg:col-span-12"><LessonPath lessons={lessons} onSelectLesson={startLesson} /></div>
            </div>
          )}
          {activeTab === 'chat' && <TextChat userGoal={stats.goal} />}
          {activeTab === 'live-talk' && <LiveChat />}
          {activeTab === 'profile' && <ProfileView stats={stats} />}
          {activeTab === 'shop' && <ShopView stats={stats} onBuyItem={(id, p, cur, type) => {
            if (type === 'outfit') setStats(s => ({...s, currentOutfit: id, unlockedOutfits: Array.from(new Set([...s.unlockedOutfits, id])), gems: cur === 'gems' ? s.gems - p : s.gems, gcdBalance: cur === 'gcd' ? s.gcdBalance - p : s.gcdBalance }));
          }} />}
          {activeTab === 'wallet' && <WalletView stats={stats} onConnect={() => {}} />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
      </main>
      {lessonResults && <LessonCompletionModal results={lessonResults} stats={stats} onClose={() => setLessonResults(null)} />}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};

export default App;
