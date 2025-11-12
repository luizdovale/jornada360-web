import { useEffect, useState } from "react";
import appIconSplash from "@/assets/app-icon-splash.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center animate-fade-out">
      <img 
        src={appIconSplash} 
        alt="Jornada360" 
        className="w-28 h-28 mb-4 animate-scale-in"
      />
      <h1 className="text-3xl md:text-4xl font-bold text-white animate-slide-in-center">
        Jornada360
      </h1>
    </div>
  );
}