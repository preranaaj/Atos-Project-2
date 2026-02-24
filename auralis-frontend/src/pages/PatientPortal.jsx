import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Activity,
    Calendar,
    FileText,
    CreditCard,
    Heart,
    User,
    Clock,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="glass-card p-6 rounded-[2rem] clinical-shadow border-white/40 flex items-center justify-between">
        <div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">{value}</span>
                <span className="text-sm font-bold text-muted-foreground">{unit}</span>
            </div>
        </div>
        <div className={cn("p-4 rounded-2xl", color)}>
            <Icon className="h-6 w-6 text-white" />
        </div>
    </div>
);

const PatientPortal = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-foreground mb-3 flex items-center gap-4">
                        Auralis <span className="p-2 bg-indigo-100 rounded-2xl text-indigo-600 text-xl tracking-widest">PATIENT PORTAL</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-bold italic flex items-center gap-2">
                        Welcome back, <span className="text-primary not-italic underline decoration-indigo-200 underline-offset-4">{user?.name}</span>. Your health telemetry is synchronized.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-slate-400">
                        <Bell className="h-6 w-6" />
                    </button>
                    <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-50 border-4 border-white shadow-2xl overflow-hidden ring-8 ring-indigo-50/50">
                        <img src={user?.avatar} alt="Profile" className="h-full w-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Vitals Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Heart Rate"
                    value="72"
                    unit="BPM"
                    icon={Heart}
                    color="bg-rose-500 shadow-rose-200 shadow-xl"
                />
                <StatCard
                    title="Blood Pressure"
                    value="120/80"
                    unit="mmHg"
                    icon={Activity}
                    color="bg-indigo-500 shadow-indigo-200 shadow-xl"
                />
                <StatCard
                    title="Weight"
                    value="75"
                    unit="KG"
                    icon={User}
                    color="bg-emerald-500 shadow-emerald-200 shadow-xl"
                />
                <StatCard
                    title="Oxygen Level"
                    value="98"
                    unit="%"
                    icon={Activity}
                    color="bg-amber-500 shadow-amber-200 shadow-xl"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Calendar className="h-7 w-7 text-primary" /> Upcoming Sessions
                        </h3>
                        <button className="text-sm font-black text-primary uppercase tracking-widest hover:underline decoration-primary decoration-2 underline-offset-4">
                            Book New Appointment
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { dr: "Dr. Sarah Connor", dept: "Cardiology", time: "Feb 24, 2026 - 10:30 AM", status: "Approved" },
                            { dr: "Dr. James Carter", dept: "General Health", time: "March 02, 2026 - 14:00 PM", status: "Pending" }
                        ].map((apt, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-6 rounded-3xl border-white/30 clinical-shadow hover:scale-[1.01] transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                        <User className="h-6 w-6 text-slate-400 group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-foreground">{apt.dr}</p>
                                        <p className="text-sm font-bold text-muted-foreground">{apt.dept}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="hidden md:block text-right">
                                        <p className="font-bold text-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" /> {apt.time}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            apt.status === 'Approved' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-10">
                        <h3 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3">
                            <FileText className="h-7 w-7 text-primary" /> Clinical Records
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 rounded-[2rem] border-white/40 clinical-shadow group cursor-pointer hover:bg-slate-50 transition-all">
                                <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                    <Activity className="h-6 w-6 text-primary group-hover:text-white" />
                                </div>
                                <h4 className="text-xl font-black mb-1">Vital Sign History</h4>
                                <p className="text-sm font-bold text-muted-foreground italic">Last synchronized 2 hours ago</p>
                            </div>
                            <div className="glass-card p-8 rounded-[2rem] border-white/40 clinical-shadow group cursor-pointer hover:bg-slate-50 transition-all">
                                <div className="p-4 bg-emerald-50 rounded-2xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <FileText className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                                </div>
                                <h4 className="text-xl font-black mb-1">Prescription Files</h4>
                                <p className="text-sm font-bold text-muted-foreground italic">3 active prescriptions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="space-y-8">
                    {/* Billing Summary */}
                    <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-900 clinical-shadow text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <CreditCard className="h-32 w-32 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-sm font-black uppercase tracking-[0.3em] opacity-60 mb-8">Clinical Billing</h4>
                            <div className="space-y-1 mb-10">
                                <p className="text-xs font-bold opacity-60">Total Outstanding</p>
                                <p className="text-5xl font-black tracking-tighter">$1,240.00</p>
                            </div>
                            <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black transition-all hover:bg-indigo-50 active:scale-95 shadow-xl">
                                Verify & Pay Statement
                            </button>
                        </div>
                    </div>

                    {/* Quick Doctor Search */}
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/40 clinical-shadow">
                        <h4 className="text-lg font-black uppercase tracking-widest mb-6 text-primary">Find Providers</h4>
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by specialty..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-primary outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-4">
                            {['General Consultation', 'Cardiology', 'Neurology'].map((spec, i) => (
                                <button key={i} className="w-full p-4 text-left rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50 transition-all flex items-center justify-between group">
                                    <span className="font-bold text-slate-600 group-hover:text-primary transition-all">{spec}</span>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientPortal;
