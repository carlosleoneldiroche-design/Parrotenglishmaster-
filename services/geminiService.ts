
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Exercise, PronunciationFeedback, UserGoal, SupportedLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (code: SupportedLanguage) => {
  const names: Record<string, string> = {
    es: 'Spanish', fr: 'French', pt: 'Portuguese', de: 'German', it: 'Italian', 
    zh: 'Chinese', ja: 'Japanese', hi: 'Hindi', ar: 'Arabic', ru: 'Russian',
    bn: 'Bengali', ur: 'Urdu', id: 'Indonesian', ko: 'Korean', vi: 'Vietnamese',
    tr: 'Turkish', te: 'Telugu', mr: 'Marathi', ta: 'Tamil', tl: 'Tagalog'
  };
  return names[code] || 'Spanish';
};

/**
 * Gemini 3 Pro: Video Understanding
 */
export const analyzeVideoContent = async (videoBase64: string, nativeLang: SupportedLanguage = 'es'): Promise<string> => {
  const langName = getLanguageName(nativeLang);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: videoBase64, mimeType: 'video/mp4' } },
          { text: `Analyze this video and provide a lesson in ${langName}. 
            1. Summarize what happens. 
            2. Extract 5 key English vocabulary words with their meanings in ${langName}. 
            3. Explain one interesting grammar point used in the video.
            Format clearly in Markdown.` }
        ]
      }
    ]
  });
  return response.text || "No se pudo analizar el video.";
};

export const generateLessonExercises = async (topic: string, goal?: UserGoal, nativeLang: SupportedLanguage = 'es'): Promise<Exercise[]> => {
  const goalContext = goal ? `The user's goal is ${goal}.` : "";
  const langName = getLanguageName(nativeLang);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 English learning exercises for a lesson titled "${topic}". ${goalContext}
    The user's native language is ${langName}. 
    - TRANSLATE: Provide a sentence in ${langName} for the user to translate to English.
    - EXPLANATIONS: All explanations and feedback must be in ${langName}.
    Include a mix of: TRANSLATE, MULTIPLE_CHOICE, SPEAKING, LISTENING.
    Return strictly JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['TRANSLATE', 'MULTIPLE_CHOICE', 'SPEAKING', 'LISTENING'] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            audioText: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ['id', 'type', 'question', 'correctAnswer']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse exercises", e);
    return [];
  }
};

export const transcribeAudio = async (audioBase64: string, nativeLang: SupportedLanguage = 'es'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
        { text: "Transcribe accurately exactly what is said. No preamble." }
      ]
    }
  });
  return response.text?.trim() || "";
};

export const analyzePronunciation = async (audioBase64: string, expectedText: string, nativeLang: SupportedLanguage = 'es'): Promise<PronunciationFeedback> => {
  const langName = getLanguageName(nativeLang);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
        { text: `Analyze the user's English pronunciation compared to: "${expectedText}". 
        Be specific. Identify which words were correct.
        For incorrect words, provide a phonemic tip in ${langName}.
        Return strictly JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          accuracy: { type: Type.STRING, enum: ['poor', 'fair', 'good', 'excellent'] },
          generalFeedback: { type: Type.STRING },
          wordAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                isCorrect: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING }
              },
              required: ['word', 'isCorrect']
            }
          }
        },
        required: ['score', 'accuracy', 'generalFeedback', 'wordAnalysis']
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { score: 0, accuracy: 'poor', generalFeedback: "Error de análisis.", wordAnalysis: [] };
  }
};

/**
 * Gemini 2.5 Flash TTS helper functions
 */
export const playPronunciation = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (err) {
    console.error("TTS Error:", err);
  }
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sr: number, ch: number) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / ch;
  const buffer = ctx.createBuffer(ch, frameCount, sr);
  for (let channel = 0; channel < ch; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * ch + channel] / 32768.0;
  }
  return buffer;
}
