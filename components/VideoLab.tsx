
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { analyzeVideoContent } from '../services/geminiService';

const VideoLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'generate' | 'analyze'>('generate');
  const [image, setImage] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const startAnalysis = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setAnalysisResult(null);
    setStatusMessage('Gemini 3 Pro analizando video...');
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeVideoContent(base64);
        setAnalysisResult(result);
        setIsProcessing(false);
      };
    } catch (err) {
      setStatusMessage('Error al analizar el video.');
      setIsProcessing(false);
    }
  };

  const generateVideo = async () => {
    if (!image) return;
    setIsProcessing(true);
    setVideoUrl(null);
    setStatusMessage('VEO 3.1 Iniciando generación...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image in a cinematic and fluid way',
        image: { imageBytes: base64Data, mimeType: 'image/png' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await videoResponse.blob();
      setVideoUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      setStatusMessage('Error en la generación de Veo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-white p-1.5 rounded-3xl border-2 border-gray-100 shadow-sm w-fit mx-auto">
        <button 
          onClick={() => setActiveMode('generate')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeMode === 'generate' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-purple-600'}`}
        >
          🎬 GENERAR VEO
        </button>
        <button 
          onClick={() => setActiveMode('analyze')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeMode === 'analyze' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600'}`}
        >
          🧠 ANALIZAR PRO
        </button>
      </div>

      {activeMode === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-gray-800">Animación con Veo</h3>
            <div 
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className="h-64 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-all overflow-hidden"
            >
              {image ? <img src={image} className="h-full w-full object-cover" /> : <span className="text-4xl">📸</span>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <textarea 
              className="w-full p-6 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-400 h-32 font-bold"
              placeholder="Describe el movimiento..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              onClick={generateVideo} 
              disabled={isProcessing || !image}
              className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 transition-all"
            >
              {isProcessing ? 'PROCESANDO...' : 'GENERAR VIDEO'}
            </button>
          </div>
          <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-sm flex items-center justify-center p-8 min-h-[500px]">
            {videoUrl ? <video src={videoUrl} controls autoPlay loop className="w-full rounded-2xl" /> : <div className="text-center text-gray-200"><span className="text-8xl mb-4 block">📽️</span><p className="font-black">Video Output</p></div>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-gray-800">Análisis Inteligente</h3>
            <p className="text-gray-400 font-bold">Sube un video para que Gemini 3 Pro extraiga lecciones, gramática y vocabulario.</p>
            <div 
              onClick={() => !isProcessing && videoInputRef.current?.click()}
              className="h-64 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all"
            >
              <span className="text-5xl mb-4">📹</span>
              <p className="font-black text-gray-400">{videoFile ? videoFile.name : 'Seleccionar archivo .mp4'}</p>
              <input type="file" ref={videoInputRef} className="hidden" accept="video/mp4" onChange={handleVideoUpload} />
            </div>
            <button 
              onClick={startAnalysis}
              disabled={isProcessing || !videoFile}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 transition-all"
            >
              {isProcessing ? 'ANALIZANDO...' : 'INICIAR ANÁLISIS PRO'}
            </button>
          </div>
          <div className="bg-white rounded-[3rem] border-2 border-gray-50 shadow-sm p-8 min-h-[500px] overflow-y-auto">
            {isProcessing && <div className="h-full flex flex-col items-center justify-center space-y-4"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="font-black text-indigo-500 animate-pulse">{statusMessage}</p></div>}
            {analysisResult ? (
              <div className="prose max-w-none text-gray-700">
                <h4 className="text-xl font-black text-indigo-600 mb-6">Insight del Tutor AI</h4>
                <div className="space-y-4 whitespace-pre-wrap font-bold leading-relaxed">{analysisResult}</div>
              </div>
            ) : !isProcessing && <div className="h-full flex items-center justify-center text-gray-200 font-black text-center"><p>Sube un video para ver el análisis de Gemini 3 Pro</p></div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLab;
