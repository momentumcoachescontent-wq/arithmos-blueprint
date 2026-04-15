import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/AuthModal";
import { CosmicShell } from "@/ui/CosmicShell";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Index() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <CosmicShell particles particlePalette="violet">
      {/* Nav */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-6 backdrop-blur-sm border-b border-white/5 bg-black/10">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-serif text-white text-lg tracking-widest flex items-center gap-2"
        >
          <span className="text-violet-400">✦</span> ARITHMOS
        </motion.span>
        
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-[11px] uppercase tracking-widest font-bold text-white/40 hover:text-violet-300 transition-colors"
        >
          Log In
        </button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] uppercase tracking-[0.3em] font-bold text-violet-400">
            <Sparkles className="h-3 w-3" /> Acceso Exclusivo V3.2
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-6 italic lowercase leading-[1.1] tracking-tight text-white"
          style={{ fontFamily: "var(--cosm-font-display)" }}
        >
          ¿Operas a favor de tu ciclo <span className="text-violet-400">natural</span>, o en su contra?
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm md:text-lg text-white/50 max-w-xl mb-12 leading-relaxed font-sans"
        >
          Numerología determinista y Astrología aplicadas a decisiones de alto impacto. 
          Sincroniza tu energía con el pulso del cosmos y domina tu oscuridad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <Link
            to="/register"
            className="group relative flex items-center gap-3 px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-violet-400 hover:text-white transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
          >
            Descubrir mi Esencia
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
            30 días de regalo · Sin tarjeta · Sin compromiso
          </p>
        </motion.div>

        {/* Dynamic visual indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 text-white/20 text-xs tracking-tighter"
        >
          Desliza para ver más
        </motion.div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </CosmicShell>
  );
}
