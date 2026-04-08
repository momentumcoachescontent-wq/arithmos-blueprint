import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import {
    Users, Search, ShieldAlert, Award, Trash2, ArrowUpCircle,
    ArrowDownCircle, X, BookOpen, MessageSquare, Zap, Scale,
    Calendar, Filter, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    role: string;
    subscription_status: string | null;
    created_at: string;
    // enriched from subscriptions table
    subscription_plan?: string;
    trial_ends_at?: string;
}

interface UserActivity {
    journals: number;
    readings: number;
    sessions: number;
    diagnostics: number;
    lastActive: string | null;
}

export function AdminUsersTab() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "freemium" | "premium" | "admin">("all");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const [{ data: profiles, error }, { data: subs }] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
                supabase.from('subscriptions').select('user_id, plan, trial_ends_at'),
            ]);
            if (error) throw error;
            const subMap = new Map((subs || []).map((s: any) => [s.user_id, s]));
            const enriched = (profiles || []).map((p: any) => {
                const sub = subMap.get(p.user_id);
                return { ...p, subscription_plan: sub?.plan ?? null, trial_ends_at: sub?.trial_ends_at ?? null };
            });
            setUsers(enriched as any[]);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Error al cargar la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserActivity = async (userId: string) => {
        setIsLoadingActivity(true);
        try {
            const [
                { count: journals },
                { count: readings },
                { count: sessions },
                { count: diagnostics },
                { data: lastJournal }
            ] = await Promise.all([
                supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('readings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('coach_sessions' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('friction_diagnostics' as any).select('*', { count: 'exact', head: true }).eq('user_id', userId),
                supabase.from('journal_entries').select('created_at').eq('user_id', userId)
                    .order('created_at', { ascending: false }).limit(1),
            ]);
            setUserActivity({
                journals: journals || 0,
                readings: readings || 0,
                sessions: sessions || 0,
                diagnostics: diagnostics || 0,
                lastActive: lastJournal?.[0]?.created_at || null,
            });
        } catch (err) {
            console.error("Error fetching user activity:", err);
        } finally {
            setIsLoadingActivity(false);
        }
    };

    const handleSelectUser = (user: UserProfile) => {
        setSelectedUser(user);
        setUserActivity(null);
        fetchUserActivity(user.user_id);
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'premium' ? 'freemium' : 'premium';
        if (!window.confirm(`¿Cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) return;
        setIsUpdating(userId);
        try {
            const { error } = await supabase.rpc('admin_update_user_role', {
                target_user_id: userId,
                new_role: newRole
            });
            if (error) throw error;
            toast.success(`Rol actualizado a ${newRole.toUpperCase()}`);
            setUsers(users.map(u => u.user_id === userId ? {
                ...u, role: newRole,
                subscription_status: newRole === 'premium' ? 'active_manual' : 'cancelled'
            } : u));
            if (selectedUser?.user_id === userId) {
                setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
            }
        } catch (err: any) {
            toast.error(err.message || "Error al actualizar el usuario.");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteUser = async (user_id: string, name: string) => {
        const confirm1 = window.confirm(`⚠️ ¿Eliminar a "${name || 'este usuario'}" permanentemente?\n\nSe eliminarán su cuenta, perfil y todos sus datos.`);
        if (!confirm1) return;
        const confirm2 = window.confirm(`CONFIRMACIÓN FINAL. Esta acción NO se puede deshacer.`);
        if (!confirm2) return;
        setIsUpdating(user_id);
        try {
            const { error } = await (supabase as any).rpc('admin_delete_user', { target_user_id: user_id });
            if (error) throw error;
            toast.success("Usuario eliminado correctamente.");
            setUsers(users.filter(u => u.user_id !== user_id));
            if (selectedUser?.user_id === user_id) setSelectedUser(null);
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar el usuario.");
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'premium': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'admin': return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const roleCounts = {
        all: users.length,
        freemium: users.filter(u => u.role === 'freemium').length,
        premium: users.filter(u => u.role === 'premium').length,
        admin: users.filter(u => u.role === 'admin').length,
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-sans">Cargando usuarios...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Gestión de Usuarios &amp; Soporte
                    </h2>
                    <p className="text-muted-foreground font-sans text-sm mt-1">
                        {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm font-sans focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Role Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {(["all", "freemium", "premium", "admin"] as const).map(role => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all font-sans uppercase tracking-widest ${roleFilter === role
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/30'
                            }`}
                    >
                        {role === 'all' ? 'Todos' : role} ({roleCounts[role]})
                    </button>
                ))}
            </div>

            <div className="flex gap-4">
                {/* Users Table */}
                <div className={`glass rounded-2xl border-border overflow-hidden flex-1 min-w-0 ${selectedUser ? 'hidden md:block' : ''}`}>
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-serif font-semibold text-foreground">Sin resultados</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans text-sm">
                                <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-4 font-semibold">Usuario</th>
                                        <th className="px-4 py-4 font-semibold">Rol</th>
                                        <th className="px-4 py-4 font-semibold hidden lg:table-cell">
                                            <Clock className="h-3 w-3 inline mr-1" />Registro
                                        </th>
                                        <th className="px-4 py-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-secondary/10 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-foreground text-sm">{user.name || 'Usuario Básico'}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{user.email || user.user_id.slice(0, 12) + '...'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </div>
                                                {user.subscription_plan && (
                                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border capitalize ml-1 ${
                                                        user.subscription_plan === 'pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        user.subscription_plan === 'trial' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                        {user.subscription_plan}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                                                {format(new Date(user.created_at), "d MMM, yyyy", { locale: es })}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                {user.role !== 'admin' && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant={user.role === 'premium' ? "outline" : "default"}
                                                            className={`text-xs h-7 px-2 ${user.role !== 'premium' ? 'bg-amber-500 hover:bg-amber-600 text-white border-none' : 'text-foreground hover:text-rose-500'}`}
                                                            onClick={() => handleUpdateRole(user.user_id, user.role)}
                                                            disabled={isUpdating === user.user_id}
                                                            title={user.role === 'premium' ? "Degradar a Freemium" : "Promover a Premium"}
                                                        >
                                                            {isUpdating === user.user_id ? "..." : user.role === 'premium'
                                                                ? <><ArrowDownCircle className="h-3 w-3 mr-1" />Free</>
                                                                : <><ArrowUpCircle className="h-3 w-3 mr-1" />Pro</>
                                                            }
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                                            onClick={() => handleDeleteUser(user.user_id, user.name)}
                                                            disabled={isUpdating === user.user_id}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {user.role === 'admin' && (
                                                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Master</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* User Detail Panel */}
                <AnimatePresence mode="wait">
                    {selectedUser && (
                        <motion.div
                            key={selectedUser.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full md:w-80 flex-shrink-0 glass rounded-2xl border-border p-6 space-y-5 h-fit"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-serif font-semibold text-foreground">{selectedUser.name || 'Usuario Básico'}</h3>
                                    <p className="text-xs text-muted-foreground font-sans mt-0.5">{selectedUser.email || selectedUser.user_id.slice(0, 16) + '...'}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Role & Status */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getRoleBadge(selectedUser.role)}`}>
                                    {selectedUser.role === 'premium' && <Award className="h-3 w-3 mr-1" />}
                                    {selectedUser.role === 'admin' && <ShieldAlert className="h-3 w-3 mr-1" />}
                                    {selectedUser.role}
                                </div>
                                {selectedUser.subscription_plan && (
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                                        selectedUser.subscription_plan === 'pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        selectedUser.subscription_plan === 'trial' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                    }`}>
                                        {selectedUser.subscription_plan === 'trial' ? 'Trial 30d' : selectedUser.subscription_plan}
                                    </div>
                                )}
                                {selectedUser.trial_ends_at && selectedUser.subscription_plan === 'trial' && (
                                    <div className="text-xs text-muted-foreground font-sans">
                                        Vence {format(new Date(selectedUser.trial_ends_at), "d MMM", { locale: es })}
                                    </div>
                                )}
                            </div>

                            {/* Registration */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                                <Calendar className="h-3.5 w-3.5" />
                                Registrado {format(new Date(selectedUser.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                            </div>

                            {/* Activity Stats */}
                            <div>
                                <p className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground mb-3">Historial de Actividad</p>
                                {isLoadingActivity ? (
                                    <div className="space-y-2 animate-pulse">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-secondary/30 rounded-lg" />)}
                                    </div>
                                ) : userActivity && (
                                    <div className="space-y-2">
                                        {[
                                            { icon: BookOpen, label: "Entradas de Diario", value: userActivity.journals, color: "text-amber-400" },
                                            { icon: Zap, label: "Lecturas IA", value: userActivity.readings, color: "text-violet-400" },
                                            { icon: MessageSquare, label: "Sesiones Coach", value: userActivity.sessions, color: "text-primary" },
                                            { icon: Scale, label: "Radares Fricción", value: userActivity.diagnostics, color: "text-rose-400" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                                                    <span className="text-xs font-sans text-muted-foreground">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-bold font-serif text-foreground">{item.value}</span>
                                            </div>
                                        ))}
                                        {userActivity.lastActive && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans pt-1">
                                                <Clock className="h-3 w-3" />
                                                Última actividad {formatDistanceToNow(new Date(userActivity.lastActive), { addSuffix: true, locale: es })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedUser.role !== 'admin' && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <Button
                                        className="w-full text-xs h-9"
                                        variant={selectedUser.role === 'premium' ? "outline" : "default"}
                                        onClick={() => handleUpdateRole(selectedUser.user_id, selectedUser.role)}
                                        disabled={isUpdating === selectedUser.user_id}
                                    >
                                        {selectedUser.role === 'premium'
                                            ? <><ArrowDownCircle className="h-3.5 w-3.5 mr-2" />Degradar a Freemium</>
                                            : <><ArrowUpCircle className="h-3.5 w-3.5 mr-2" />Promover a Premium</>
                                        }
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-9 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                                        onClick={() => handleDeleteUser(selectedUser.user_id, selectedUser.name)}
                                        disabled={isUpdating === selectedUser.user_id}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Eliminar Usuario
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
