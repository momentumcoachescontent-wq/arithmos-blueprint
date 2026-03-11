import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Save, CheckCircle2, AlertCircle, Loader2, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppConfig } from "@/hooks/useAppConfig";

const CURRENCIES = [
    { value: "USD", label: "USD — Dólar Estadounidense ($)" },
    { value: "MXN", label: "MXN — Peso Mexicano ($)" },
    { value: "EUR", label: "EUR — Euro (€)" },
    { value: "COP", label: "COP — Peso Colombiano ($)" },
    { value: "ARS", label: "ARS — Peso Argentino ($)" },
];

export function AdminPricingTab() {
    const { config, isLoading, updateConfig } = useAppConfig();
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("");
    const [ctaLabel, setCtaLabel] = useState("");
    const [stripePriceId, setStripePriceId] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: "ok" | "err" } | null>(null);
    const [initialized, setInitialized] = useState(false);

    // Initialize local state from fetched config (once)
    if (!isLoading && !initialized) {
        setPrice(config.premium_price);
        setCurrency(config.premium_currency);
        setCtaLabel(config.premium_cta_label);
        setStripePriceId(config.premium_stripe_price_id);
        setInitialized(true);
    }

    const handleSave = async () => {
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            setStatus({ message: "Ingresa un precio válido mayor a 0.", type: "err" });
            return;
        }
        setSaving(true);
        setStatus(null);
        try {
            await updateConfig({
                premium_price: price,
                premium_currency: currency,
                premium_cta_label: ctaLabel,
                premium_stripe_price_id: stripePriceId,
            });
            setStatus({ message: "¡Configuración de precio guardada correctamente!", type: "ok" });
            setTimeout(() => setStatus(null), 4000);
        } catch {
            setStatus({ message: "Error al guardar. Intenta de nuevo.", type: "err" });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-16 text-muted-foreground animate-pulse font-sans">
                Cargando configuración de precios...
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2 mb-1">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Pricing & Offer Engine
                </h2>
                <p className="text-muted-foreground font-sans text-sm">
                    Ajusta el precio, moneda y texto del botón sin necesidad de re-deploy. Los cambios se reflejan en tiempo real para todos los usuarios.
                </p>
            </div>

            {/* Current Preview */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border-border"
            >
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-4">
                    Vista Previa Actual (en UpgradeModal)
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-foreground">
                        {config.premium_currency === "USD" ? "$" : config.premium_currency === "EUR" ? "€" : "$"}
                        {config.premium_price}
                    </span>
                    <span className="text-muted-foreground font-sans text-sm">/ mes · {config.premium_currency}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold font-sans">
                    {config.premium_cta_label}
                </div>
            </motion.div>

            {/* Edit Form */}
            <div className="glass rounded-2xl p-6 border-border space-y-5">
                <p className="text-sm font-sans font-semibold text-foreground">Editar Configuración</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground font-sans flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" /> Precio
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="9.99"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground font-sans flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" /> Moneda
                        </Label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-sans ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-sans">Texto del Botón CTA</Label>
                    <Input
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="Activar Premium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-sans">Stripe Price ID (API)</Label>
                    <Input
                        value={stripePriceId}
                        onChange={(e) => setStripePriceId(e.target.value)}
                        placeholder="price_..."
                    />
                    <p className="text-[10px] text-muted-foreground font-sans mt-1">
                        Asegúrate de que este ID corresponda al producto configurado en Stripe Dashboard.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto"
                >
                    {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
                    ) : (
                        <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>
                    )}
                </Button>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 text-sm font-sans px-4 py-2 rounded-lg ${status.type === "ok"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        {status.type === "ok" ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        {status.message}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
