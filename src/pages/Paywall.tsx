import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Infinity as InfinityIcon, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { redirectToCheckout, isLoading } = useSubscription(user?.id);

  const [activePlan, setActivePlan] = useState<"monthly" | "lifetime">("monthly");

  return (
    <div className="min-h-screen bg-[#05010a] text-white relative flex flex-col items-center">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-600/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <header className="w-full max-w-lg mx-auto px-6 py-6 relative z-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-sans font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retroceder
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-6 pb-24 relative z-10 flex flex-col flex-1 mt-8">
        
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex h-12 px-4 rounded-full bg-white/10 border border-white/20 items-center justify-center gap-2 mb-6 shadow-[0_0_40px_hsla(300,80%,50%,0.3)]"
          >
             <Sparkles className="text-pink-400 w-5 h-5" />
             <span className="font-bold text-sm tracking-widest uppercase text-white">Arithmos Premium</span>
          </motion.div>
          <h1 className="text-4xl xs:text-5xl font-black italic tracking-tighter leading-[1.1] mb-4" style={{ fontFamily: "var(--cosm-font-display)" }}>
             Trasciende al <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Siguiente Nivel</span>
          </h1>
          <p className="font-sans text-white/60 text-sm max-w-[280px] mx-auto leading-relaxed">
             Tus primeros 45 días fueron solo el comienzo. Desbloquea la claridad total.
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 mb-10">
          {[
            { icon: <Zap className="text-amber-400"/>, title: "Radar Cósmico Completo", desc: "Ver quién vibra en tu misma sintonía sin límites." },
            { icon: <Eye className="text-emerald-400"/>, title: "Tarot Reels Infinitos", desc: "Abre tantas cartas inmersivas como necesites en el día." },
            { icon: <InfinityIcon className="text-purple-400"/>, title: "Algoritmos sin Censura", desc: "Compatibilidad detallada 1-a-1 y reporte de bloqueos subconscientes." },
          ].map((feature, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
             >
               <div className="h-10 w-10 shrink-0 bg-white/10 rounded-full flex items-center justify-center">
                 {feature.icon}
               </div>
               <div>
                 <h4 className="font-bold font-sans text-sm text-white">{feature.title}</h4>
                 <p className="text-xs text-white/50">{feature.desc}</p>
               </div>
             </motion.div>
          ))}
        </div>

        {/* Pricing Toggles */}
        <div className="bg-white/5 p-1 rounded-2xl flex relative mb-8 border border-white/10">
           <button 
             onClick={() => setActivePlan("monthly")}
             className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all z-10 ${activePlan === "monthly" ? "text-white" : "text-white/40"}`}
           >
             Mensual
           </button>
           <button 
             onClick={() => setActivePlan("lifetime")}
             className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase rounded-xl transition-all z-10 ${activePlan === "lifetime" ? "text-white" : "text-white/40"}`}
           >
             Life-Time
           </button>
           
           <motion.div 
             layoutId="plan-selector"
             className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-xl pointer-events-none"
             animate={{ left: activePlan === "monthly" ? "4px" : "calc(50%)" }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
           />
        </div>

        {/* Price display */}
        <div className="text-center mb-8">
           <AnimatePresence mode="wait">
              <motion.div
                 key={activePlan}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
              >
                 <div className="flex items-start justify-center gap-1">
                    <span className="text-xl font-bold text-white/50 mt-1">$</span>
                    <span className="text-6xl font-black italic tracking-tighter" style={{ fontFamily: "var(--cosm-font-display)" }}>
                       {activePlan === "monthly" ? "7" : "199"}
                    </span>
                 </div>
                 <p className="text-sm tracking-widest uppercase text-white/40 font-bold mt-2">
                    {activePlan === "monthly" ? "USD / Mes. Cancela cuando quieras." : "USD / Un Solo Pago de por Vida."}
                 </p>
              </motion.div>
           </AnimatePresence>
        </div>

        <button
           onClick={redirectToCheckout}
           disabled={isLoading}
           className="w-full relative group overflow-hidden bg-white text-black h-16 rounded-2xl font-sans font-black text-sm uppercase tracking-[0.2em] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
           <span className="relative z-10">
             {isLoading ? "Conectando..." : "Convertirme en Premium"}
           </span>
           <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent -skew-x-12 -translate-x-[150%] xl:group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"></div>
        </button>

      </main>
    </div>
  );
}
