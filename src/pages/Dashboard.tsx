import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useStats";
import { useSubscription } from "@/hooks/useSubscription";
import { useStreak } from "@/hooks/useStreak";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { HoyTab } from "@/components/tabs/HoyTab";
import { MapaTab } from "@/components/tabs/MapaTab";
import { HerramientasTab } from "@/components/tabs/HerramientasTab";
import { YoTab } from "@/components/tabs/YoTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("hoy");

  const { user, logout } = useAuth();
  const { profile, fetchProfile, syncBlueprintIA } = useProfile();
  const { stats, fetchStats, awardXp } = useStats(user?.id);
  const { isPremium, isTrialExpired, subscription, daysLeftInTrial, redirectToCheckout } = useSubscription(user?.id);
  const { streak } = useStreak(user?.id);

  const hasAccess = profile?.role === "admin" || (isPremium && !isTrialExpired);
  const initialized = useRef(false);

  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success") {
      toast.success("¡Pago exitoso!", { description: "Tu plan Pro se ha activado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    } else if (status === "cancelled") {
      toast.error("Pago cancelado", { description: "El proceso no fue completado." });
      searchParams.delete("payment");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (!initialized.current) {
      const init = async () => {
        const p = await fetchProfile(user.id);
        if (!p) navigate("/onboarding");
        await fetchStats(user.id);
      };
      init();
      initialized.current = true;
    }
  }, [user, navigate, fetchProfile, fetchStats]);

  if (!user || !profile || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif text-2xl text-muted-foreground animate-pulse">Sintonizando tu frecuencia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Scrollable content — padding-bottom for fixed nav */}
      <div className="pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "hoy" && (
              <HoyTab
                profile={profile}
                stats={stats}
                streak={streak}
                awardXp={awardXp}
              />
            )}
            {activeTab === "mapa" && (
              <MapaTab
                profile={profile}
                syncBlueprintIA={syncBlueprintIA}
              />
            )}
            {activeTab === "explorar" && (
              <HerramientasTab
                userId={user.id}
                hasAccess={hasAccess}
              />
            )}
            {activeTab === "yo" && (
              <YoTab
                userId={user.id}
                profile={profile}
                stats={stats}
                subscription={subscription}
                isPremium={isPremium}
                isTrialExpired={isTrialExpired}
                daysLeftInTrial={daysLeftInTrial}
                redirectToCheckout={redirectToCheckout}
                logout={logout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
