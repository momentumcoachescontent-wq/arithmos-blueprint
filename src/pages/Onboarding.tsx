import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { createProfile, fetchProfile } = useProfile();
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Pre-cargar datos si existen
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const existingProfile = await fetchProfile(user.id);
        if (existingProfile) {
          setName(existingProfile.name);
          if (existingProfile.birthDate) {
            try {
              setDate(parseISO(existingProfile.birthDate));
            } catch (e) {
              console.error("Error parsing date:", e);
            }
          }
          setIsUpdateMode(true);
        }
      }
    };
    loadProfile();
  }, [user, fetchProfile]);

  const canSubmit = name.trim().length > 1 && date;

  const handleSubmit = async () => {
    if (!canSubmit || !date) return;
    setIsSubmitting(true);

    try {
      const dateStr = format(date, "yyyy-MM-dd");
      // El login asegura un ID de Supabase (vía Auth Anónimo si es necesario)
      const loggedInUser = await login({ id: user?.id || crypto.randomUUID(), name: name.trim() });
      await createProfile(name.trim(), dateStr, loggedInUser.id);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 text-sm font-sans"
        >
          <ArrowLeft className="h-4 w-4" />
          {user ? "Volver al Dashboard" : "Volver"}
        </button>

        <p className="text-sm uppercase tracking-[0.3em] text-bronze mb-4 font-sans">
          Tu Blueprint Personal
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-gradient-silver mb-3">
          {isUpdateMode ? "Actualiza tu Blueprint" : "Revela tu arquetipo"}
        </h1>
        <p className="text-muted-foreground mb-12 font-sans text-sm">
          {isUpdateMode
            ? "Ajusta tus parámetros para recalcular tu frecuencia estratégica con precisión."
            : "Solo necesitamos dos datos para calcular tu Camino de Vida con precisión determinista."}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-sans">
              Tu Nombre
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 font-sans">
              Fecha de Nacimiento Exacta
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 bg-secondary border-border font-sans",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona tu fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  disabled={(d) => d > new Date() || d < new Date("1920-01-01")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full h-12 text-base font-medium glow-indigo mt-4"
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Recalculando...
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                {isUpdateMode && <RotateCcw className="h-4 w-4" />}
                {isUpdateMode ? "Actualizar mi Blueprint" : "Revelar mi Arquetipo"}
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
