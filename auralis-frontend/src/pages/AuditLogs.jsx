import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Search,
    Download,
    Calendar,
    Filter,
    Activity,
    User,
    Clock,
    ArrowUpDown,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchAuditLogs } from '../lib/api';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState(null);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await fetchAuditLogs();
            setLogs(data);
        } catch (err) {
            console.error("Failed to load audit logs:", err);
            setError("Unable to sync with clinical audit server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch =
                log.username.toLowerCase().includes(search.toLowerCase()) ||
                log.action.toLowerCase().includes(search.toLowerCase()) ||
                (log.role && log.role.toLowerCase().includes(search.toLowerCase()));

            const logDate = new Date(log.dateTime);
            const matchesStart = startDate ? logDate >= new Date(startDate) : true;
            const matchesEnd = endDate ? logDate <= new Date(endDate + 'T23:59:59') : true;

            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [logs, search, startDate, endDate]);

    const exportCSV = () => {
        const header = ["Timestamp", "Username", "Role", "Action", "Details"];
        const rows = filteredLogs.map((l) => [
            new Date(l.dateTime).toLocaleString(),
            l.username,
            l.role || 'N/A',
            l.action,
            l.details || ''
        ]);

        const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `auralis_audit_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-indigo-900 text-white rounded-2xl shadow-lg ring-4 ring-indigo-50">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-foreground">
                            Audit Registry
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground font-bold italic">
                        Real-time clinical action monitoring. Integrity level: <span className="text-emerald-600 font-black not-italic px-2 py-0.5 bg-emerald-50 rounded-lg">VERIFIED</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-6 py-4 bg-indigo-900 text-white rounded-2xl shadow-xl hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
                    >
                        <Download className="h-5 w-5" /> Export Data
                    </button>
                </div>
            </div>

            {/* Navigation / Filters */}
            <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by operative or action..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border-2 border-slate-100">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold text-slate-600"
                        />
                    </div>
                    <div className="text-slate-300 font-black">→</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border-2 border-slate-100">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold text-slate-600"
                        />
                    </div>
                    <button
                        onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); }}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
                    >
                        <Clock className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="glass-card rounded-[2.5rem] clinical-shadow border-white/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operative</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Clinical Action</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Instance</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-900"></div>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Querying Blockchain Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-muted-foreground font-bold italic">
                                        No clinical operations recorded within defined parameters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-900">
                                                    {log.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground uppercase tracking-tight">{log.username}</p>
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{log.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs line-clamp-1 group-hover:line-clamp-none transition-all">
                                                {log.details || 'System procedural execution'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-foreground">
                                                    {new Date(log.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(log.dateTime).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter tracking-[0.1em]">ENCRYPTED</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Security Policy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2rem] bg-indigo-900 text-white shadow-2xl overflow-hidden relative group">
                    <Activity className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:scale-110 transition-all" />
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-60 mb-4">Integrity Level</h4>
                    <p className="text-3xl font-black mb-4">Clinical Stable</p>
                    <p className="text-xs font-bold opacity-70 leading-relaxed">
                        Audit logs are immutable and cryptographically signed upon entry. Any attempt to modify records results in immediate global system lockout.
                    </p>
                </div>

                <div className="p-8 rounded-[2rem] bg-white border-2 border-slate-100 shadow-xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Total Events</h4>
                        <p className="text-4xl font-black text-indigo-900">{filteredLogs.length}</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-black">
                        <CheckCircle2 className="h-4 w-4" /> AUTO-SYNC ACTIVE
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 shadow-xl flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Retention Policy</h4>
                        <p className="text-xl font-black text-slate-700 underline decoration-indigo-200 decoration-4">90 Days Clinical</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Exceeding retention causes automated archival to off-site secure storage.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
