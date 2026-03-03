import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal, type PlanType } from "@/components/AuthModal";

const plans: { name: string; price: string; period: string; description: string; features: string[]; cta: string; featured: boolean; plan: PlanType }[] = [
  {
    name: "Freemium",
    price: "Gratis",
    period: "",
    description: "Tu primer Blueprint numerológico y un vistazo a tu arquitectura interna.",
    features: ["Cálculo de Camino de Vida", "Arquetipo principal", "1 lectura de prueba"],
    cta: "Comenzar Gratis",
    featured: false,
    plan: "freemium",
  },
  {
    name: "The Empowered Path",
    price: "$9.99",
    period: "/mes",
    description: "Estrategia numerológica completa con entregas diarias y soporte on-demand.",
    features: ["Daily Pulse automático", "Análisis de ciclos personales", "Logs de sincronicidad", "Soporte Discord prioritario", "Compatibilidad relacional"],
    cta: "Activar mi Path",
    featured: true,
    plan: "premium",
  },
  {
    name: "Team Plan B2B",
    price: "Custom",
    period: "",
    description: "Numerología aplicada a la dinámica de equipos y decisiones corporativas.",
    features: ["Blueprints de equipo", "Análisis de compatibilidad grupal", "Dashboard ejecutivo", "API de integración", "Onboarding dedicado"],
    cta: "Contactar Ventas",
    featured: false,
    plan: "team",
  },
];

export function PricingSection() {
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("freemium");

  const openAuth = (plan: PlanType) => {
    setSelectedPlan(plan);
    setAuthOpen(true);
  };

  return (
    <>
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm uppercase tracking-[0.3em] text-bronze mb-4 font-sans"
          >
            Planes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-serif text-center mb-20 text-gradient-silver"
          >
            Elige tu nivel de profundidad
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-xl p-8 flex flex-col ${plan.featured
                    ? "glass border-primary/30 glow-indigo"
                    : "glass"
                  }`}
              >
                {plan.featured && (
                  <span className="text-xs uppercase tracking-widest text-primary mb-4 font-sans font-medium">
                    Más popular
                  </span>
                )}
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-sans font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground text-sm mb-8 font-sans">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-secondary-foreground font-sans">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => openAuth(plan.plan)}
                  variant={plan.featured ? "default" : "outline"}
                  className={`w-full group ${plan.featured ? "glow-indigo" : "border-border text-foreground hover:bg-secondary"}`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab="register"
        selectedPlan={selectedPlan}
      />
    </>
  );
}
