
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, LiveServerMessage, Modality } from "@google/genai";
import { UserGoal } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface TextChatProps {
  userGoal?: UserGoal;
}

type ChatTone = 'friendly' | 'formal' | 'encouraging' | 'neutral';

const TONES: Record<ChatTone, { label: string; icon: string; description: string; color: string }> = {
  friendly: { label: 'Amigable', icon: '😊', description: 'Cálido y casual con emojis', color: 'bg-emerald-500' },
  formal: { label: 'Formal', icon: '👔', description: 'Profesional y estructurado', color: 'bg-blue-500' },
  encouraging: { label: 'Motivador', icon: '🚀', description: 'Lleno de energía y apoyo', color: 'bg-purple-500' },
  neutral: { label: 'Neutral', icon: '⚖️', description: 'Directo y educativo', color: 'bg-gray-500' },
};

const SCENARIOS: Record<string, { label: string; icon: string; prompt: string; goals: string[] }> = {
  'restaurant': {
    label: 'En el Restaurante',
    icon: '🍔',
    prompt: 'You are a waiter at a popular restaurant. The user is a customer. Greet them and help them order.',
    goals: ['TRAVEL', 'CONVERSATION', 'PERSONAL']
  },
  'airport': {
    label: 'Control de Aduanas',
    icon: '🛂',
    prompt: 'You are a customs officer at an international airport. The user is a traveler. Ask about their trip and luggage.',
    goals: ['TRAVEL']
  },
  'office': {
    label: 'Reunión de Negocios',
    icon: '💼',
    prompt: 'You are a colleague in a professional office setting. The user is presenting a new project. Discuss the details professionally.',
    goals: ['WORK']
  },
  'interview': {
    label: 'Entrevista de Trabajo',
    icon: '👔',
    prompt: 'You are a hiring manager for a global tech company. The user is a candidate. Conduct a formal job interview.',
    goals: ['WORK', 'EXAMS']
  },
  'coffee': {
    label: 'Cafetería con amigos',
    icon: '☕',
    prompt: 'You are an old friend meeting the user at a coffee shop. Catch up on life and talk about future plans.',
    goals: ['CONVERSATION', 'PERSONAL']
  },
  'presentation': {
    label: 'Presentación Académica',
    icon: '🎓',
    prompt: 'You are a professor evaluating the user\'s academic presentation. Ask insightful questions about their research.',
    goals: ['EXAMS']
  }
};

