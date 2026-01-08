
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLogo = async () => {
    const cached = localStorage.getItem('parrot_logo_cached');
    if (cached) {
      setLogoUrl(cached);
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: 'Minimalist app icon logo for ParrotAI. Elegant head of a green parrot, vibrant emerald and gold colors. Modern flat vector style, white background.' }],
        },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const b64 = `data:image/png;base64,${part.inlineData.data}`;
        setLogoUrl(b64);
        localStorage.setItem('parrot_logo_cached', b64);
      }
    } catch (error) {
      console.error("Error generating logo:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateLogo();
  }, []);

  const sizeClasses = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-white shadow-md flex items-center justify-center border border-gray-100`}>
      {isGenerating ? (
        <div className="w-full h-full bg-gray-50 animate-pulse" />
      ) : logoUrl ? (
        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl">🦜</span>
      )}
    </div>
  );
};

export default Logo;
