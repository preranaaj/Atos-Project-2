import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Mail, Phone, MapPin,
    Award, ShieldCheck, Clock, Calendar,
    GraduationCap, Star, BookOpen, Activity,
    TrendingUp, Briefcase, Heart, Share2, FileText,
    Stethoscope
} from 'lucide-react';
import { fetchDoctorById, fetchReviews, submitReview } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });

    const loadData = async () => {
        try {
            const [docData, revData] = await Promise.all([
                fetchDoctorById(id),
                fetchReviews(id)
            ]);
            setDoctor(docData);
            setReviews(revData);
        } catch (error) {
            console.error("Failed to load clinical profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please sign in to provide professional clinical feedback.");
            return;
        }
        try {
            await submitReview(id, {
                doctor_id: id,
                patient_id: user.id || user._id,
                patient_name: user.name,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            setIsReviewOpen(false);
            setReviewForm({ rating: 5, comment: '' });
            loadData();
        } catch (error) {
            alert("Feedback submission failed.");
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Retrieving Specialized Clinical Profile...</p>
        </div>
    );

    if (!doctor) return <div>Doctor profile not found.</div>;

    return (
        <div className="space-y-8 pb-16">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button
                    onClick={() => navigate('/doctors')}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all group"
                >
                    <div className="p-2 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="text-lg font-bold">Staff Registry</span>
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all text-muted-foreground shadow-sm bg-white/50 border border-white/20">
                        <Share2 className="h-6 w-6" />
                    </button>
                    <button className="clinical-gradient text-white px-8 py-3.5 rounded-2xl text-lg font-black shadow-2xl clinical-shadow flex items-center gap-3 active:scale-95 transition-all">
                        <FileText className="h-6 w-6" />
                        Credentials PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Profile Hub & Bio */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Immersive Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[2.5rem] p-10 clinical-shadow border-white/40 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[10rem] -mr-16 -mt-16" />

                        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="relative">
                                <div className="h-40 w-40 rounded-[3rem] clinical-gradient p-1.5 shadow-2xl overflow-hidden ring-8 ring-white/30">
                                    <div className="h-full w-full bg-white rounded-[2.8rem] overflow-hidden">
                                        <img
                                            src={doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover scale-110"
                                        />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <h2 className="text-5xl font-black tracking-tighter text-foreground leading-none">{doctor.name}</h2>
                                    <span className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20">
                                        {doctor.role}
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-muted-foreground font-bold">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <span>{doctor.specialty}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-rose-500" />
                                        <span>{doctor.department}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                        <span>{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'} Excellence Rating</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Experience', value: doctor.experience || '15+ Years', icon: Briefcase, color: 'text-blue-500' },
                                { label: 'Publications', value: '42+', icon: BookOpen, color: 'text-purple-500' },
                                { label: 'Patients', value: doctor.clinical_stats?.consultations || '10k+', icon: Heart, color: 'text-rose-500' },
                                { label: 'Success Rate', value: doctor.clinical_stats?.patient_success || '98.5%', icon: TrendingUp, color: 'text-emerald-500' },
                            ].map((stat, i) => (
                                <div key={stat.label} className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <div className="flex items-center gap-2">
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        <p className="text-xl font-black text-foreground">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bio & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card rounded-[2rem] p-8 border-white/40 clinical-shadow"
                        >
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Activity className="h-6 w-6 text-primary" />
                                Professional Biography
                            </h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                {doctor.bio || "Leading clinical expert with a focus on advanced medical practices and patient-centric care protocols."}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2rem] p-8 clinical-shadow border border-slate-100"
                        >
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <GraduationCap className="h-6 w-6 text-primary" />
                                Academic Background
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Doctor of Medicine</p>
                                    <p className="text-lg font-bold text-foreground">{doctor.education || "Global Medical Institute"}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">Residency & Fellowship</p>
                                    <p className="text-lg font-bold text-foreground">Royal Academy of Surgery</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Clinical Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-[2.5rem] p-10 border-white/40 clinical-shadow"
                    >
                        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Award className="h-7 w-7 text-amber-500" />
                            Clinical Milestones & Honors
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(doctor.achievements || ["Board Certified Professional", "Excellence in Clinical Practice", "Leading Medical Innovator"]).map((ach, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-white shadow-lg rounded-[1.5rem] border border-slate-50 group hover:border-primary/30 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 leading-tight pt-1">{ach}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Patient & Practitioner Reviews */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card rounded-[2.5rem] p-10 border-white/40 clinical-shadow mt-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                                    <Heart className="h-7 w-7 text-rose-500" />
                                    Clinical Feedback ({reviews.length})
                                </h3>
                                <p className="text-muted-foreground font-bold italic">Patient experience and surgical outcome reviews.</p>
                            </div>
                            {user?.role === 'Patient' && (
                                <button
                                    onClick={() => setIsReviewOpen(!isReviewOpen)}
                                    className="px-6 py-3 bg-secondary/50 hover:bg-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm"
                                >
                                    {isReviewOpen ? 'Cancel Feedback' : 'Submit Review'}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isReviewOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-12 border-b border-slate-50 pb-12"
                                >
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="transition-transform active:scale-95"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            required
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            placeholder="Describe your surgical experience or clinical consultation..."
                                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-primary/30 font-bold transition-all min-h-[150px]"
                                        />
                                        <button
                                            type="submit"
                                            className="clinical-gradient text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
                                        >
                                            AUTHENTICATE FEEDBACK
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            {reviews.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <p className="font-bold text-muted-foreground italic">No clinical reviews available for this practitioner.</p>
                                </div>
                            )}
                            {reviews.map((rev, i) => (
                                <motion.div
                                    key={rev.id || i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                                                {rev.patient_name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg">{rev.patient_name}</h4>
                                                <p className="text-xs font-black text-muted-foreground uppercase">{new Date(rev.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-bold leading-relaxed">{rev.comment}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Contact & Stats */}
                <div className="space-y-8">
                    {/* Quick Connectivity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="clinical-gradient rounded-[2.5rem] p-8 text-white shadow-2xl clinical-shadow"
                    >
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-8">Clinical Connectivity</h4>
                        <div className="space-y-4 mb-8">
                            <button className="w-full bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-white rounded-xl text-primary shadow-lg group-hover:scale-110 transition-transform">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Direct Email</p>
                                    <p className="text-sm font-bold">{doctor.email}</p>
                                </div>
                            </button>
                            <button className="w-full bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-white rounded-xl text-primary shadow-lg group-hover:scale-110 transition-transform">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Clinical Pager</p>
                                    <p className="text-sm font-bold">+1 (555) 0123-456</p>
                                </div>
                            </button>
                        </div>
                        <button className="w-full bg-white text-primary py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            SCHEDULE CONSULT
                        </button>
                    </motion.div>

                    {/* Operational Stats */}
                    <div className="bg-white rounded-[2.5rem] p-8 clinical-shadow border border-slate-100">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Clinical Registry Status
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Registry Status', value: 'Active / Verified', color: 'text-emerald-600' },
                                { label: 'Clinical Gender', value: doctor.gender || 'Not Specified', color: 'text-slate-600' },
                                { label: 'Ward Availability', value: 'On-Call', color: 'text-amber-600' },
                                { label: 'Primary Rotation', value: 'Morning Shift', color: 'text-blue-600' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                    <span className="text-sm font-bold text-muted-foreground">{item.label}</span>
                                    <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specialization Badge */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/40 clinical-shadow text-center">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                            <Stethoscope className="h-10 w-10" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-2">Licensed Specialist</h4>
                        <p className="text-sm font-medium text-muted-foreground">This practitioner is board certified in {doctor.specialty} and is an active member of the Auralis Clinical Board.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetail;
