import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AuthModal } from "@/components/AuthModal";
import { AhaMoment } from "@/components/AhaMoment";
import { CosmicShell } from "@/ui/CosmicShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, ArrowLeft, Sparkles, MapPin, Clock } from "lucide-react";

interface AhaData {
  lifePathNumber: number;
  archetype: string;
  archetypeDescription: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { createProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [pageState, setPageState] = useState<"form" | "aha">("form");
  const [ahaData, setAhaData] = useState<AhaData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return setError("¿Cómo te llamas?");
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Ingresa un email válido");
      if (password.length < 8) return setError("La contraseña debe tener 8+ caracteres");
      setError(null);
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return setError("Tu fecha de nacimiento es clave");
    
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = authData?.user?.id;
      if (!userId || !authData.session) {
        setSuccess("✅ ¡Revisa tu email para confirmar! Luego inicia sesión.");
        setLoading(false);
        return;
      }

      // Create profile with NEW cosmic coordinates
      const profile = await createProfile(name.trim(), birthDate, userId, undefined, birthTime, birthPlace);

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: "trial",
        trial_ends_at: trialEndsAt.toISOString(),
      });

      setAhaData({
        lifePathNumber: profile.lifePathNumber,
        archetype: profile.archetype,
        archetypeDescription: profile.description,
      });
      setPageState("aha");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (pageState === "aha" && ahaData) {
    return <AhaMoment {...ahaData} onContinue={() => navigate("/inicio")} />;
  }

  return (
    <CosmicShell particles particlePalette="violet">
      {/* Mini Nav */}
      <nav className="relative z-20 flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/5">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate("/")}
          className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <span className="font-serif text-white/80 text-sm tracking-widest">ARITHMOS</span>
        <button onClick={() => setIsAuthModalOpen(true)} className="text-violet-400 text-xs font-bold">Log In</button>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-violet-400">Paso 1 de 2</span>
                <h1 className="text-2xl font-bold text-white font-serif">Comienza tu viaje</h1>
                <p className="text-white/40 text-xs">Necesitamos tus datos básicos para crear tu cuenta.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">Nombre</Label>
                  <Input 
                    placeholder="¿Cómo te decimos?" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">Email</Label>
                  <Input 
                    type="email"
                    placeholder="Tu mejor correo..." 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">Contraseña</Label>
                  <Input 
                    type="password"
                    placeholder="Mínimo 8 caracteres" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                  />
                </div>
                
                {error && <p className="text-rose-400 text-xs text-center font-bold italic">{error}</p>}

                <Button 
                  onClick={handleNext} 
                  className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold gap-2 text-sm shadow-[0_10px_20px_-5px_rgba(124,58,237,0.3)]"
                >
                  Siguiente paso <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-violet-400">Paso 2 de 2</span>
                <h1 className="text-2xl font-bold text-white font-serif">Tus Coordenadas</h1>
                <p className="text-white/40 text-xs">Esto es lo que nos permite calcular tu Blueprint con precisión quirúrgica.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">Fecha de Nacimiento</Label>
                  <Input 
                    type="date"
                    value={birthDate} 
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={today}
                    min="1920-01-01"
                    className="bg-white/5 border-white/10 text-white rounded-xl h-12 appearance-none color-scheme-dark"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Hora
                    </Label>
                    <Input 
                      type="time"
                      value={birthTime} 
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-12 appearance-none color-scheme-dark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30 ml-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Ciudad
                    </Label>
                    <Input 
                      placeholder="Ej. CDMX" 
                      value={birthPlace} 
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                    />
                  </div>
                </div>
                
                <p className="text-[10px] text-white/30 italic leading-relaxed px-1">
                  * La hora y lugar son vitales para calcular tu <span className="text-violet-400/60">Ascendente</span> y el clima astral de tu nacimiento.
                </p>

                {error && <p className="text-rose-400 text-xs text-center font-bold italic">{error}</p>}
                {success && <p className="text-emerald-400 text-xs text-center font-bold p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">{success}</p>}

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-violet-400 hover:text-white font-black gap-2 text-sm shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                >
                  {loading ? "Sincronizando..." : "Descubrir mi Esencia"}
                  {!loading && <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </CosmicShell>
  );
}
