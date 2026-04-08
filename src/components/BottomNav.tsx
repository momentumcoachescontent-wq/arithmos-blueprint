import { motion } from "framer-motion";
import { Sun, Map, Compass, User } from "lucide-react";

export type Tab = "hoy" | "mapa" | "explorar" | "yo";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "hoy",     label: "Hoy",     icon: Sun },
  { id: "mapa",    label: "Mapa",    icon: Map },
  { id: "explorar",label: "Explorar",icon: Compass },
  { id: "yo",      label: "Yo",      icon: User },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </motion.div>
              <span
                className={`text-[10px] font-sans font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
