import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionBoundaryProps {
  children: ReactNode;
  blurChildren?: boolean;
}

export function SubscriptionBoundary({ children, blurChildren = true }: SubscriptionBoundaryProps) {
  const { user } = useAuth();
  const { isPremium, isLoading } = useSubscription(user?.id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // If user is inside the 45-day trial or explicitly premium, bypass the boundary
  if (isPremium) {
    return <>{children}</>;
  }

  // FREEMIUM STATE (Paywall Boundary)
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden flex flex-col items-center justify-center">
      
      {/* Blurred Background Content (if any) */}
      {blurChildren && (
        <div className="absolute inset-0 select-none pointer-events-none" style={{ filter: "blur(12px) opacity(0.4)" }}>
          {children}
        </div>
      )}

      {/* Actual Paywall Modal */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 bg-black/60 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl max-w-sm w-[90%] text-center shadow-2xl"
        style={{
           boxShadow: "0 25px 50px -12px hsla(270, 80%, 50%, 0.25)"
        }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 mx-auto flex items-center justify-center mb-6 shadow-inner shadow-white/20">
          <Lock className="text-white w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-black text-white italic mb-2 tracking-tight" style={{ fontFamily: "var(--cosm-font-display)" }}>
          Tu Visión se ha Nublado
        </h3>
        
        <p className="text-sm font-sans text-white/70 mb-6 leading-relaxed">
          Has completado tu ciclo inicial de 45 días. Para continuar usando el Radar Social, Tarot Reels y Análisis Profundos, necesitas anclar tu frecuencia.
        </p>
        
        <button
          onClick={() => navigate("/paywall")}
          className="w-full relative group overflow-hidden bg-white text-black py-4 px-6 rounded-2xl font-sans font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Desbloquear Arithmos <Sparkles className="w-4 h-4" />
          </span>
          {/* Shine effect */}
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"></div>
        </button>

        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-6 font-bold">
          Modo Freemium Limitado
        </p>
      </motion.div>
    </div>
  );
}
