import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Completa tu email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onClose();
      navigate("/inicio");
    } catch (err: any) {
      if (err.message?.includes("Invalid login")) {
        setError("Email o contraseña incorrectos.");
      } else {
        setError(err.message || "Error iniciando sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass rounded-2xl p-8 w-full max-w-md shadow-2xl pointer-events-auto relative border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-sans uppercase tracking-widest text-primary">
                  Arithmos
                </span>
              </div>

              <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">
                Bienvenido de vuelta
              </h2>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                Accede a tu blueprint y continúa tu progreso.
              </p>

              <div className="space-y-4" onKeyDown={handleKey}>
                <div className="space-y-2">
                  <Label className="text-sm font-sans text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-sans text-muted-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 font-sans bg-red-500/10 px-4 py-2 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full glow-indigo group"
                >
                  {loading ? "Procesando..." : "Entrar"}
                  {!loading && (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground font-sans pt-1">
                  ¿No tienes cuenta?{" "}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      onClose();
                      navigate("/registro");
                    }}
                  >
                    Crear una gratis →
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
