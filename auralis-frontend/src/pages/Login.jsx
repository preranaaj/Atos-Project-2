import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            console.error("Login failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
            {/* Left Panel - Visuals & Branding */}
            <div className="hidden lg:flex w-7/12 bg-primary relative items-center justify-center overflow-hidden">
                {/* High-quality medical background overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2070"
                        alt="Medical Professionals"
                        className="w-full h-full object-cover mix-blend-overlay opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-900/95 to-indigo-950/100"></div>
                </div>

                {/* Animated Decorative Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl z-1"
                />

                <div className="relative z-10 p-16 text-white max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 mb-12"
                    >
                        <div className="p-5 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl ring-8 ring-white/5">
                            <Activity className="h-12 w-12 text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-2xl">Auralis</h1>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl font-black mb-10 leading-[1] tracking-tighter drop-shadow-xl"
                    >
                        Precision Insight <br />
                        <span className="text-primary-foreground/80 underline decoration-blue-400 decoration-8 underline-offset-8">At Every Moment.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-blue-50/70 text-2xl leading-relaxed font-bold mb-16 max-w-lg italic"
                    >
                        The intelligent clinical cockpit for modern healthcare. Experience the vanguard of medical data synthesis.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 gap-6"
                    >
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">Secure</span>
                            </div>
                            <p className="text-xs text-blue-200">HIPAA Compliant Data Layer</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-bold uppercase tracking-widest text-blue-400">Real-Time</span>
                            </div>
                            <p className="text-xs text-blue-200">Kaggle Dataset Telemetry</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-5/12 flex items-center justify-center p-12 relative bg-card">
                <div className="absolute top-0 right-0 p-10">
                    <Link to="/register" className="text-sm font-bold text-primary hover:text-blue-700 transition-all flex items-center gap-2 group">
                        Sign up for access <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-10"
                >
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex items-center gap-4 justify-center mb-10">
                            <Activity className="h-12 w-12 text-primary" />
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">AURALIS</h1>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground mb-4">Clinical Login</h2>
                        <p className="text-xl text-muted-foreground font-bold">
                            Authorized Access Zone. Login to Hospital Cockpit.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-foreground/50 uppercase tracking-[0.2em] mb-4">
                                    Clinical Identifier
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-all">
                                        <Mail className="h-7 w-7" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-16 pr-6 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none text-xl font-bold placeholder:text-slate-300"
                                        placeholder="doctor@auralis.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-foreground/50 uppercase tracking-[0.2em] mb-4">
                                    Secure Key
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-all">
                                        <Lock className="h-7 w-7" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-16 pr-6 py-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none text-xl font-bold placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <a href="#" className="text-sm font-black text-primary hover:text-blue-700 transition-colors uppercase tracking-widest">Recover Vault</a>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-6 px-8 border border-transparent text-xl font-black uppercase tracking-widest rounded-[2rem] text-white clinical-gradient hover:opacity-90 focus:outline-none focus:ring-8 focus:ring-primary/20 transition-all shadow-2xl clinical-shadow disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                            ) : (
                                <span className="flex items-center gap-4">
                                    Launch Cockpit <ArrowRight className="h-7 w-7 group-hover:translate-x-3 transition-transform duration-500" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-border">
                        <p className="text-center text-sm text-muted-foreground font-medium">
                            Powered by <span className="font-bold text-foreground italic">Auralis Intelligence</span> Engine
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
