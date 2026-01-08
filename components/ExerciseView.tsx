
import React, { useState, useEffect, useRef } from 'react';
import { Exercise, PronunciationFeedback, SavedPhrase } from '../types';
import { playPronunciation, analyzePronunciation, transcribeAudio } from '../services/geminiService';

interface ExerciseViewProps {
  exercise: Exercise;
  onNext: (isCorrect: boolean) => void;
  onSave: (phrase: Omit<SavedPhrase, 'id' | 'timestamp' | 'masteryLevel'>) => void;
  isSaved: boolean;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({ exercise, onNext, onSave, isSaved }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSelectedOption(null);
    setAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setFeedback(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setActiveWordIdx(null);
    setShowHelp(false);
    
    if (exercise.type === 'LISTENING' || exercise.type === 'SPEAKING') {
      playPronunciation(exercise.audioText || exercise.correctAnswer || exercise.question);
    }
  }, [exercise]);

  const handleSaveClick = () => {
    onSave({ original: exercise.question, translation: exercise.correctAnswer });
    if (!isSaved) {
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    }
  };

  const handleCheck = () => {
    let correct = false;
    if (exercise.type === 'MULTIPLE_CHOICE') {
      correct = selectedOption === exercise.correctAnswer;
    } else if (exercise.type === 'SPEAKING') {
      correct = (feedback?.score || 0) >= 75; // Umbral de aprobación para voz
    } else {
      correct = answer.toLowerCase().trim().replace(/[.,!?;:]/g, "") === exercise.correctAnswer.toLowerCase().trim().replace(/[.,!?;:]/g, "");
    }
    
    setIsCorrect(correct);
    setIsChecked(true);
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setIsAnalyzing(true);
          try {
            if (exercise.type === 'SPEAKING') {
              const result = await analyzePronunciation(base64Data, exercise.question || exercise.correctAnswer);
              setFeedback(result);
            } else {
              const transcription = await transcribeAudio(base64Data);
              setAnswer(transcription);
            }
          } catch (err) {
            console.error(err);
            alert("Error al procesar el audio.");
          } finally {
            setIsAnalyzing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const getHelpText = () => {
    if (exercise.explanation) return exercise.explanation;
    const genericTips: Record<string, string> = {
      'TRANSLATE': 'Lee la oración y traduce al inglés.',
      'MULTIPLE_CHOICE': 'Elige la respuesta más natural.',
      'LISTENING': 'Escribe exactamente lo que oigas.',
      'SPEAKING': 'Pulsa en las palabras para escucharlas por separado. Luego graba la frase completa.',
      'ROLEPLAY': 'Responde de forma fluida al contexto dado.',
    };
    return genericTips[exercise.type] || 'Sigue las instrucciones.';
  };

  const renderContent = () => {
    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {exercise.options?.map((option) => (
              <button
                key={option}
                onClick={() => !isChecked && setSelectedOption(option)}
                className={`p-4 border-2 rounded-2xl text-lg font-bold transition-all ${
                  selectedOption === option 
                    ? 'border-blue-400 bg-blue-50 text-blue-500 shadow-[0_4px_0_0_#60a5fa]' 
                    : 'border-gray-200 hover:bg-gray-50 active:translate-y-1'
                } ${isChecked && option === exercise.correctAnswer ? 'border-green-500 bg-green-50 text-green-600' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'TRANSLATE':
      case 'LISTENING':
        return (
          <div className="mt-8 space-y-4">
            <div className="relative">
              <textarea
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl text-xl resize-none focus:outline-none focus:border-blue-400 transition-colors"
                placeholder={isAnalyzing ? "Escuchando..." : "Escribe aquí..."}
                value={answer}
                onChange={(e) => !isChecked && setAnswer(e.target.value)}
                disabled={isChecked || isAnalyzing}
              />
              <div className="absolute bottom-4 right-4">
                <button
                  onMouseDown={startVoiceInput}
                  onMouseUp={stopVoiceInput}
                  onTouchStart={startVoiceInput}
                  onTouchEnd={stopVoiceInput}
                  disabled={isChecked || isAnalyzing}
                  className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <span className="text-xl">🎙️</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'SPEAKING':
        const words = (exercise.question || exercise.correctAnswer || "").split(" ");
        return (
          <div className="flex flex-col items-center gap-10 mt-8 mb-20 animate-in fade-in duration-500">
            {/* Sección de Escucha Activa */}
            <div className="w-full bg-blue-50/50 p-8 rounded-[3rem] border-2 border-blue-100 text-center relative overflow-hidden">
              <div className="absolute top-4 left-6 text-[10px] font-black text-blue-400 uppercase tracking-widest">Escucha a Parrot</div>
              <button 
                onClick={() => playPronunciation(exercise.question || exercise.correctAnswer)}
                className="mb-6 w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-[0_6px_0_0_#3b82f6] active:translate-y-1 active:shadow-none transition-all mx-auto"
              >
                🔊
              </button>
              
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">
                {words.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => playPronunciation(word.replace(/[.,!?;:]/g, ""))}
                    className="text-2xl font-black text-gray-700 hover:text-blue-500 hover:scale-110 transition-all cursor-pointer px-1 rounded-lg hover:bg-blue-100/50"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Haz clic en una palabra para oírla sola</p>
            </div>

            <div className="h-px w-24 bg-gray-100" />

            {/* Sección de Feedback Fonético */}
            {feedback ? (
              <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">🗣️</div>
                      <div>
                        <h3 className="font-black text-gray-800">Tu Pronunciación</h3>
                        <p className="text-xs text-gray-400 font-bold">Feedback por palabra</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl font-black ${feedback.score >= 80 ? 'text-green-500' : feedback.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {feedback.score}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 mb-8">
                    {feedback.wordAnalysis.map((item, idx) => (
                      <div key={idx} className="relative">
                        <button 
                          onClick={() => setActiveWordIdx(activeWordIdx === idx ? null : idx)}
                          className={`text-2xl font-black px-3 py-1.5 rounded-2xl transition-all ${
                            item.isCorrect 
                              ? 'text-green-600 bg-green-50 border-2 border-emerald-100' 
                              : 'text-red-500 bg-red-50 border-2 border-red-100 underline decoration-wavy underline-offset-8'
                          } ${activeWordIdx === idx ? 'ring-4 ring-blue-400/20 scale-110 z-10' : ''}`}
                        >
                          {item.word}
                        </button>
                        
                        {activeWordIdx === idx && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-gray-800 text-white text-[11px] p-4 rounded-[1.5rem] z-20 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45" />
                            <p className="font-black mb-1 flex items-center gap-2">
                              {item.isCorrect ? '🌟 ¡Perfecto!' : '🔧 Tip de Pronunciación'}
                            </p>
                            <p className="opacity-90 leading-relaxed font-bold italic">{item.feedback || '¡Sigue así!'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 bg-gray-50 rounded-3xl border-2 border-gray-100 text-center">
                    <p className="text-sm text-gray-600 font-bold italic">
                      "{feedback.generalFeedback}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className={`absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-10 transition-all ${isRecording ? 'scale-150 opacity-20 animate-pulse' : 'scale-0'}`} />
                  <button 
                    onMouseDown={startVoiceInput}
                    onMouseUp={stopVoiceInput}
                    onTouchStart={startVoiceInput}
                    onTouchEnd={stopVoiceInput}
                    disabled={isAnalyzing || isChecked}
                    className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl transition-all relative ${
                      isRecording 
                        ? 'bg-red-500 scale-110' 
                        : isAnalyzing 
                          ? 'bg-gray-200 cursor-wait rotate-12' 
                          : 'bg-red-500 shadow-[0_10px_0_0_#ef4444] hover:bg-red-600 active:translate-y-1 active:shadow-none'
                    }`}
                  >
                    {isAnalyzing ? '✨' : '🎤'}
                  </button>
                </div>
                <p className={`text-xs font-black uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                  {isAnalyzing ? 'Parrot está evaluando...' : isRecording ? 'GRABANDO TU VOZ...' : 'Mantén para repetir'}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-full pt-10 pb-32">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-gray-800">
            {exercise.type === 'TRANSLATE' ? 'Traduce esta oración' : 
             exercise.type === 'MULTIPLE_CHOICE' ? 'Selecciona la correcta' :
             exercise.type === 'LISTENING' ? '¿Qué escuchaste?' : 'Escucha y Repite'}
          </h2>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-sm font-black hover:bg-blue-500 hover:text-white transition-all"
          >
            ?
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={handleSaveClick}
            className={`p-3 rounded-2xl border-2 transition-all ${isSaved ? 'bg-yellow-100 border-yellow-400 text-yellow-600' : 'bg-white border-gray-100 text-gray-300 hover:border-emerald-400 hover:text-emerald-400'}`}
          >
            {isSaved ? '🔖' : '📑'}
          </button>
          {showSaveToast && (
            <div className="absolute right-0 top-full mt-2 bg-yellow-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce whitespace-nowrap z-30">
              ¡Guardado!
            </div>
          )}
        </div>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-gray-800 text-white text-xs font-bold rounded-2xl animate-in fade-in slide-in-from-top-2">
          {getHelpText()}
        </div>
      )}
      
      {exercise.type !== 'SPEAKING' && (
        <div className="bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] mb-8 shadow-sm">
          <p className="text-2xl font-black text-gray-700 leading-relaxed">{exercise.question}</p>
        </div>
      )}

      <div className="flex-1">
        {renderContent()}
      </div>

      <div className={`fixed bottom-0 left-0 w-full p-6 bg-white border-t-2 transition-all duration-300 ${isChecked ? (isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300') : 'border-gray-100'} z-50`}>
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            {isChecked && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <span className={`text-2xl font-black block mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '¡Fantástico!' : 'Casi lo tienes...'}
                </span>
                {!isCorrect && exercise.type !== 'SPEAKING' && (
                  <p className="text-red-800 font-bold text-sm">Correcto: {exercise.correctAnswer}</p>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={isChecked ? () => onNext(isCorrect) : handleCheck}
            disabled={
              (!isChecked && exercise.type === 'MULTIPLE_CHOICE' && !selectedOption) ||
              (!isChecked && exercise.type === 'SPEAKING' && !feedback) ||
              (!isChecked && (exercise.type === 'TRANSLATE' || exercise.type === 'LISTENING') && !answer) ||
              isAnalyzing
            }
            className={`w-full md:w-auto px-16 py-5 rounded-[2rem] font-black text-xl text-white shadow-xl transition-all active:scale-95 ${
              isChecked 
                ? (isCorrect ? 'bg-green-500 shadow-[0_6px_0_0_#16a34a]' : 'bg-red-500 shadow-[0_6px_0_0_#dc2626]') 
                : (isAnalyzing || (!selectedOption && exercise.type === 'MULTIPLE_CHOICE') ? 'bg-gray-200 shadow-none' : 'bg-green-500 shadow-[0_6px_0_0_#16a34a]')
            }`}
          >
            {isChecked ? 'SIGUIENTE' : 'COMPROBAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseView;
