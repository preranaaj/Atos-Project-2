import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Sun, LogOut, ChevronRight, Smartphone, Mail, Save, Award, GraduationCap, Briefcase, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateDoctor } from '../lib/api';

const Toggle = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-input'}`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="glass-card rounded-[2rem] clinical-shadow overflow-hidden mb-8 border-white/40">
        <div className="p-8 border-b border-white/20 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-sm border border-white/20">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        <div className="p-8 bg-white/30 backdrop-blur-md">
            {children}
        </div>
    </div>
);

const Settings = () => {
    const { user, logout, refreshUser } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        gender: user?.gender || 'Male',
        specialty: user?.specialty || '',
        role: user?.role || '',
        department: user?.department || '',
        experience: user?.experience || '',
        education: user?.education || '',
        bio: user?.bio || '',
        achievements: user?.achievements?.join(', ') || ''
    });

    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const dataToSave = {
                ...profile,
                achievements: profile.achievements.split(',').map(a => a.trim()).filter(a => a !== '')
            };
            const updatedUser = await updateDoctor(user.id, dataToSave);
            refreshUser(updatedUser);
            alert("Clinical profile synchronized successfully.");
        } catch (error) {
            alert("Failed to synchronize profile: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">Registry Control</h1>
                    <p className="text-lg text-muted-foreground font-medium italic">Manage your clinical identity and professional identifiers.</p>
                </div>
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-10 py-5 clinical-gradient text-white rounded-[2rem] font-black text-lg shadow-2xl clinical-shadow hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                >
                    {isSaving ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                        <Save className="h-6 w-6" />
                    )}
                    Synchronize Profile
                </button>
            </div>

            {/* Identity & Basic Info */}
            <SettingsSection title="Professional Identity" icon={User}>
                <div className="flex flex-col xl:flex-row items-start gap-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <img
                                src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
                                alt="Profile"
                                className="h-32 w-32 rounded-[2.5rem] border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center cursor-pointer">
                                <Smartphone className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest">{profile.role}</p>
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Legal Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-lg"
                                placeholder="Dr. Full Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Clinical Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-lg"
                                placeholder="name@auralis.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Orientation</label>
                            <select
                                value={profile.gender}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-lg"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Primary Specialty</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                                <input
                                    type="text"
                                    value={profile.specialty}
                                    onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary outline-none transition-all font-bold text-lg text-primary"
                                    placeholder="e.g. Cardiothoracic Surgery"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            {/* Academic & Professional Stats */}
            <SettingsSection title="Professional Credentials" icon={Award}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Academic Background
                        </label>
                        <input
                            type="text"
                            value={profile.education}
                            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white outline-none font-bold"
                            placeholder="University / Medical School"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Years Experience
                        </label>
                        <input
                            type="text"
                            value={profile.experience}
                            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white outline-none font-bold"
                            placeholder="e.g. 15 Years"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Assigned Ward
                        </label>
                        <input
                            type="text"
                            value={profile.department}
                            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white outline-none font-bold"
                            placeholder="e.g. ICU / ER"
                        />
                    </div>
                </div>

                <div className="mt-8 space-y-2">
                    <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Registry Achievements (Comma Separated)</label>
                    <textarea
                        value={profile.achievements}
                        onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white outline-none font-bold h-24 no-scrollbar"
                        placeholder="Innovator Award 2023, Chief Surgeon 2022..."
                    />
                </div>

                <div className="mt-8 space-y-2">
                    <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Clinical Biography</label>
                    <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:bg-white outline-none font-bold h-32 no-scrollbar"
                        placeholder="Describe your primary clinical focus and research interests..."
                    />
                </div>
            </SettingsSection>

            {/* Preferences Section */}
            <SettingsSection title="Interface & Alerts" icon={Bell}>
                <div className="space-y-6 divide-y divide-border">
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/50 rounded-full">
                                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Auralis Dark Mode</p>
                                <p className="text-sm text-muted-foreground font-medium">Toggle the immersive clinical interface theme.</p>
                            </div>
                        </div>
                        <Toggle enabled={darkMode} setEnabled={toggleTheme} />
                    </div>

                    <div className="flex items-center justify-between pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary/50 rounded-full">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Email Notifications</p>
                                <p className="text-sm text-muted-foreground font-medium">Receive daily census summaries and critical alerts.</p>
                            </div>
                        </div>
                        <Toggle enabled={emailNotifs} setEnabled={setEmailNotifs} />
                    </div>
                </div>
            </SettingsSection>

            <div className="flex flex-col items-center gap-6 pt-10">
                <button
                    onClick={logout}
                    className="group flex items-center gap-4 px-12 py-5 text-rose-600 font-black text-lg bg-rose-50 hover:bg-rose-100 rounded-[2rem] transition-all shadow-xl hover:shadow-rose-200/50 border border-rose-100"
                >
                    <LogOut className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    Terminate Session
                </button>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">
                    Auralis Protocol v2.5.4 | Secure Registry Link Established
                </p>
            </div>
        </div>
    );
};

export default Settings;
