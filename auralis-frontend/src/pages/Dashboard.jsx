import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, AlertTriangle, Clock, ArrowRight,
    User as UserIcon, Calendar, CheckCircle, XCircle,
    MoreHorizontal, Info, Clipboard, Timer, CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VitalsChart from '../components/VitalsChart';
import Timeline from '../components/Timeline';
import { fetchAllUsers, fetchPatients, fetchAppointments, updateAppointment, fetchPatientById } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Stethoscope } from 'lucide-react';

const StatCard = ({ title, value, label, icon: Icon, trend, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay }}
        className="glass-card p-8 rounded-[2rem] clinical-shadow relative overflow-hidden group hover:scale-105 transition-all duration-500"
    >
        <div className={`absolute -top-10 -right-10 p-24 opacity-5 ${color} rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-sm border border-white/20`}>
                <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend !== undefined && (
                <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${trend > 0 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50' : 'bg-rose-500/10 text-rose-600 border border-rose-200/50'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-4xl font-black text-foreground tracking-tighter mb-2">{value}</h3>
            <p className="text-base font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            {label && <p className="text-xs font-bold text-muted-foreground mt-3 opacity-60 uppercase tracking-widest">{label}</p>}
        </div>
    </motion.div>
);

const AppointmentModal = ({ appointment, onClose, onRefresh }) => {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancellationReason, setCancellationReason] = useState("");
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (appointment) {
            setLoading(true);
            fetchPatientById(appointment.patient_id)
                .then(setPatient)
                .finally(() => setLoading(false));
        }
    }, [appointment]);

    const handleAction = async (status) => {
        if (status === 'Cancelled' && !showCancelInput) {
            setShowCancelInput(true);
            return;
        }

        setIsSaving(true);
        try {
            await updateAppointment(appointment.id, {
                status,
                cancellation_reason: status === 'Cancelled' ? cancellationReason : null
            });
            onRefresh();
            onClose();
        } catch (err) {
            alert("Failed to update appointment: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!appointment) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50"
            >
                <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <span className="px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-widest border border-indigo-100 mb-4 inline-block">
                                Clinical Session Management
                            </span>
                            <h2 className="text-4xl font-black tracking-tighter text-foreground">Manage Appointment</h2>
                        </div>
                        <button onClick={onClose} className="p-4 rounded-2xl hover:bg-slate-100 transition-all text-slate-400">
                            <XCircle className="h-8 w-8" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Patient Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <UserIcon className="h-6 w-6 text-primary" /> Patient Synthesis
                            </h3>
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-20 bg-slate-100 rounded-3xl" />
                                    <div className="h-20 bg-slate-100 rounded-3xl" />
                                </div>
                            ) : (
                                <div className="glass-card p-6 rounded-[2rem] border-white/40 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Full Name</span>
                                        <span className="font-black text-foreground">{patient?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Age / Gender</span>
                                        <span className="font-black text-foreground">{patient?.age}y / {patient?.gender}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Core Condition</span>
                                        <span className="font-black text-indigo-600">{patient?.condition}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Clinical Status</span>
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter",
                                            patient?.status === 'Critical' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                        )}>{patient?.status}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Appointment Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <Timer className="h-6 w-6 text-primary" /> Session Parameters
                            </h3>
                            <div className="glass-card p-6 rounded-[2rem] border-white/40 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Date & Time</span>
                                    <span className="font-black text-foreground">{appointment.date} @ {appointment.time}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Current Status</span>
                                    <span className="font-black text-indigo-600 uppercase tracking-widest text-xs">{appointment.status}</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Patient Intelligence / Notes</span>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium italic text-slate-600">
                                        {appointment.notes || "No additional parameters provided by patient."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showCancelInput && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-10 p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100 space-y-4"
                        >
                            <label className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" /> Protocol for Cancellation
                            </label>
                            <textarea
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="State the clinical reasoning for session termination..."
                                className="w-full p-6 rounded-2xl border-2 border-rose-100 bg-white focus:border-rose-300 outline-none font-bold text-rose-900 h-32 no-scrollbar"
                            />
                        </motion.div>
                    )}
                </div>

                <div className="p-10 bg-slate-50/50 backdrop-blur-sm border-t border-white/50 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => handleAction('Approved')}
                        disabled={isSaving}
                        className="py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button
                        onClick={() => handleAction('Pending')}
                        disabled={isSaving}
                        className="py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <Clock className="h-4 w-4" /> Set Pending
                    </button>
                    <button
                        onClick={() => handleAction('Completed')}
                        disabled={isSaving}
                        className="py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Completed
                    </button>
                    <button
                        onClick={() => handleAction('Cancelled')}
                        disabled={isSaving}
                        className={cn(
                            "py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                            showCancelInput ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-white text-rose-600 hover:bg-rose-50 border-2 border-rose-100"
                        )}
                    >
                        <XCircle className="h-4 w-4" /> {showCancelInput ? "Confirm Cancel" : "Term. Session"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApt, setSelectedApt] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [patientsData] = await Promise.all([
                    fetchPatients()
                ]);
                setPatients(patientsData);

                if (user?.role === 'Doctor') {
                    const aptsData = await fetchAppointments(user.id, 'Doctor');
                    setAppointments(aptsData);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [user]);

    const loadAppointments = async () => {
        if (user?.role === 'Doctor') {
            try {
                const data = await fetchAppointments(user.id, 'Doctor');
                setAppointments(data);
            } catch (err) {
                console.error("Error refreshing appointments:", err);
            }
        }
    };

    const criticalCount = patients.filter(p => p.status === 'Critical').length;

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg ring-4 ring-primary/10">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-foreground">
                            Hospital Analytics <span className="text-primary">Dashboard</span>
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground font-bold italic tracking-tight">
                        Enterprise-grade clinical intelligence & ward-scale performance metrics.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Admissions"
                    value={patients.length}
                    label={`${Math.round((patients.length / 50) * 100)}% Capacity (50 Beds)`}
                    icon={Activity}
                    trend={5}
                    color="bg-blue-500"
                    delay={0}
                />
                <StatCard
                    title="Critical Alerts"
                    value={criticalCount}
                    label="Requires immediate attention"
                    icon={AlertTriangle}
                    trend={criticalCount > 2 ? 20 : -10}
                    color="bg-red-500"
                    delay={0.1}
                />
                <StatCard
                    title="Avg Clinician Load"
                    value="4.2"
                    label="Patients per doctor"
                    icon={Stethoscope}
                    color="bg-purple-500"
                    delay={0.2}
                />
                <StatCard
                    title="System Latency"
                    value="12ms"
                    label="Biometric sync delay"
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    delay={0.3}
                />
            </div>

            {/* Analytics Specific Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div className="glass-card rounded-[3rem] p-10 border-white/40 clinical-shadow bg-white/40 backdrop-blur-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Activity className="h-64 w-64 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h4 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-2">Real-time Admission Trends</h4>
                                <h3 className="text-3xl font-black tracking-tight">Ward Occupancy Matrix</h3>
                            </div>
                            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-2">
                                {['ICU', 'Emergency', 'General', 'Pediatrics'].map((w, i) => (
                                    <button key={i} className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        i === 0 ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pb-6">
                            {[
                                { name: 'ICU', count: 12, total: 15, color: 'bg-rose-500' },
                                { name: 'Emergency', count: 24, total: 25, color: 'bg-amber-500' },
                                { name: 'General', count: 48, total: 60, color: 'bg-indigo-500' },
                                { name: 'Pediatrics', count: 8, total: 20, color: 'bg-emerald-500' }
                            ].map((ward, i) => {
                                const percentage = Math.round((ward.count / ward.total) * 100);
                                return (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{ward.name}</p>
                                                <h5 className="text-2xl font-black text-foreground">{ward.count}<span className="text-sm text-slate-300 font-bold ml-1">/ {ward.total}</span></h5>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-lg",
                                                percentage > 85 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                                            )}>{percentage}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={cn("h-full rounded-full", ward.color)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-[2.5rem] clinical-shadow border-white/40 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-6">Demographic Synthesis</h4>
                        <div className="space-y-6">
                            {[
                                { label: 'Geriatric (65+)', pct: 42, color: 'bg-indigo-400' },
                                { label: 'Adult (18-64)', pct: 35, color: 'bg-emerald-400' },
                                { label: 'Pediatric (0-17)', pct: 23, color: 'bg-amber-400' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span>{item.label}</span>
                                        <span className="opacity-60">{item.pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                AI prediction suggests a 12% increase in Geriatric admissions over the next 48 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Extra Appointment Section for Doctors */}
            {user?.role === 'Doctor' && (
                <div className="mt-16 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black tracking-tight flex items-center gap-4">
                            <Calendar className="h-10 w-10 text-primary" /> Patient Load Matrix
                        </h3>
                        <div className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest shadow-sm border border-indigo-100">
                            <Info className="h-4 w-4" /> Physician-Only Management
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] overflow-hidden clinical-shadow border-white/40 bg-white/30 backdrop-blur-md">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-10 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Patient Registry</th>
                                        <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Date</th>
                                        <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Clinical Status</th>
                                        <th className="px-10 py-8 text-right text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {appointments.length > 0 ? (
                                        appointments.map((apt, idx) => (
                                            <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 group-hover:bg-primary group-hover:border-primary transition-all">
                                                            <UserIcon className="h-6 w-6 text-primary group-hover:text-white" />
                                                        </div>
                                                        <span className="font-black text-lg text-foreground">{apt.patient_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-bold text-slate-600">{apt.date}</td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 font-bold text-indigo-600">
                                                        <Clock className="h-4 w-4" /> {apt.time}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={cn(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border-2",
                                                        apt.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            apt.status === 'Completed' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                                apt.status === 'Cancelled' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" /> Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                                    <Clipboard className="h-16 w-16 opacity-20" />
                                                    <p className="text-xl font-black uppercase tracking-widest opacity-30">No Active Data Stream</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedApt && (
                    <AppointmentModal
                        appointment={selectedApt}
                        onClose={() => setSelectedApt(null)}
                        onRefresh={loadAppointments}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
