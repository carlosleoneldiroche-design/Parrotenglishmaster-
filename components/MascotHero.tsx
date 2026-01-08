
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface MascotHeroProps {
  outfitId?: string;
}

const MascotHero: React.FC<MascotHeroProps> = ({ outfitId = 'default' }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const OUTFIT_DESCRIPTIONS: Record<string, string> = {
    'default': 'A friendly scholar green parrot with a small golden graduation cap.',
    'pirate': 'A pirate parrot wearing a black tricorn hat and an eye patch.',
    'business': 'A professional parrot wearing a tiny navy blue suit and a red tie.',
    'cool': 'A cool parrot with dark sunglasses and a backward baseball cap.',
    'wizard': 'A mystical parrot wearing a purple wizard hat with silver stars.',
  };

  const generateMascot = async () => {
    // Intentar cargar desde caché local
    const cacheKey = `parrot_mascot_${outfitId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setImageUrl(cached);
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const theme = OUTFIT_DESCRIPTIONS[outfitId] || OUTFIT_DESCRIPTIONS.default;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-quality 3D mascot illustration for ParrotAI. Friendly green parrot, ${theme} Pixar-style 3D render, soft studio lighting, white background. 4k resolution.` }],
        },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const b64 = `data:image/png;base64,${part.inlineData.data}`;
        setImageUrl(b64);
        localStorage.setItem(cacheKey, b64);
      }
    } catch (error) {
      console.error("Error generating mascot:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateMascot();
  }, [outfitId]);

  return (
    <div className="relative overflow-hidden rounded-[3rem] bg-white border-2 border-gray-100 shadow-xl aspect-square flex items-center justify-center">
      {isGenerating ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Personalizando...</p>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Parrot AI" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" />
      ) : (
        <span className="text-6xl">🦜</span>
      )}
    </div>
  );
};

export default MascotHero;
