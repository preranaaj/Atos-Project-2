import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Check, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { bookAppointment, fetchAppointments, updateAppointment, fetchDoctors } from '../lib/api';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Schedule = () => {
    const { user } = useAuth();
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showBookModal, setShowBookModal] = useState(false);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const [bookingForm, setBookingForm] = useState({
        doctor_id: '',
        service: 'General Consultation',
        date: today.toISOString().split('T')[0],
        time: '09:00',
        notes: ''
    });

    const loadData = async () => {
        try {
            const [aptData, docData] = await Promise.all([
                fetchAppointments(user?.id, user?.role),
                fetchDoctors()
            ]);
            setAppointments(aptData);
            setDoctors(docData);
        } catch (err) {
            console.error("Failed to load schedule data:", err);
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const handleBook = async (e) => {
        e.preventDefault();
        const selectedDoc = doctors.find(d => d.id === bookingForm.doctor_id);
        try {
            await bookAppointment({
                patient_id: user.id || user._id,
                patient_name: user.name,
                doctor_id: bookingForm.doctor_id,
                doctor_name: selectedDoc?.name || 'Dr. TBA',
                service: bookingForm.service,
                date: bookingForm.date,
                time: bookingForm.time,
                notes: bookingForm.notes
            });
            setShowBookModal(false);
            loadData();
        } catch (err) {
            alert("Booking failed: " + err.message);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateAppointment(id, { status });
            loadData();
        } catch (err) {
            alert("Update failed");
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Clinical Timeline</h1>
                    <p className="text-lg text-muted-foreground font-medium italic">Orchestrating surgical and consultative workflows.</p>
                </div>
                {user?.role !== 'Doctor' && (
                    <button
                        onClick={() => setShowBookModal(true)}
                        className="clinical-gradient text-white px-8 py-3.5 rounded-2xl text-lg font-black shadow-2xl clinical-shadow flex items-center gap-3 active:scale-95 transition-all"
                    >
                        <Plus className="h-6 w-6" />
                        Secure Appointment
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden">
                {/* Calendar Section */}
                <div className="lg:w-2/3 flex flex-col glass-card rounded-[2.5rem] clinical-shadow overflow-hidden border-white/40">
                    <div className="p-8 flex items-center justify-between border-b border-white/20">
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                            <CalendarIcon className="h-7 w-7 text-primary" />
                            {monthNames[currentMonth]} {currentYear}
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-3 bg-white/50 hover:bg-white rounded-xl text-muted-foreground shadow-sm transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-3 bg-white/50 hover:bg-white rounded-xl text-muted-foreground shadow-sm transition-all"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-white/20 bg-primary/5">
                        {days.map(day => (
                            <div key={day} className="py-4 text-center text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                        {/* Empty slots for offset */}
                        {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} className="border-b border-r border-border/50 min-h-[80px]" />)}

                        {currentMonthDays.map(day => (
                            <div
                                key={day}
                                onClick={() => setSelectedDate(day)}
                                className={`border-b border-r border-white/20 p-4 min-h-[100px] cursor-pointer hover:bg-white transition-all relative group ${day === selectedDate ? 'bg-white/80' : ''}`}
                            >
                                <span className={`text-base font-black h-10 w-10 flex items-center justify-center rounded-2xl transition-all ${day === selectedDate ? 'clinical-gradient text-white shadow-xl' : 'text-slate-600 group-hover:bg-slate-100'}`}>
                                    {day}
                                </span>
                                {/* Real appointment indicators */}
                                {(() => {
                                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const dayAppts = appointments.filter(a => a.date === dateStr);
                                    if (dayAppts.length > 0) {
                                        return (
                                            <div className="mt-2 text-[10px] bg-primary/10 text-primary rounded-lg px-2 py-1 font-black uppercase tracking-tighter border border-primary/20">
                                                {dayAppts.length} Session{dayAppts.length > 1 ? 's' : ''}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:w-1/3 glass-card rounded-[2.5rem] clinical-shadow flex flex-col overflow-hidden border-white/40">
                    <div className="p-8 border-b border-white/20">
                        <h3 className="text-2xl font-black tracking-tight">Session Queue ({appointments.length})</h3>
                        <p className="text-base text-muted-foreground font-medium italic">Role: {user?.role} Access</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {appointments.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                                <p className="font-bold">No active sessions found.</p>
                            </div>
                        )}
                        {appointments.map((apt, index) => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-[2rem] bg-white shadow-sm border border-slate-100 hover:scale-[1.02] hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center gap-5 mb-5">
                                    <div className="h-14 w-14 rounded-2xl clinical-gradient flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/50">
                                        {user?.role === 'Doctor' ? apt.patient_name[0] : apt.doctor_name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800 tracking-tight">
                                            {user?.role === 'Doctor' ? apt.patient_name : apt.doctor_name}
                                        </h4>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{apt.service}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm font-bold text-slate-600 mb-5">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                        {apt.date} <span className="text-slate-300 mx-1">•</span> {apt.time}
                                    </div>
                                    <div className="flex items-center gap-3 italic">
                                        <FileText className="h-5 w-5 text-slate-300" />
                                        {apt.notes || "No clinical notes attached."}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border",
                                        apt.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" :
                                            apt.status === 'Pending' ? "bg-amber-500/10 text-amber-600 border-amber-200/50" :
                                                "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        {apt.status}
                                    </span>

                                    {user?.role === 'Doctor' && apt.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt.id, 'Approved'); }}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt.id, 'Cancelled'); }}
                                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBookModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBookModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-card rounded-[2.5rem] p-10 clinical-shadow border border-white/40"
                        >
                            <h2 className="text-3xl font-black mb-6 tracking-tight">Secure Clinical Session</h2>
                            <form onSubmit={handleBook} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Clinician</label>
                                    <select
                                        required
                                        className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 outline-none font-bold"
                                        value={bookingForm.doctor_id}
                                        onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date</label>
                                        <input
                                            type="date" required
                                            className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 outline-none font-bold"
                                            value={bookingForm.date}
                                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preferred Time</label>
                                        <input
                                            type="time" required
                                            className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 outline-none font-bold"
                                            value={bookingForm.time}
                                            onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Clinical Concern / Notes</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 outline-none font-bold h-24"
                                        placeholder="Briefly describe the purpose of your visit..."
                                        value={bookingForm.notes}
                                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="w-full py-5 clinical-gradient text-white rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all">
                                    Finalize Booking
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedule;
