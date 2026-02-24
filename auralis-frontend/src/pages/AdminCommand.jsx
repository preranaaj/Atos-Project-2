import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Users,
    Stethoscope,
    Calendar,
    Shield,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Plus,
    Filter,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Trash2,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchAllUsers, deleteUser, fetchAdminStats } from '../lib/api';

const AdminStat = ({ label, value, trend, trendType, icon: Icon }) => (
    <div className="glass-card p-8 rounded-[2rem] clinical-shadow border-white/40">
        <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black",
                    trendType === 'up' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                    {trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{label}</p>
            <h4 className="text-4xl font-black text-foreground tracking-tighter">{value}</h4>
        </div>
    </div>
);

const AdminCommand = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [uData, sData] = await Promise.all([
                fetchAllUsers(),
                fetchAdminStats()
            ]);
            setAllUsers(uData);
            setStats(sData);
        } catch (err) {
            console.error("Failed to load admin registry:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you certain? User termination is irreversible.")) return;
        try {
            await deleteUser(userId);
            loadData();
        } catch (err) {
            alert("Termination failed.");
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-indigo-900 text-white rounded-2xl">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-foreground">
                            System Control
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground font-bold italic">
                        Enterprise Command Center. Authenticated as: <span className="text-indigo-600 font-black not-italic">{user?.name}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search clinical registry..."
                            className="pl-12 pr-6 py-4 w-72 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-bold"
                        />
                    </div>
                    <button className="p-4 bg-indigo-900 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                        <Plus className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStat label="Total Patients" value={stats?.patients || '--'} trend="12.5%" trendType="up" icon={Users} />
                <AdminStat label="Active Doctors" value={stats?.doctors || '--'} trend="4.2%" trendType="up" icon={Stethoscope} />
                <AdminStat label="Queued Sessions" value={stats?.appointments || '--'} trend="8.1%" trendType="up" icon={Calendar} />
                <AdminStat label="System Health" value={stats?.uptime || '--'} trend="Stable" trendType="up" icon={Activity} />
            </div>

            {/* Main Operational Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Users Management */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Users className="h-7 w-7 text-indigo-900" /> User Registry ({allUsers.length})
                        </h3>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                <Filter className="h-4 w-4" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] clinical-shadow border-white/40 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Identify</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Sync</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Access</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {allUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-muted-foreground font-bold italic">
                                            No authenticated users detected in registry.
                                        </td>
                                    </tr>
                                )}
                                {allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600">
                                                    {row.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground">{row.name}</p>
                                                    <p className="text-xs font-bold text-muted-foreground">{row.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                row.role === 'Doctor' ? "bg-indigo-100 text-indigo-600" :
                                                    row.role === 'Admin' ? "bg-amber-100 text-amber-600 border border-amber-200" :
                                                        "bg-slate-100 text-slate-600"
                                            )}>
                                                {row.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs font-bold text-slate-600">ENCRYPTED</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'LEGACY'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {row.role !== 'Admin' && (
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-3 hover:bg-rose-50 rounded-xl transition-all opacity-20 group-hover:opacity-100 text-rose-400 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Configuration Sidebar */}
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-900 clinical-shadow text-white">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-60 mb-6">Security Integrity</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-sm font-bold">Encrypted Backups</span>
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-sm font-bold">Auth Audit Logs</span>
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-indigo-800/50 rounded-2xl border border-rose-500/30">
                                <span className="text-sm font-bold">API Warning Logs</span>
                                <AlertCircle className="h-5 w-5 text-rose-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2.5rem] border-white/40 clinical-shadow space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-widest text-indigo-900 border-b-2 border-slate-50 pb-4 flex items-center justify-between">
                            Quick Controls <Settings className="h-5 w-5" />
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'New Service', icon: Plus },
                                { label: 'Audit Log', icon: Activity },
                                { label: 'User Roles', icon: Shield },
                                { label: 'Backup', icon: CheckCircle2 }
                            ].map((btn, i) => (
                                <button key={i} className="p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-slate-50 transition-all flex flex-col items-center gap-3 group">
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-100 transition-all">
                                        <btn.icon className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 group-hover:text-indigo-900">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommand;
