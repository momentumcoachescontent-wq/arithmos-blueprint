import { Flame } from "lucide-react";

interface StreakWidgetProps {
  streak: number;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border">
      <Flame
        className={`h-4 w-4 ${streak >= 7 ? "text-amber-400" : streak >= 3 ? "text-orange-400" : "text-muted-foreground"}`}
      />
      <span className="text-sm font-sans font-semibold text-foreground tabular-nums">
        {streak}
      </span>
      <span className="text-xs font-sans text-muted-foreground hidden sm:inline">
        {streak === 1 ? "día" : "días"}
      </span>
    </div>
  );
}
