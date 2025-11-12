import { useEffect, useState } from "react";
import appIcon from "@/assets/app-icon-splash.png"; // caminho atualizado para seu ícone

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 3000); // tempo total da splash (3s)
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B2559] via-[#1D2946] to-[#705CF2] overflow-hidden relative">
      {/* Círculo de brilho pulsante */}
      <div className="absolute w-64 h-64 rounded-full bg-[#FCE300]/20 blur-3xl animate-pulse-slow"></div>

      {/* Ícone central */}
      <img
        src={appIcon}
        alt="Jornada 360"
        className="w-36 h-36 mb-6 z-10 drop-shadow-2xl animate-zoom-in"
      />

      {/* Nome do app */}
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