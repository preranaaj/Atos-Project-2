import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    X,
    UserPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchAllUsers, deleteUser, fetchAdminStats, fetchPatients, fetchAppointments, fetchDoctors } from '../lib/api';

const AdminStat = ({ label, value, trend, trendType, icon: Icon, path }) => (
    <Link to={path || '#'} className="glass-card p-8 rounded-[2rem] clinical-shadow border-white/40 block hover:scale-[1.02] transition-transform">
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
    </Link>
);

const AdminCommand = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [uData, pData, sData, aData] = await Promise.all([
                fetchAllUsers(),
                fetchPatients(),
                fetchAdminStats(),
                fetchAppointments("all", "Admin")
            ]);
            setAllUsers(uData);
            setPatients(pData);
            setStats(sData);
            setAppointments(aData);
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
                <AdminStat label="Total Patients" value={stats?.patients || '--'} trend="12.5%" trendType="up" icon={Users} path="/patients" />
                <AdminStat label="Active Doctors" value={stats?.doctors || '--'} trend="4.2%" trendType="up" icon={Stethoscope} path="/doctors" />
                <AdminStat label="Queued Sessions" value={stats?.appointments || '--'} trend="8.1%" trendType="up" icon={Calendar} path="/appointments" />
                <AdminStat label="System Health" value={stats?.uptime || '--'} trend="Stable" trendType="up" icon={Activity} path="/audit-logs" />
            </div>

            {/* Main Operational Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Hospital Analytics Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Activity className="h-7 w-7 text-indigo-900" /> Hospital Analytics
                        </h3>
                    </div>

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 bg-indigo-50/30">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Clinical Load</p>
                            <h5 className="text-3xl font-black text-indigo-900">{patients.length} Active</h5>
                            <p className="text-[10px] font-bold text-indigo-400 mt-2">TOTAL REGISTERED</p>
                        </div>
                        <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 bg-rose-50/30 font-black">
                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2">Acuity Level</p>
                            <h5 className="text-3xl font-black text-rose-900">{patients.filter(p => p.status === 'Critical').length} Critical</h5>
                            <p className="text-[10px] font-bold text-rose-400 mt-2">HIGH RISK MONITORING</p>
                        </div>
                        <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 bg-amber-50/30">
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Avg. Age</p>
                            <h5 className="text-3xl font-black text-amber-700">
                                {patients.length > 0
                                    ? Math.round(patients.reduce((acc, p) => acc + (parseInt(p.age) || 0), 0) / patients.length)
                                    : '--'} Yrs
                            </h5>
                            <p className="text-[10px] font-bold text-amber-500 mt-2">DEMOGRAPHIC INTEL</p>
                        </div>
                        <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 bg-emerald-50/30">
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Personnel</p>
                            <h5 className="text-3xl font-black text-emerald-900">{allUsers.filter(u => u.role === 'Doctor').length} Staff</h5>
                            <p className="text-[10px] font-bold text-emerald-400 mt-2">ACTIVE CLINICIANS</p>
                        </div>
                    </div>

                    {/* Critical Patient Section */}
                    <div className="flex items-center justify-between mt-12">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <AlertCircle className="h-7 w-7 text-rose-600 animate-pulse" /> Critical Condition Monitor
                        </h3>
                    </div>

                    <div className="glass-card rounded-[2.5rem] clinical-shadow border-rose-100 overflow-hidden bg-white/40">
                        <table className="w-full text-left">
                            <thead className="bg-rose-50/50 border-b border-rose-100">
                                <tr>
                                    <th className="px-8 py-6 text-sm font-black text-rose-400 uppercase tracking-widest">Priority Patient</th>
                                    <th className="px-8 py-6 text-sm font-black text-rose-400 uppercase tracking-widest">Acuity Ward</th>
                                    <th className="px-8 py-6 text-sm font-black text-rose-400 uppercase tracking-widest">ML Risk</th>
                                    <th className="px-8 py-6 text-sm font-black text-rose-400 uppercase tracking-widest">Vitals</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50">
                                {patients.filter(p => p.status === 'Critical').length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-muted-foreground font-bold italic">
                                            Clear monitor. No critical acuity patients detected.
                                        </td>
                                    </tr>
                                )}
                                {patients.filter(p => p.status === 'Critical').map((patient) => (
                                    <tr key={patient.id} className="hover:bg-rose-50/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                                                <div>
                                                    <p className="font-black text-foreground">{patient.name}</p>
                                                    <p className="text-xs font-bold text-rose-500">{patient.condition}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-600">
                                            {patient.ward}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                                                    <div
                                                        className="h-full bg-rose-600"
                                                        style={{ width: `${(patient.ml_risk_score || 0.8) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-rose-600">{(patient.ml_risk_score || 0.8) * 100}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Link to={`/patients/${patient.id}`} className="text-xs font-black text-indigo-600 underline tracking-tighter hover:text-indigo-900">
                                                VIEW BIOMETRIC DATA
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Upcoming Appointments Section */}
                    <div className="flex items-center justify-between mt-12">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Calendar className="h-7 w-7 text-indigo-600" /> Upcoming Clinical Sessions
                        </h3>
                    </div>

                    <div className="glass-card rounded-[2.5rem] clinical-shadow border-white/40 overflow-hidden bg-white/40">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Instance Time</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Patient Identity</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Clinical Lead</th>
                                    <th className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-muted-foreground font-bold italic">
                                            No clinical sessions queued.
                                        </td>
                                    </tr>
                                )}
                                {appointments.slice(0, 5).map((apt) => (
                                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-700">{new Date(apt.date).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-bold text-indigo-400">{apt.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-foreground text-sm uppercase tracking-tight">{apt.patient_name || 'Legacy Patient'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Stethoscope className="h-3 w-3 text-slate-400" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{apt.doctor_name || 'Unassigned Staff'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest",
                                                apt.status === 'Confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Configuration Sidebar */}
                <div className="space-y-8">
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/40 clinical-shadow space-y-6">
                        <h4 className="text-lg font-black uppercase tracking-widest text-indigo-900 border-b-2 border-slate-50 pb-4 flex items-center justify-between">
                            Quick Controls <Settings className="h-5 w-5" />
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Add Patient', icon: UserPlus, path: '/patients' },
                                { label: 'Audit Log', icon: Shield, path: '/audit-logs' },
                                { label: 'Staff Registry', icon: Users, path: '/doctors' },
                                { label: 'System Analytics', icon: Activity, path: '/analytics' }
                            ].map((btn, i) => (
                                <Link
                                    key={i}
                                    to={btn.path}
                                    className="p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-slate-50 transition-all flex flex-col items-center gap-3 group"
                                >
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-100 transition-all">
                                        <btn.icon className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 group-hover:text-indigo-900 text-center">{btn.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-50/50 clinical-shadow border-indigo-100">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> System Status
                        </h4>
                        <p className="text-xs font-bold text-indigo-600 leading-relaxed">
                            All clinical nodes active. Real-time biometric sync: <span className="text-emerald-600 font-black tracking-widest uppercase">Operational</span>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AdminCommand;
