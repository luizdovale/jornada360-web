import { motion, AnimatePresence } from "framer-motion";
import appIcon from "@/assets/app-icon2.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B2559] via-[#1D2946] to-[#705CF2] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Círculo de brilho pulsante */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-[#FCE300]/20 blur-3xl"
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Ícone com animação de zoom suave */}
        <motion.img
          src={appIcon}
          alt="Jornada 360"
          className="w-36 h-36 drop-shadow-2xl mb-6 relative z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.3,
          }}
        />

        {/* Nome do app */}
        <motion.h1
          className="text-4xl font-extrabold text-white tracking-wide z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Jornada 360
        </motion.h1>

        {/* Slogan */}
        <motion.p
          className="text-base text-gray-200 mt-2 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          Controle inteligente da sua jornada de trabalho
        </motion.p>

        {/* Fade-out automático */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3.5, duration: 0.8 }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </AnimatePresence>
  );
}