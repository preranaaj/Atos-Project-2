import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, User, AlertCircle, CheckCircle2, Clock, X, Save, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPatients, addPatient, updatePatient, deletePatient } from '../lib/api';

const StatusBadge = ({ status }) => {
    const styles = {
        Critical: 'bg-red-500/10 text-red-600 border-red-200/50',
        Stable: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        Observation: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
        Discharged: 'bg-slate-500/10 text-slate-600 border-slate-200/50',
    };

    const icons = {
        Critical: AlertCircle,
        Stable: CheckCircle2,
        Observation: Clock,
        Discharged: User
    };

    const Icon = icons[status] || User;

    return (
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 w-fit transition-all hover:scale-105 ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            <Icon className="h-4 w-4" />
            {status}
        </span>
    );
};

const PatientModal = ({ isOpen, onClose, onSubmit, initialData = null, title = "Admit Patient" }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'M',
        condition: '',
        status: 'Stable',
        ward: 'General Ward',
        risk: 'Low',
        blood_type: 'O+',
        ml_risk_score: 0.15
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                blood_type: initialData.blood_type || 'O+',
                ml_risk_score: initialData.ml_risk_score || 0.15
            });
        } else {
            setFormData({
                name: '',
                age: '',
                gender: 'M',
                condition: '',
                status: 'Stable',
                ward: 'General Ward',
                risk: 'Low',
                blood_type: 'O+',
                ml_risk_score: 0.15
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 relative"
            >
                <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-secondary rounded-full transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                </button>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {initialData ? <Edit2 className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                    {title}
                </h3>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Patient name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Age</label>
                            <input
                                required
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="e.g. 45"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="Stable">Stable</option>
                                <option value="Critical">Critical</option>
                                <option value="Observation">Observation</option>
                                <option value="Discharged">Discharged</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Condition</label>
                        <input
                            required
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Primary diagnosis"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Ward / Location</label>
                            <input
                                required
                                value={formData.ward}
                                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="e.g. Ward B"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Risk Level</label>
                            <select
                                value={formData.risk}
                                onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="Low">Low</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Blood Type</label>
                            <select
                                value={formData.blood_type}
                                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">ML Risk Probability (0-1)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={formData.ml_risk_score}
                                onChange={(e) => setFormData({ ...formData, ml_risk_score: parseFloat(e.target.value) })}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-secondary text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-secondary/70 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {initialData ? 'Update Record' : 'Admit Patient'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Patients = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);

    const loadPatients = async () => {
        try {
            const data = await fetchPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to load patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const handleAdmit = async (formData) => {
        try {
            await addPatient(formData);
            setIsModalOpen(false);
            loadPatients();
        } catch (error) {
            alert("Error admitting patient: " + error.message);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updatePatient(editingPatient.id, formData);
            setEditingPatient(null);
            loadPatients();
        } catch (error) {
            alert("Error updating patient: " + error.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY PURGE all clinical records for ${name}? This action cannot be undone.`)) {
            try {
                await deletePatient(id);
                loadPatients();
            } catch (error) {
                alert("Error purging patient records: " + error.message);
            }
        }
    };

    const filteredPatients = patients.filter(patient => {
        const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
        const condMatch = patient.condition?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || condMatch;
        const matchesFilter = filter === 'All' || patient.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
                        Clinical Census
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Real-time monitoring and acuity management for hospital wards.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingPatient(null); setIsModalOpen(true); }}
                    className="clinical-gradient text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:opacity-90 transition-all shadow-xl clinical-shadow flex items-center gap-3 active:scale-95"
                >
                    <UserPlus className="h-6 w-6" />
                    Admit Patient
                </button>
            </div>

            <div className="glass-card rounded-[2rem] p-8 clinical-shadow mb-12">
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID, name, or condition..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-6 py-4 w-full rounded-2xl border-none bg-secondary/50 text-base font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="flex gap-2 bg-secondary/30 p-2 rounded-2xl overflow-x-auto no-scrollbar">
                        {['All', 'Critical', 'Stable', 'Observation', 'Discharged'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 rounded-xl text-base font-bold whitespace-nowrap transition-all duration-300 ${filter === f ? 'bg-white shadow-xl text-primary scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-white/40'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Patient Identity</th>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Admission Condition</th>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Current Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Assigned Ward</th>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Acuity Risk</th>
                                <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-20 text-muted-foreground">Loading clinical data...</td></tr>
                                ) : (
                                    filteredPatients.map((patient, index) => (
                                        <motion.tr
                                            key={patient.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => navigate(`/patients/${patient.id}`)}
                                            className="group bg-white/40 hover:bg-white hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer rounded-2xl relative"
                                        >
                                            <td className="px-6 py-5 rounded-l-2xl">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-14 w-14 rounded-2xl clinical-gradient flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/50">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{patient.name}</p>
                                                        <p className="text-sm text-muted-foreground/80 font-bold uppercase tracking-widest">{patient.age}Y • {patient.gender === 'M' ? 'Male' : 'Female'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-base font-bold text-slate-700">{patient.condition}</p>
                                                <p className="text-xs text-muted-foreground font-medium">Primary Diagnosis</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={patient.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-base font-bold text-slate-700">{patient.ward}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`text-sm font-black px-4 py-1.5 rounded-xl uppercase tracking-tighter ${patient.risk === 'High' ? 'text-rose-600 bg-rose-50 border border-rose-100' :
                                                    patient.risk === 'Moderate' ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                                                        'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                                    }`}>
                                                    {patient.risk}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right rounded-r-2xl border-l-0">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingPatient(patient); }}
                                                        className="p-3 bg-secondary/50 hover:bg-primary hover:text-white rounded-xl text-primary transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Edit2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(patient.id, patient.name); }}
                                                        className="p-3 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {!loading && filteredPatients.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No patients found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdmit}
            />

            <PatientModal
                isOpen={!!editingPatient}
                onClose={() => setEditingPatient(null)}
                onSubmit={handleUpdate}
                initialData={editingPatient}
                title="Update Patient Record"
            />
        </div>
    );
};

export default Patients;
