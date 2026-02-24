import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Mail, Phone, MapPin,
    Award, ShieldCheck, Clock, ArrowRight,
    Stethoscope, Heart, GraduationCap, Star,
    Briefcase, Trash2
} from 'lucide-react';
import { fetchDoctors, deleteDoctor } from '../lib/api';

const Doctors = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const data = await fetchDoctors();
                setDoctors(data);
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY REMOVE ${name} from the clinical staff registry? This action cannot be undone.`)) {
            try {
                await deleteDoctor(id);
                // Refresh doctors list
                const data = await fetchDoctors();
                setDoctors(data);
            } catch (error) {
                alert("Error removing clinical staff: " + error.message);
            }
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium">Synchronizing Clinical Staff Registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">Clinical Staff Registry</h1>
                    <p className="text-muted-foreground font-medium">Manage and view specialized medical practitioners across all departments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify clinical staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/50 border border-white/20 backdrop-blur-xl rounded-2xl py-3 pl-12 pr-6 w-full md:w-80 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Personnel', value: doctors.length, icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Primary Specializations', value: 8, icon: Award, color: 'text-blue-500' },
                    { label: 'Avg. Years Experience', value: '12.4', icon: GraduationCap, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-3xl p-6 border-white/40 clinical-shadow flex items-center gap-6"
                    >
                        <div className={`p-4 rounded-2xl bg-white shadow-xl ${stat.color}`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredDoctors.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="group cursor-pointer"
                            onClick={() => navigate(`/doctors/${doc.id}`)}
                        >
                            <div className="glass-card rounded-[2.5rem] p-8 border-white/40 clinical-shadow hover:scale-[1.02] transition-all duration-500 h-full flex flex-col relative overflow-hidden">
                                {/* Design Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />

                                <div className="flex items-start gap-6 mb-8 relative">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-[2rem] clinical-gradient p-1 shadow-2xl overflow-hidden ring-4 ring-white">
                                            <div className="h-full w-full bg-slate-50 rounded-[1.8rem] overflow-hidden">
                                                <img
                                                    src={doc.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`}
                                                    alt={doc.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <h3 className="text-2xl font-black tracking-tighter text-foreground leading-tight group-hover:text-primary transition-colors">{doc.name}</h3>
                                        <p className="text-primary font-bold text-sm uppercase tracking-widest">{doc.role}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                                            <span className="text-xs font-bold text-muted-foreground ml-1">5.0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <span>{doc.specialty || 'General Practitioner'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 p-2">
                                        <Briefcase className="h-4 w-4 text-amber-500" />
                                        <span>{doc.experience || '10+ Years Experience'} • {doc.gender || 'Verified Staff'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 p-2">
                                        <Heart className="h-4 w-4 text-rose-500" />
                                        <span>{doc.department || 'Auralis General'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 p-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span>Mon - Fri • 08:00 - 17:00</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-10 w-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-primary hover:scale-110 transition-all"
                                        >
                                            <Mail className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-10 w-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-primary hover:scale-110 transition-all"
                                        >
                                            <Phone className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.name); }}
                                            className="h-10 w-10 rounded-full bg-red-50 shadow-md border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 transition-all ml-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 group/btn text-sm font-black text-primary hover:gap-3 transition-all">
                                        VIEW PROFILE <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredDoctors.length === 0 && (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/20">
                    <Stethoscope className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No medical staff found matching your criteria.</h3>
                </div>
            )}
        </div>
    );
};

export default Doctors;
