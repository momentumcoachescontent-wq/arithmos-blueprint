import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthTab("register"); setAuthOpen(true); };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Nav Header — sobrepuesta pero ligera */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-0 left-0 right-0 z-20 px-6 py-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-serif text-foreground text-sm tracking-wide">Arithmos</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={openLogin}
              className="text-muted-foreground hover:text-foreground text-sm font-sans"
            >
              Iniciar Sesión
            </Button>
            <Button
              size="sm"
              onClick={openRegister}
              className="glow-indigo font-sans text-sm"
            >
              Crear Cuenta
            </Button>
          </div>
        </motion.nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-[0.3em] text-bronze mb-8 font-sans font-medium"
          >
            Arithmos AI Strategist
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight mb-6 text-gradient-silver"
          >
            ¿Operas a favor de tu ciclo natural o en su contra?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light"
          >
            Transforma la incertidumbre en estrategia precisa. Numerología determinista
            aplicada a la toma de decisiones de alto impacto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={openRegister}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-medium glow-indigo"
            >
              Descubre tu Blueprint
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/onboarding")}
              className="text-muted-foreground hover:text-foreground px-6 py-6 text-sm font-sans"
            >
              Explorar sin cuenta →
            </Button>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}