const TextChat: React.FC<TextChatProps> = ({ userGoal }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<ChatTone>('friendly');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API Refs
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const filteredScenarios = Object.entries(SCENARIOS).filter(([_, s]) => 
    !userGoal || s.goals.includes(userGoal) || userGoal === 'PERSONAL'
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Clean up voice on unmount or scenario close
  useEffect(() => {
    return () => stopVoiceSession();
  }, []);

  const getSystemInstructions = () => {
    if (!activeScenario) return "";
    const scenario = SCENARIOS[activeScenario];
    const toneInstruction = {
      friendly: "Your tone is warm, causal, and uses emojis frequently. Be like a close friend.",
      formal: "Your tone is strictly professional, polite, and highly structured. Avoid emojis and slang.",
      encouraging: "Your tone is extremely enthusiastic and motivating. Use exclamations and celebrate every success.",
      neutral: "Your tone is objective, balanced, and focuses strictly on the information and corrections."
    }[selectedTone];

    return `${scenario.prompt} ${toneInstruction} Always respond in English. Keep responses short and conversational.`;
  };

  const startChat = async (key: string) => {
    setActiveScenario(key);
    setMessages([]);
    setIsTyping(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${getSystemInstructions()} If the user makes a mistake in text, gently correct them at the end of your message using a "Correction:" section.`,
      },
    });
    chatRef.current = chat;

    try {
      const response = await chat.sendMessage({ message: "Hello! Let's start our conversation." });
      setMessages([{ role: 'model', text: response.text || '' }]);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !chatRef.current || isTyping) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had a connection problem." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Voice Integration (Live API) ---
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startVoiceSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextOutRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { role: 'model', text }];
              });
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setIsVoiceActive(false);
          },
          onclose: () => setIsVoiceActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: getSystemInstructions(),
          outputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      alert("No se pudo acceder al micrófono para AI Talk.");
      setIsVoiceMode(false);
    }
  };

  const stopVoiceSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsVoiceActive(false);
    nextStartTimeRef.current = 0;
  };

  const toggleMode = () => {
    if (isVoiceMode) {
      stopVoiceSession();
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      // Mode will start via manual button press in the voice UI to ensure user is ready
    }
  };

  if (!activeScenario) {
    return (
      <div className="space-y-12 animate-in fade-in duration-500 pb-20">
        <header className="text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-800">Práctica de Conversación 💬</h2>
          <p className="text-gray-500 font-bold">Configura tu experiencia de inmersión total.</p>
        </header>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">1. Elige el tono del tutor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {(Object.entries(TONES) as [ChatTone, typeof TONES['friendly']][]).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelectedTone(key)}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 group shadow-sm active:scale-95 ${
                  selectedTone === key 
                    ? `border-emerald-500 bg-emerald-50 shadow-[0_4px_0_0_#10b981]` 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{t.icon}</span>
                <div>
                  <h4 className={`text-sm font-black ${selectedTone === key ? 'text-emerald-700' : 'text-gray-700'}`}>{t.label}</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-tight mt-1">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
        
        <section className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">2. Selecciona un escenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map(([key, s]) => (
              <button
                key={key}
                onClick={() => startChat(key)}
                className="p-8 bg-white border-2 border-gray-100 rounded-[2.5rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center group shadow-sm active:scale-95"
              >
                <span className="text-6xl group-hover:scale-125 transition-transform mb-4">{s.icon}</span>
                <h3 className="text-xl font-black text-gray-800">{s.label}</h3>
                <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">Empezar con tono {TONES[selectedTone].label}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-[3rem] border-2 border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div className={`p-6 border-b-2 border-gray-50 flex justify-between items-center ${TONES[selectedTone].color} bg-opacity-5`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="text-4xl">{SCENARIOS[activeScenario].icon}</span>
            <span className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
              {TONES[selectedTone].icon}
            </span>
          </div>
          <div>
            <h3 className="font-black text-gray-800 leading-tight">{SCENARIOS[activeScenario].label}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                selectedTone === 'friendly' ? 'text-emerald-600' :
                selectedTone === 'formal' ? 'text-blue-600' :
                selectedTone === 'encouraging' ? 'text-purple-600' : 'text-gray-600'
              }`}>
                Modo {TONES[selectedTone].label}
              </span>
              <button 
                onClick={toggleMode}
                className={`text-[9px] font-black px-3 py-1 rounded-full border-2 transition-all flex items-center gap-1.5 ${
                  isVoiceMode 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                    : 'bg-white border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-400'
                }`}
              >
                {isVoiceMode ? 'MODO CHAT ⌨️' : 'AI TALK 🎙️'}
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { stopVoiceSession(); setActiveScenario(null); }}
          className="text-gray-400 hover:text-red-500 font-black text-sm uppercase tracking-widest px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
        >
          Finalizar
        </button>
      </div>

      {!isVoiceMode ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-[2rem] font-bold leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-[0_4px_0_0_#059669]' 
                    : 'bg-white border-2 border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {m.text.split('\n').map((line, li) => (
                    <p key={li} className={line.startsWith('Correction:') ? 'mt-3 pt-3 border-t border-emerald-100/30 italic text-emerald-100 text-sm' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-gray-100 p-5 rounded-[2rem] rounded-bl-none shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t-2 border-gray-50 flex gap-4 items-center">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje en inglés..."
              disabled={isTyping}
              className="flex-1 p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold transition-all text-gray-700 shadow-inner"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                !inputValue.trim() || isTyping 
                  ? 'bg-gray-100 text-gray-300' 
                  : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95'
              }`}
            >
              ✈️
            </button>
          </form>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-indigo-50/20 text-center space-y-10">
          <div className="relative">
            {/* Background glowing rings */}
            <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isVoiceActive ? 'scale-150 animate-pulse' : 'scale-100 opacity-0'}`} />
            
            <div className={`w-56 h-56 rounded-full flex items-center justify-center text-9xl shadow-2xl relative bg-white border-4 transition-all duration-500 ${isVoiceActive ? 'border-indigo-500 scale-110 shadow-indigo-200' : 'border-gray-100 scale-100 shadow-gray-100'}`}>
              {SCENARIOS[activeScenario].icon}
              
              {/* Voice active indicator */}
              {isVoiceActive && (
                <div className="absolute -top-4 -right-4 flex gap-1 items-end h-12">
                   <div className="w-2 h-4 bg-indigo-500 rounded-full animate-[bounce_0.6s_infinite]" />
                   <div className="w-2 h-8 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite_0.1s]" />
                   <div className="w-2 h-6 bg-indigo-500 rounded-full animate-[bounce_0.7s_infinite_0.2s]" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-800">Parrot AI Talk</h2>
            <p className="text-gray-500 font-bold max-w-sm mx-auto leading-relaxed">
              {isVoiceActive 
                ? '¡Te escucho! Habla con naturalidad en inglés sobre este escenario.' 
                : 'Pulsa el micrófono para iniciar la conversación fluida.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-green-500 animate-ping' : 'bg-gray-300'}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {isVoiceActive ? 'SESIÓN ACTIVA' : 'MICRÓFONO LISTO'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <button 
              onClick={isVoiceActive ? stopVoiceSession : startVoiceSession}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white shadow-2xl transition-all active:scale-90 ${
                isVoiceActive 
                  ? 'bg-red-500 shadow-red-200 hover:bg-red-600' 
                  : 'bg-indigo-600 shadow-indigo-200 hover:scale-105 hover:bg-indigo-700'
              }`}
            >
              {isVoiceActive ? '⏹️' : '🎙️'}
            </button>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse">
              {isVoiceActive ? 'DETENER AI TALK' : 'CONECTAR VOZ'}
            </p>
          </div>

          {messages.length > 0 && messages[messages.length-1].role === 'model' && (
            <div className="w-full max-w-md p-6 bg-white/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-indigo-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 text-left">Transcripción en vivo</h4>
               <p className="text-sm font-bold text-gray-700 italic text-left leading-relaxed">
                 "{messages[messages.length-1].text}"
               </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { height: 16px; }
          50% { height: 32px; }
        }
      `}</style>
    </div>
  );
};

export default TextChat;
