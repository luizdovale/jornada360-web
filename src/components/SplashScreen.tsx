import { useEffect, useState } from "react";
import appIcon from "@/assets/app-icon-splah.png"; // usa seu ícone padrão

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 3500); // splash mais longa e suave
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B2559] via-[#1D2946] to-[#705CF2] overflow-hidden relative animate-fade-in">
      {/* Fundo animado com brilho central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-[#FCE300]/25 blur-[100px] animate-pulse-slow"></div>
      </div>

      {/* Ícone */}
      <img
        src={appIcon}
        alt="Jornada 360"
        className="w-36 h-36 mb-6 z-10 drop-shadow-[0_0_25px_rgba(252,227,0,0.5)] animate-zoom-in"
      />

      {/* Nome */}
      <h1 className="text-4xl font-extrabold text-white tracking-wide z-10 animate-fade-in">
        Jornada 360
      </h1>

      {/* Slogan */}
      <p className="text-base text-gray-200 mt-2 z-10 animate-slide-up">
        Controle inteligente da sua jornada de trabalho
      </p>
    </div>
  );
}