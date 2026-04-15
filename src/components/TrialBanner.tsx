import { Zap, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Subscription } from "@/hooks/useSubscription";

interface TrialBannerProps {
  subscription: Subscription;
  daysLeft: number;
  onUpgrade: () => void;
}

export function TrialBanner({ subscription, daysLeft, onUpgrade }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || subscription.plan !== "trial") return null;

  const trialStart = new Date(subscription.trialStartedAt);
  const trialEnd = new Date(subscription.trialEndsAt);
  const totalDays = Math.round((trialEnd.getTime() - trialStart.getTime()) / 86400000);
  const daysElapsed = Math.max(1, totalDays - daysLeft);

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-6 border ${
        isUrgent
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-primary/5 border-primary/20"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Zap className={`h-4 w-4 shrink-0 ${isUrgent ? "text-amber-400" : "text-primary"}`} />
        <p className="text-sm font-sans text-foreground/80 truncate">
          <span className="font-semibold text-foreground">
            Día {daysElapsed} de tu regalo
          </span>
          {" · "}
          {daysLeft > 0 ? (
            <>
              <span className={isUrgent ? "text-amber-400 font-semibold" : ""}>
                Te quedan {daysLeft} {daysLeft === 1 ? "día" : "días"}
              </span>
            </>
          ) : (
            <span className="text-rose-400 font-semibold">Tu regalo ha terminado</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={onUpgrade}
          className="h-7 text-xs font-sans font-semibold px-3"
        >
          Activar Pro
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
