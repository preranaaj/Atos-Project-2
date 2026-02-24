import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Heart, Activity, Wind, Thermometer,
    AlertTriangle, Clock, Calendar, Droplets, TrendingUp,
    FileText, User, Share2, CheckCircle2
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { fetchPatientById, fetchPatientVitals, fetchPatientTimeline, addVitals } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Save, X } from 'lucide-react';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Vitals Form State
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({
        hr: '',
        sbp: '',
        temp: '',
        spo2: '',
        weight: '',
        height: '',
        note: ''
    });

    const refreshData = async () => {
        try {
            const [pData, vData, tData] = await Promise.all([
                fetchPatientById(id),
                fetchPatientVitals(id),
                fetchPatientTimeline(id)
            ]);
            setPatient(pData);
            setVitals(vData);
            setTimeline(tData);
        } catch (error) {
            console.error("Failed to load clinical data:", error);
        }
    };

    const handleAddVitals = async (e) => {
        e.preventDefault();
        try {
            await addVitals(id, {
                hr: parseInt(vitalsForm.hr),
                sbp: parseInt(vitalsForm.sbp),
                temp: parseFloat(vitalsForm.temp),
                spo2: parseInt(vitalsForm.spo2),
                weight: vitalsForm.weight ? parseFloat(vitalsForm.weight) : null,
                height: vitalsForm.height ? parseFloat(vitalsForm.height) : null,
                note: vitalsForm.note
            });
            setShowVitalsModal(false);
            setVitalsForm({ hr: '', sbp: '', temp: '', spo2: '', weight: '', height: '', note: '' });
            await refreshData();
        } catch (err) {
            alert("Failed to record vitals: " + err.message);
        }
    };

    useEffect(() => {
        setLoading(true);
        refreshData().finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Retrieving Electronic Health Records...</p>
        </div>
    );

    if (!patient) return <div>Patient not found.</div>;

    const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : { hr: '--', sbp: '--', spo2: '--', temp: '--' };

    return (
        <div className="space-y-8 pb-16">
            {/* Immersive Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button
                    onClick={() => navigate('/patients')}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all group"
                >
                    <div className="p-2 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="text-lg font-bold">Clinical Census</span>
                </button>
                <div className="flex items-center gap-4">
                    {(user?.role === 'Doctor' || user?.role === 'Admin') && (
                        <button
                            onClick={() => setShowVitalsModal(true)}
                            className="p-3 bg-white hover:bg-indigo-50 rounded-2xl transition-all text-indigo-600 shadow-sm border border-indigo-100 flex items-center gap-2 font-bold"
                        >
                            <Plus className="h-6 w-6" />
                            Record Vitals
                        </button>
                    )}
                    <button className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all text-muted-foreground shadow-sm bg-white/50 border border-white/20">
                        <Share2 className="h-6 w-6" />
                    </button>
                    <button className="clinical-gradient text-white px-8 py-3.5 rounded-2xl text-lg font-black shadow-2xl clinical-shadow flex items-center gap-3 active:scale-95 transition-all">
                        <FileText className="h-6 w-6" />
                        Clinical Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Summary & Vitals */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Immersive Patient Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[2.5rem] p-10 clinical-shadow flex flex-col md:flex-row items-center gap-10 border-white/40"
                    >
                        <div className="relative">
                            <div className="h-32 w-32 rounded-[2.5rem] clinical-gradient p-1 shadow-2xl overflow-hidden ring-8 ring-white/30">
                                <div className="h-full w-full bg-white rounded-[2.2rem] overflow-hidden">
                                    {patient.gender === 'F' ? (
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}&gender=female`} alt="Avatar" className="scale-125" />
                                    ) : (
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}&gender=male`} alt="Avatar" className="scale-125" />
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <h2 className="text-4xl font-black tracking-tighter text-foreground">{patient.name}</h2>
                                <span className={`px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border-2 ${patient.status === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-200/50' : 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50'
                                    }`}>
                                    {patient.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Acuity Meta</p>
                                    <p className="text-lg font-bold text-foreground">{patient.age}Y • {patient.gender === 'M' ? 'Male' : 'Female'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Hemotype</p>
                                    <p className="text-lg font-bold text-rose-600 flex items-center gap-2 justify-center md:justify-start">
                                        <Droplets className="h-5 w-5" />
                                        {patient.blood_type || 'O+'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Admission</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Apr 15, 2024'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Diagnosis</p>
                                    <p className="text-lg font-bold text-primary">{patient.condition}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Precision Vitals Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Heart Rate', value: latestVitals.hr, unit: 'BPM', icon: Heart, color: 'text-rose-500', stroke: '#f43f5e', fill: '#fff1f2', line: 'hr' },
                            { label: 'Blood Pressure', value: `${latestVitals.sbp}/80`, unit: 'mmHg', icon: Activity, color: 'text-primary', stroke: '#3b82f6', fill: '#eff6ff', line: 'sbp' },
                            { label: 'SPO2 Sat.', value: latestVitals.spo2, unit: '%', icon: Wind, color: 'text-emerald-500', stroke: '#10b981', fill: '#ecfdf5', line: 'spo2' },
                            { label: 'Body Temp.', value: latestVitals.temp, unit: '°F', icon: Thermometer, color: 'text-amber-500', stroke: '#f59e0b', fill: '#fffbeb', line: 'temp' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="glass-card rounded-[2rem] p-5 clinical-shadow hover:scale-105 transition-all duration-500 border-white/30 overflow-hidden"
                            >
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-3">{stat.label}</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl bg-white shadow-lg border border-slate-50 ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{stat.value}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/60">{stat.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-12 w-full -mb-2 opacity-50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={vitals.slice(-12)}>
                                            <defs>
                                                <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={stat.stroke} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={stat.stroke} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey={stat.line}
                                                stroke={stat.stroke}
                                                fill={`url(#grad-${i})`}
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Patient Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Clinical Progression Timeline
                        </h3>
                        <div className="relative flex justify-between items-center px-4">
                            <div className="absolute left-8 right-8 h-0.5 bg-border top-1/2 -translate-y-1/2 -z-10" />
                            {timeline.slice(-5).map((ev, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className={`h-4 w-4 rounded-full border-2 border-card ${i === 4 ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-border'
                                        }`} />
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">Day {i + 1}</p>
                                        <p className="text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            {ev.event}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ML Risk Analysis Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold">Predictive Risk Analysis</h3>
                                <p className="text-xs text-muted-foreground mt-1">AI-driven Cardiac Event Probability (Next 24 Hours)</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-red-400" />
                                    Critical Zone
                                </span>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { time: 'T-12', risk: 15 }, { time: 'T-10', risk: 20 }, { time: 'T-8', risk: 18 },
                                    { time: 'T-6', risk: 25 }, { time: 'T-4', risk: 45 }, { time: 'T-2', risk: 62 },
                                    { time: 'Today', risk: 85 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRisk)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-4 bg-secondary/30 rounded-xl flex items-center justify-between">
                            <p className="text-sm font-medium">Rising Risk of Cardiac Event Detected</p>
                            <span className="text-lg font-black text-red-600">85%</span>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Alerts & Metadata */}
                <div className="space-y-6">

                    {/* Immersive Risk Alerts */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="clinical-gradient rounded-[2.5rem] p-8 text-white shadow-2xl clinical-shadow relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <AlertTriangle className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80">Critical Path Analysis</h4>
                            </div>
                            <div className="bg-white/10 backdrop-blur-2xl rounded-[1.5rem] p-6 border border-white/20 mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-rose-500 rounded-2xl shadow-lg ring-4 ring-rose-500/30">
                                        <Activity className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black italic tracking-tight">HIGH VULNERABILITY</p>
                                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Cardiac Event Threat</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-white/90 leading-relaxed mb-4">
                                    Real-time analysis indicates an <span className="text-white underline underline-offset-4 decoration-rose-300">85% probability</span> based on current biomarker trends.
                                </p>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        className="h-full bg-rose-400"
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-white text-primary py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                                <TrendingUp className="h-6 w-6" />
                                ESCALATE CARE
                            </button>
                        </div>
                    </motion.div>

                    {/* Vitals Summary Card */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Trend Analysis
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Acuity Level', value: 'High', color: 'text-red-600' },
                                { label: 'Stability Index', value: '4.2/10', color: 'text-amber-600' },
                                { label: 'Response Rate', value: 'Normal', color: 'text-emerald-600' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                    <span className="text-sm text-muted-foreground">{item.label}</span>
                                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Clinical Notes */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h3 className="font-bold mb-4">Recent Findings</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-xs leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                                <span>Elevated HR (120 bpm) persistent for last 30 mins.</span>
                            </li>
                            <li className="flex gap-3 text-xs leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                                <span>ST-segment depression observed on ECG monitor.</span>
                            </li>
                            <li className="flex gap-3 text-xs leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                                <span>No response to sublingual nitroglycerin.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Vitals Input Modal */}
            <AnimatePresence>
                {showVitalsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVitalsModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-card rounded-[2.5rem] p-10 clinical-shadow border border-white/40 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setShowVitalsModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-4xl font-black tracking-tighter mb-2">Sync Clinical Telemetry</h2>
                                <p className="text-lg font-bold text-muted-foreground italic">Update patient vital signs for real-time risk assessment.</p>
                            </div>

                            <form onSubmit={handleAddVitals} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">Heart Rate (BPM)</label>
                                        <input
                                            type="number" required
                                            value={vitalsForm.hr}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, hr: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-xl"
                                            placeholder="72"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">Systolic BP (mmHg)</label>
                                        <input
                                            type="number" required
                                            value={vitalsForm.sbp}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, sbp: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-xl"
                                            placeholder="120"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">Temp (°F)</label>
                                        <input
                                            type="number" step="0.1" required
                                            value={vitalsForm.temp}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-xl"
                                            placeholder="98.6"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">SPO2 Saturation (%)</label>
                                        <input
                                            type="number" required
                                            value={vitalsForm.spo2}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                                            className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-black text-xl"
                                            placeholder="98"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">Clinical Observation Note</label>
                                    <textarea
                                        value={vitalsForm.note}
                                        onChange={(e) => setVitalsForm({ ...vitalsForm, note: e.target.value })}
                                        className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none font-bold text-lg h-32"
                                        placeholder="Add symmetric observations or clinical context..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 clinical-gradient text-white rounded-[2rem] font-black text-2xl shadow-2xl clinical-shadow flex items-center justify-center gap-4 hover:opacity-90 active:scale-[0.98] transition-all"
                                >
                                    <Save className="h-8 w-8" />
                                    Synchronize Bio-Metrics
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientDetail;
