
import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;
  const shareText = "¡Estoy minando GCD COIN mientras aprendo inglés en ParrotAI! 🦜💎 Únete y aprende conmigo:";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText} ${appUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      icon: '🟢', 
      color: 'bg-[#25D366]', 
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + appUrl)}` 
    },
    { 
      name: 'Twitter', 
      icon: '⚫', 
      color: 'bg-black', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}` 
    },
    { 
      name: 'Facebook', 
      icon: '🔵', 
      color: 'bg-[#1877F2]', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}` 
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ParrotAI - Aprende y Gana',
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.error("Error compartiendo:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-md p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-8 text-2xl text-gray-300 hover:text-gray-500 transition-colors">✕</button>
        
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">¡Invita a tus amigos!</h2>
        <p className="text-gray-500 font-bold mb-8">Comparte ParrotAI y ayuda a otros a dominar nuevos idiomas mientras ganan crypto.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {opt.icon}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{opt.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCopyLink}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white shadow-[0_4px_0_0_#059669]' : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'}`}
          >
            {copied ? '✅ ¡ENLACE COPIADO!' : '🔗 COPIAR ENLACE'}
          </button>
          
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-lg hover:bg-emerald-200 transition-all"
            >
              📱 MÁS OPCIONES
            </button>
          )}
        </div>

        <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">ParrotAI Social Referral v1.0</p>
      </div>
    </div>
  );
};

export default ShareModal;
