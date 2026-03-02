import { motion } from "framer-motion";
import { Shield, Zap, MessageCircle } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Cálculo Determinista",
    subtitle: "Cero Alucinaciones",
    description: "Algoritmos matemáticos puros. Sin interpretaciones ambiguas ni respuestas genéricas de IA.",
  },
  {
    icon: Zap,
    title: "Insights Accionables",
    subtitle: "Estrategia, no misticismo",
    description: "Cada lectura traduce los números en decisiones concretas para tu negocio y liderazgo.",
  },
  {
    icon: MessageCircle,
    title: "Entrega Directa",
    subtitle: "Discord & WhatsApp",
    description: "Tu Daily Pulse y análisis estratégico llegan donde ya operas. Sin fricciones, sin apps extra.",
  },
];

export function ValueProposition() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm uppercase tracking-[0.3em] text-bronze mb-4 font-sans"
        >
          ¿Por qué Arithmos?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif text-center mb-20 text-gradient-silver"
        >
          Precisión sin precedentes
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-xl p-8 glass-hover group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-indigo transition-shadow">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-1">{v.title}</h3>
              <p className="text-sm text-bronze mb-3 font-sans">{v.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed font-sans">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
