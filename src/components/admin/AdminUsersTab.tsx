import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Users, Search, ShieldAlert, Award, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    role: string;
    subscription_status: string | null;
    created_at: string;
}

export function AdminUsersTab() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            if (data) setUsers(data as any[]);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Error al cargar la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'premium' ? 'freemium' : 'premium';
        const confirmMessage = newRole === 'premium'
            ? `¿Seguro que deseas promover este usuario a PREMIUM manualmente? No se le cobrará nada.`
            : `¿Seguro que deseas degradar este usuario a FREEMIUM manualmente? Perderá acceso a features pro.`;

        if (!window.confirm(confirmMessage)) return;

        setIsUpdating(userId);
        try {
            const { error } = await supabase.rpc('admin_update_user_role', {
                target_user_id: userId,
                new_role: newRole
            });

            if (error) throw error;

            toast.success(`Rol actualizado exitosamente a ${newRole.toUpperCase()}`);

            // Update local state to reflect UI change
            setUsers(users.map(u => u.user_id === userId ? {
                ...u,
                role: newRole,
                subscription_status: newRole === 'premium' ? 'active_manual' : 'cancelled'
            } : u));
        } catch (err: any) {
            console.error("Error updating role:", err);
            toast.error(err.message || "Error al actualizar el usuario. Asegúrate de ejecutar el script SQL.");
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'premium': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'admin': return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-sans">Cargando base de datos de usuarios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Gestión de Usuarios (Testing)
                    </h2>
                    <p className="text-muted-foreground font-sans text-sm mt-1">
                        Administra los roles del sistema y otorga capacidades Premium manualmente.
                    </p>
                </div>

                <div className="relative w-full md:w-64">
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

            <div className="glass rounded-2xl border-border overflow-hidden">
                {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-serif font-semibold text-foreground">Sin resultados</h3>
                        <p className="text-muted-foreground font-sans text-sm max-w-sm mt-2">
                            No se encontraron usuarios que coincidan con tu búsqueda.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm">
                            <thead className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Usuario</th>
                                    <th className="px-6 py-4 font-semibold">Rol Actual</th>
                                    <th className="px-6 py-4 font-semibold">Status de Facturación</th>
                                    <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                                    <th className="px-6 py-4 font-semibold text-right">Acción Testing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{user.name || 'Usuario Básico'}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {user.email || user.id.slice(0, 8) + '...'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize tracking-widest ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                                {user.subscription_status === 'active' && <Award className="h-3 w-3 text-emerald-500" />}
                                                {user.subscription_status === 'active_manual' && <ShieldAlert className="h-3 w-3 text-amber-500" />}
                                                {user.subscription_status || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground tabular-nums">
                                            {format(new Date(user.created_at), "d MMM, yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'admin' && (
                                                <Button
                                                    size="sm"
                                                    variant={user.role === 'premium' ? "outline" : "default"}
                                                    className={`text-xs h-8 ${user.role !== 'premium' ? 'bg-amber-500 hover:bg-amber-600 text-white border-none' : 'text-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50'}`}
                                                    onClick={() => handleUpdateRole(user.user_id, user.role)}
                                                    disabled={isUpdating === user.user_id}
                                                >
                                                    {isUpdating === user.user_id ? "Actualizando..." : (
                                                        <>
                                                            {user.role === 'premium' ? (
                                                                <><ArrowDownCircle className="h-3 w-3 mr-1" /> Remover Premium</>
                                                            ) : (
                                                                <><ArrowUpCircle className="h-3 w-3 mr-1" /> Dar Premium Manual</>
                                                            )}
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            {user.role === 'admin' && (
                                                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Master</span>
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
