import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, User, Phone, Mail, MapPin,
    MoreHorizontal, X, ArrowLeft, Activity, Heart,
    Thermometer, Weight, Ruler, FileText, CreditCard,
    Plus, Save, TrendingUp, ChevronRight, BarChart3,
    AlertCircle, CheckCircle2, Pill, ClipboardList
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
    fetchAppointments, updateAppointment, fetchPatientById,
    fetchPatientVitals, addVitals, fetchDiagnosis,
    submitDiagnosis, fetchBills, submitBill, updatePatient
} from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [selectedApt, setSelectedApt] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [loading, setLoading] = useState(true);

    // Detailed View State
    const [patientData, setPatientData] = useState(null);
    const [vitals, setVitals] = useState([]);
    const [diagnosis, setDiagnosis] = useState([]);
    const [bills, setBills] = useState([]);
    const [activeTab, setActiveTab] = useState('Charts');

    // Modals
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [showDiagModal, setShowDiagModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        loadAppointments();
    }, [user]);

    const loadAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await fetchAppointments(user.id, 'Doctor');
            setAppointments(data);
        } catch (err) {
            console.error("Error loading appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (apt) => {
        setSelectedApt(apt);
        setLoading(true);
        try {
            const [p, v, d, b] = await Promise.all([
                fetchPatientById(apt.patient_id),
                fetchPatientVitals(apt.patient_id),
                fetchDiagnosis(apt.patient_id),
                fetchBills(apt.patient_id)
            ]);
            setPatientData(p);
            setVitals(v);
            setDiagnosis(d);
            setBills(b);
            setViewMode('detail');
        } catch (err) {
            console.error("Error loading patient details:", err);
            alert("Failed to load full patient details.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelApt = async () => {
        if (!cancelReason) return alert("Please provide a reason.");
        try {
            await updateAppointment(selectedApt.id, {
                status: 'Cancelled',
                cancellation_reason: cancelReason
            });
            setShowCancelModal(false);
            setCancelReason('');
            loadAppointments();
            setViewMode('list');
        } catch (err) {
            alert("Failed to cancel: " + err.message);
        }
    };

    if (loading && viewMode === 'list') return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">Patient Registry</h1>
                                <p className="text-lg text-muted-foreground font-medium italic">Active appointment sessions for your clinical queue.</p>
                            </div>
                        </div>

                        <div className="glass-card rounded-[2.5rem] overflow-hidden clinical-shadow">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-10 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Patient Name</th>
                                            <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Gender</th>
                                            <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Phone Number</th>
                                            <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Email Address</th>
                                            <th className="px-6 py-8 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Address</th>
                                            <th className="px-10 py-8 text-right text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {appointments.map((apt, idx) => (
                                            <motion.tr
                                                key={apt.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-indigo-50/30 transition-colors group"
                                            >
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-base text-foreground">{apt.patient_name}</p>
                                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{apt.date} @ {apt.time}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-black text-slate-500 uppercase tracking-widest text-xs">
                                                    {apt.gender || 'Female'}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                        <Phone className="h-4 w-4 opacity-30" /> {apt.patient_phone || '+1-202-555-0101'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                        <Mail className="h-4 w-4 opacity-30" /> {apt.patient_email || 'patient@auralis.com'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                        <MapPin className="h-4 w-4 opacity-30" /> {apt.address || 'Auralis District, Sector 7'}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleViewDetails(apt)}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedApt(apt); setShowCancelModal(true); }}
                                                            className="px-4 py-2 bg-rose-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-rose-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Clinical Header Terminal */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="p-5 bg-white rounded-3xl border-2 border-slate-100 hover:border-primary transition-all text-primary shadow-sm group"
                                >
                                    <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-5xl font-black tracking-tighter text-slate-800">{patientData?.name || 'Loading Case...'}</h2>
                                        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse mt-2" />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        <span>Case Study: {selectedApt?.id?.slice(-12)}</span>
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                        <span>Admitted: {patientData?.ward || 'General'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Status Level</p>
                                    <p className="text-xl font-black text-slate-800">{patientData?.status === 'Critical' ? 'Urgent Response' : 'Monitoring'}</p>
                                </div>
                                <span className={cn(
                                    "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border-2 shadow-sm",
                                    patientData?.status === 'Critical'
                                        ? "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50"
                                )}>
                                    {patientData?.status || 'Stable'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Main Analysis Terminal - Flexible Space */}
                            <div className="flex-1 w-full space-y-6 min-w-0 overflow-hidden">
                                <div className="glass-card rounded-[2.5rem] p-6 md:p-8 clinical-shadow min-h-[680px] flex flex-col">
                                    {activeTab === 'Charts' && (
                                        <div className="flex-1 space-y-12">
                                            {/* BP Graph Terminal */}
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-rose-500" /> Blood Pressure Synthesis
                                                    </h3>
                                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-slate-100/50 px-4 py-2 rounded-full">
                                                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Systolic</span>
                                                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Diastolic</span>
                                                    </div>
                                                </div>
                                                <div className="h-[280px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={vitals.length > 0 ? vitals.slice(-12) : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                            <XAxis dataKey="timestamp" hide />
                                                            <YAxis domain={[40, 200]} tick={{ fontWeight: 'bold', fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                            <Tooltip
                                                                contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                                                                cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                                                            />
                                                            <Bar dataKey="sbp" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={24} name="Systolic" />
                                                            <Bar dataKey="dbp" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} name="Diastolic" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* HR Graph Terminal */}
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                    <Heart className="h-5 w-5 text-rose-500 animate-pulse" /> Cardiac Pulse Wave
                                                </h3>
                                                <div className="h-[280px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={vitals.length > 0 ? vitals.slice(-24) : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                            <XAxis dataKey="timestamp" hide />
                                                            <YAxis domain={[50, 150]} tick={{ fontWeight: 'bold', fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                            <Tooltip contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }} />
                                                            <Line type="monotone" dataKey="hr" stroke="#F43F5E" strokeWidth={4} dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Vital Signs' && (
                                        <div className="space-y-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Physiological Log</h3>
                                                <button
                                                    onClick={() => setShowVitalsModal(true)}
                                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Vitals
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                                                {vitals.map((v, i) => (
                                                    <div key={i} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                                                <Clock className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-lg text-slate-800">{new Date(v.timestamp).toLocaleString()}</p>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase">{v.note || 'Regular Checkup'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-4 text-center">
                                                            <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">BP</p><p className="font-black text-primary">{v.sbp}/{v.dbp || 80}</p></div>
                                                            <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">HR</p><p className="font-black text-rose-500">{v.hr}</p></div>
                                                            <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Temp</p><p className="font-black text-amber-500">{v.temp}°F</p></div>
                                                            <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">SpO2</p><p className="font-black text-emerald-500">{v.spo2}%</p></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Diagnosis' && (
                                        <div className="space-y-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Diagnosis Registry</h3>
                                                <button
                                                    onClick={() => setShowDiagModal(true)}
                                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Diagnosis
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                                                {diagnosis.length > 0 ? diagnosis.map((d, i) => (
                                                    <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                                            <FileText className="h-20 w-20" />
                                                        </div>
                                                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                                                            <div>
                                                                <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-1">Clinical Assessment</p>
                                                                <h4 className="text-2xl font-black tracking-tight text-slate-800">{d.diagnosis}</h4>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-slate-400 uppercase">{new Date(d.timestamp).toLocaleDateString()}</p>
                                                                <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(d.timestamp).toLocaleTimeString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-8">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><AlertCircle className="h-3 w-3" /> Symptoms</p>
                                                                <p className="text-sm font-bold text-slate-600 italic">"{d.symptoms}"</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Pill className="h-3 w-3" /> Prescription</p>
                                                                <p className="text-sm font-black text-indigo-600">{d.prescription}</p>
                                                            </div>
                                                        </div>
                                                        {d.follow_up_plan && (
                                                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Follow-up Protocol</p>
                                                                <p className="text-xs font-bold text-slate-700">{d.follow_up_plan}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                                                        <ClipboardList className="h-20 w-20 mb-4" />
                                                        <p className="text-xl font-black uppercase tracking-widest">No Diagnosis Recorded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Medical Bills' && (
                                        <div className="space-y-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Billing Terminal</h3>
                                                <button
                                                    onClick={() => setShowBillModal(true)}
                                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
                                                >
                                                    <Plus className="h-4 w-4" /> Generate Bill
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                                                {bills.length > 0 ? (
                                                    <div className="glass-card rounded-2xl overflow-hidden border-slate-100">
                                                        <table className="w-full text-left">
                                                            <thead className="bg-slate-50">
                                                                <tr>
                                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Service</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Qty</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Unit Cost</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 font-bold text-sm">
                                                                {bills.map((b, i) => (
                                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                                        <td className="px-6 py-4 text-slate-800">{b.service_name}<br /><span className="text-[10px] font-black text-muted-foreground">{b.service_date}</span></td>
                                                                        <td className="px-6 py-4 text-center">{b.quantity}</td>
                                                                        <td className="px-6 py-4 text-center">₹{b.unit_cost}</td>
                                                                        <td className="px-6 py-4 text-right font-black text-primary">₹{b.total_cost}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                                                        <CreditCard className="h-20 w-20 mb-4" />
                                                        <p className="text-xl font-black uppercase tracking-widest">No Ledger Data Found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Payments' && (
                                        <div className="space-y-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Ledger</h3>
                                                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Total Revenue: ₹{bills.reduce((acc, b) => acc + (b.status === 'Paid' ? b.total_cost : 0), 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                                                {bills.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {bills.map((b, i) => (
                                                            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn("p-3 rounded-xl", b.status === 'Paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-slate-800">{b.service_name}</p>
                                                                        <p className="text-xs font-bold text-slate-400">{b.service_date}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-8">
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Amount</p>
                                                                        <p className="font-black text-slate-800">₹{b.total_cost}</p>
                                                                    </div>
                                                                    <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", b.status === 'Paid' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500")}>
                                                                        {b.status || 'Unpaid'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                                                        <CreditCard className="h-20 w-20 mb-4" />
                                                        <p className="text-xl font-black uppercase tracking-widest">No Payment Activity</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Medical History' && (
                                        <div className="space-y-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Long-term Medical Data</h3>
                                                <button
                                                    onClick={() => setShowHistoryModal(true)}
                                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg"
                                                >
                                                    <Plus className="h-4 w-4" /> Update History
                                                </button>
                                            </div>
                                            <div className="flex-1 p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 overflow-y-auto no-scrollbar">
                                                <div className="flex items-start gap-6">
                                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 shrink-0">
                                                        <ClipboardList className="h-8 w-8 text-indigo-500" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Archived Conditions & Narrative</p>
                                                        <p className="text-lg font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-200 pl-6">
                                                            "{patientData?.medical_history || 'No established medical history found in the digital vault. Clinical baseline remains clear.'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Sidebar - Minimized Navigation */}
                            <div className="w-full lg:w-[260px] space-y-6 shrink-0 lg:sticky lg:top-8">
                                {/* Quick Patient Context */}
                                <div className="glass-card rounded-[2rem] p-6 clinical-shadow border-white/20 bg-slate-50/50 mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 tracking-tighter truncate w-[140px]">{patientData?.name?.split(' ')[1] || 'Patient'}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patientData?.gender}, {patientData?.age}y</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <div className="p-2 bg-white rounded-xl border border-slate-100 flex flex-col items-center">
                                            <span className="text-muted-foreground mb-1">Risk</span>
                                            <span className={patientData?.risk === 'High' ? 'text-rose-500' : 'text-emerald-500'}>{patientData?.risk || 'Low'}</span>
                                        </div>
                                        <div className="p-2 bg-white rounded-xl border border-slate-100 flex flex-col items-center">
                                            <span className="text-muted-foreground mb-1">Blood</span>
                                            <span className="text-primary">{patientData?.blood_type || 'O+'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Dashboard */}
                                <div className="glass-card rounded-[2rem] p-6 clinical-shadow border-white/40">
                                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 px-2">Clinical Modules</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'Charts', icon: BarChart3, color: 'text-indigo-500' },
                                            { id: 'Vital Signs', icon: Activity, color: 'text-rose-500' },
                                            { id: 'Medical History', icon: ClipboardList, color: 'text-amber-500' },
                                            { id: 'Diagnosis', icon: FileText, color: 'text-primary' },
                                            { id: 'Medical Bills', icon: CreditCard, color: 'text-emerald-500' },
                                            { id: 'Payments', icon: CheckCircle2, color: 'text-purple-500' },
                                        ].map(link => (
                                            <button
                                                key={link.id}
                                                onClick={() => setActiveTab(link.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.08em] transition-all group",
                                                    activeTab === link.id
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                                                )}
                                            >
                                                <link.icon className={cn("h-4 w-4 shrink-0", activeTab === link.id ? "text-white" : link.color)} />
                                                <span className="truncate">{link.id}</span>
                                                <ChevronRight className={cn("ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all", activeTab === link.id && "opacity-100")} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button className="w-full py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                                        Export Clinical Dossier
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <VitalsModal visible={showVitalsModal} onClose={() => setShowVitalsModal(false)} patientId={selectedApt?.patient_id} onRefresh={() => handleViewDetails(selectedApt)} />
            <DiagnosisModal visible={showDiagModal} onClose={() => setShowDiagModal(false)} patientId={selectedApt?.patient_id} onRefresh={() => handleViewDetails(selectedApt)} />
            <BillModal visible={showBillModal} onClose={() => setShowBillModal(false)} patientId={selectedApt?.patient_id} onRefresh={() => handleViewDetails(selectedApt)} />
            <HistoryModal visible={showHistoryModal} onClose={() => setShowHistoryModal(false)} patientId={selectedApt?.patient_id} initialData={patientData?.medical_history} onRefresh={() => handleViewDetails(selectedApt)} />

            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-white/50">
                            <h3 className="text-2xl font-black tracking-tight text-slate-800 mb-6">Terminate Case</h3>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="State clinical reasoning for cancellation..."
                                className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-rose-300 outline-none font-bold text-slate-700 h-40 no-scrollbar mb-8"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowCancelModal(false)} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase">Discard</button>
                                <button onClick={handleCancelApt} className="py-4 rounded-xl bg-rose-500 text-white font-black text-xs uppercase shadow-lg shadow-rose-200">Confirm Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components for Modals
const VitalsModal = ({ visible, onClose, patientId, onRefresh }) => {
    const [form, setForm] = useState({ temp: '', hr: '', sbp: '', dbp: '', weight: '', height: '', rr: '18', spo2: '98', note: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await addVitals(patientId, {
                temp: parseFloat(form.temp),
                hr: parseInt(form.hr),
                sbp: parseInt(form.sbp),
                dbp: parseInt(form.dbp),
                weight: form.weight ? parseFloat(form.weight) : null,
                height: form.height ? parseFloat(form.height) : null,
                rr: parseInt(form.rr),
                spo2: parseInt(form.spo2),
                note: form.note
            });
            onRefresh();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-2xl border border-white/50 overflow-y-auto no-scrollbar max-h-[90vh]">
                <h3 className="text-3xl font-black tracking-tight text-slate-800 mb-8">Deploy Vitals Update</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Temp (°F)</label>
                        <input required type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Heart Rate (BPM)</label>
                        <input required type="number" value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Systolic BP</label>
                        <input required type="number" value={form.sbp} onChange={(e) => setForm({ ...form, sbp: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Diastolic BP</label>
                        <input required type="number" value={form.dbp} onChange={(e) => setForm({ ...form, dbp: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Weight (kg)</label>
                        <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Height (cm)</label>
                        <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Resp Rate / SpO2 (%)</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={form.rr} onChange={(e) => setForm({ ...form, rr: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" placeholder="RR" />
                            <input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" placeholder="SPO2" />
                        </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Clinical Note</label>
                        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black h-24 no-scrollbar" />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4 mt-4">
                        <button type="button" onClick={onClose} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase">Discard</button>
                        <button disabled={isSaving} type="submit" className="py-4 rounded-xl bg-primary text-white font-black text-xs uppercase shadow-xl shadow-primary/20">Record Vitals</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const DiagnosisModal = ({ visible, onClose, patientId, onRefresh }) => {
    const [form, setForm] = useState({ symptoms: '', diagnosis: '', prescription: '', notes: '', follow_up_plan: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await submitDiagnosis(patientId, { ...form, patient_id: patientId });
            onRefresh();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-2xl border border-white/50 overflow-y-auto no-scrollbar max-h-[90vh]">
                <h3 className="text-3xl font-black tracking-tight text-slate-800 mb-8">Add New Diagnosis</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Symptoms Palette</label>
                        <textarea required value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Patient reported issues..." className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-bold h-24 no-scrollbar" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Final Findings</label>
                        <input required type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Clinical Diagnosis..." className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Pharmaceutical Prescriptions</label>
                        <textarea required value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} placeholder="List medications and dosages..." className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-bold h-32 no-scrollbar" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase">Additional Notes</label>
                            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase">Follow-up Strategy</label>
                            <input type="text" value={form.follow_up_plan} onChange={(e) => setForm({ ...form, follow_up_plan: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-bold" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button type="button" onClick={onClose} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase">Discard</button>
                        <button disabled={isSaving} type="submit" className="py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase shadow-xl shadow-indigo-200">Seal Report</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const BillModal = ({ visible, onClose, patientId, onRefresh }) => {
    const [form, setForm] = useState({ service_name: 'Consultation', unit_cost: '', quantity: '1', service_date: new Date().toISOString().split('T')[0] });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const total = parseFloat(form.unit_cost) * parseInt(form.quantity);
            await submitBill(patientId, { ...form, total_cost: total, patient_id: patientId });
            onRefresh();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-white/50">
                <h3 className="text-3xl font-black tracking-tight text-slate-800 mb-8">Generate Service Bill</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Service Line</label>
                        <select value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none focus:border-primary font-black">
                            {['Consultation', 'RDT Test', 'Blood Lab', 'X-Ray Imaging', 'Pharmacy Bundle', 'In-Patient Day', 'Procedural Fee'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase">Unit Cost (₹)</label>
                            <input required type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase">Quantity</label>
                            <input required type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Service Date</label>
                        <input required type="date" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-black" />
                    </div>
                    <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 flex justify-between items-center">
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Calculated Total</span>
                        <span className="text-2xl font-black text-primary tracking-tighter">₹{(parseFloat(form.unit_cost || 0) * parseInt(form.quantity || 0)).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <button type="button" onClick={onClose} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase">Discard</button>
                        <button disabled={isSaving} type="submit" className="py-4 rounded-xl bg-primary text-white font-black text-xs uppercase shadow-xl shadow-primary/20">Authorize Bill</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const HistoryModal = ({ visible, onClose, patientId, initialData, onRefresh }) => {
    const [history, setHistory] = useState(initialData || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setHistory(initialData || '');
    }, [initialData, visible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updatePatient(patientId, { medical_history: history });
            onRefresh();
            onClose();
        } catch (err) { alert(err.message); }
        finally { setIsSaving(false); }
    };

    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-white/50">
                <h3 className="text-3xl font-black tracking-tight text-slate-800 mb-8">Update Medical Vault</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Medical History / Narrative</label>
                        <textarea required value={history} onChange={(e) => setHistory(e.target.value)} placeholder="Enter past conditions, allergies, or surgical history..." className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-primary font-bold h-60 no-scrollbar" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={onClose} className="py-4 rounded-xl bg-slate-100 text-slate-600 font-black text-xs uppercase">Discard</button>
                        <button disabled={isSaving} type="submit" className="py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase shadow-xl shadow-indigo-200">Update Record</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Appointments;
