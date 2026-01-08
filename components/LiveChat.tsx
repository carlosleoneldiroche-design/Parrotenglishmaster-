
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

const SCENARIOS = [
  { id: 'general', icon: '🤖', label: 'Tutor General', prompt: 'You are a friendly English tutor.' },
  { id: 'airport', icon: '✈️', label: 'Aeropuerto', prompt: 'You are an airport customs officer. Be professional and firm.' },
  { id: 'restaurant', icon: '🍔', label: 'Restaurante', prompt: 'You are a waiter at a busy NYC restaurant. Be energetic and helpful.' },
  { id: 'interview', icon: '💼', label: 'Entrevista', prompt: 'You are a hiring manager at a tech company. Ask tough but fair questions.' },
  { id: 'church', icon: '⛪', label: 'Comunidad', prompt: 'You are a kind community leader welcoming a newcomer.' },
];

const LiveChat: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [status, setStatus] = useState('Listo para hablar');
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus('Conectando...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextInRef.current = new AudioContext({ sampleRate: 16000 });
      audioContextOutRef.current = new AudioContext({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => { setStatus('¡Adelante!'); setIsActive(true); },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
             }
          },
          onerror: () => setStatus('Error de conexión'),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `${scenario.prompt} Encourage the user and keep the role-play immersive.`,
          outputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
      
      // Send audio after session is connected
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

    } catch (err) { setStatus('Error de micrófono'); }
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (b: string) => new Uint8Array(atob(b).split("").map(c => c.charCodeAt(0)));

  const playAudio = async (data: string) => {
    if (!audioContextOutRef.current) return;
    const ctx = audioContextOutRef.current;
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    const buf = await decodeAudioData(decode(data), ctx, 24000, 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buf.duration;
  };

  const decodeAudioData = async (d: Uint8Array, ctx: AudioContext, sr: number, ch: number) => {
    const i16 = new Int16Array(d.buffer);
    const buf = ctx.createBuffer(ch, i16.length/ch, sr);
    for(let c=0; c<ch; c++) { let cd = buf.getChannelData(c); for(let i=0; i<cd.length; i++) cd[i] = i16[i*ch+c]/32768; }
    return buf;
  };

  const stopSession = () => { 
    if (sessionRef.current) sessionRef.current.close();
    streamRef.current?.getTracks().forEach(t => t.stop()); 
    setIsActive(false); 
    setStatus('Listo para hablar');
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-6">
      <header className="bg-white border-2 border-gray-100 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Escenario de Práctica</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {SCENARIOS.map(s => (
            <button 
              key={s.id}
              onClick={() => { setScenario(s); isActive && stopSession(); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[100px] ${scenario.id === s.id ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-xs font-bold ${scenario.id === s.id ? 'text-indigo-600' : 'text-gray-500'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 bg-white rounded-3xl border-2 border-gray-100 shadow-sm flex flex-col items-center justify-center p-10 text-center space-y-8">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center text-8xl shadow-2xl transition-all duration-500 ${isActive ? 'bg-green-100 scale-110 shadow-green-100' : 'bg-gray-50'}`}>
          {scenario.icon}
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800">Practicando en: {scenario.label}</h2>
          <p className="text-gray-500 mt-2 max-w-sm font-bold">La IA actuará según este contexto para darte una experiencia realista.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">{status}</p>
        </div>
        <button 
          onClick={isActive ? stopSession : startSession}
          className={`w-24 h-24 rounded-full text-4xl text-white shadow-xl transition-all active:scale-95 ${isActive ? 'bg-red-500 animate-pulse shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          {isActive ? '⏹️' : '🎙️'}
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
