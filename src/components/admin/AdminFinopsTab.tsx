import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CreditCard, ArrowUpRight, Search, FileText, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentIntent {
    id: string;
    user_id: string;
    provider: 'stripe' | 'mercadopago';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    created_at: string;
    profiles: {
        name: string;
        email: string;
    };
}

export function AdminFinopsTab() {
    const [intents, setIntents] = useState<PaymentIntent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'failed'>('all');

    useEffect(() => {
        fetchIntents();
    }, []);

    const fetchIntents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_intents')
                .select(`
          *,
          profiles (name, email)
        `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            if (data) setIntents(data as any[]);
        } catch (err) {
            console.error("Error fetching payment intents:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredIntents = intents.filter(intent => {
        if (filter === 'all') return true;
        if (filter === 'pending') return intent.status === 'pending' || intent.status === 'cancelled';
        if (filter === 'failed') return intent.status === 'failed';
        return true;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'cancelled': return <Clock className="h-4 w-4 text-amber-500 opacity-70" />;
            case 'failed': return <XCircle className="h-4 w-4 text-rose-500" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Pagado';
            case 'pending': return 'Carrito Abandonado';
            case 'cancelled': return 'Cancelado (Timeout)';
            case 'failed': return 'Pago Fallido';
            default: return status;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'pending': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'cancelled': return "bg-amber-500/5 text-amber-500/70 border-amber-500/10";
            case 'failed': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "";
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-sans">Cargando registros transaccionales...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Flujo de Conversión
                    </h2>
                    <p className="text-muted-foreground font-sans text-sm mt-1">
                        Monitorea los intentos de pago y rastrea carritos abandonados.
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg border border-border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold transition-all ${filter === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Abandonos
                    </button>
                    <button
                        onClick={() => setFilter('failed')}
                        className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold transition-all ${filter === 'failed' ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Fallidos
                    </button>
                </div>
            </div>

            <div className="glass rounded-2xl border-border overflow-hidden">
                {filteredIntents.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-serif font-semibold text-foreground">No hay registros</h3>
                        <p className="text-muted-foreground font-sans text-sm max-w-sm mt-2">
                            No se encontraron intentos de pago bajo este filtro o aún no hay datos en el sistema.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm">
                            <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Usuario</th>
                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                    <th className="px-6 py-4 font-semibold">Monto / Plataforma</th>
                                    <th className="px-6 py-4 font-semibold">Fecha</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredIntents.map((intent) => (
                                    <tr key={intent.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{intent.profiles?.name || 'Usuario Básico'}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                {intent.profiles?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(intent.status)}`}>
                                                {getStatusIcon(intent.status)}
                                                {getStatusLabel(intent.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">
                                                ${intent.amount} {intent.currency.toUpperCase()}
                                            </div>
                                            <div className="text-xs text-muted-foreground capitalize">
                                                {intent.provider} Checkout
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground tabular-nums">
                                            {format(new Date(intent.created_at), "d MMM, HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(intent.status === 'pending' || intent.status === 'cancelled') && intent.profiles?.email && (
                                                <a
                                                    href={`mailto:${intent.profiles.email}?subject=¿Problemas%20con%20tu%20Activación%20Premium%20en%20Arithmos?`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    Enviar Mail de Rescate
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
