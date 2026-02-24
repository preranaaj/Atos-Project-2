import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { fetchPatientVitals } from '../lib/api';
import { Activity, Heart, Thermometer, Zap } from 'lucide-react';

const VITALS_META = [
    { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', color: '#3b82f6' },
    { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', color: '#ef4444' },
    { key: 'spo2', label: 'SpO₂', unit: '%', color: '#10b981' },
    { key: 'temp', label: 'Temperature', unit: '°C', color: '#f59e0b' },
];

const VitalsChart = ({ patientId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeVitals, setActiveVitals] = useState(['heartRate', 'sbp']);

    useEffect(() => {
        if (!patientId && patientId !== 0) return;

        const loadVitals = async () => {
            setLoading(true);
            setError(null);
            try {
                const vitals = await fetchPatientVitals(patientId);
                if (!vitals || vitals.length === 0) {
                    setData([]);
                    return;
                }

                const chartData = vitals.map((v, idx) => {
                    let timeStr = '';
                    try {
                        const ts = String(v.timestamp || '');
                        if (ts.includes('T')) {
                            timeStr = ts.split('T')[1].substring(0, 5);
                        } else if (ts.includes(' ')) {
                            timeStr = ts.split(' ')[1].substring(0, 5);
                        } else {
                            timeStr = ts.substring(0, 5) || `T-${(vitals.length - idx)}`;
                        }
                    } catch (e) {
                        timeStr = `P-${idx}`;
                    }

                    return {
                        time: timeStr,
                        heartRate: Number(v.hr || 0),
                        sbp: Number(v.sbp || 0),
                        spo2: Number(v.spo2 || 0),
                        temp: Number(v.temp || 0)
                    };
                });
                setData(chartData);
            } catch (err) {
                console.error("Vitals synchronization error:", err);
                setError("Telemetry Link Interrupted");
            } finally {
                setLoading(false);
            }
        };

        loadVitals();
    }, [patientId]);

    const toggleVital = (key) => {
        setActiveVitals(prev =>
            prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]
        );
    };

    if (!patientId && patientId !== 0) return (
        <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Select patient to initialize stream</p>
        </div>
    );

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div className="text-primary font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing real-time data...</div>
        </div>
    );

    if (error) return (
        <div className="h-full flex items-center justify-center text-rose-500 font-black uppercase tracking-widest text-xs p-10 text-center glass-card border-rose-200">
            {error}
        </div>
    );

    if (data.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic gap-4 p-10 bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100/50">
            <p className="font-black uppercase tracking-widest text-[10px]">No telemetry logged for this session</p>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-6">
            {/* Interactive Control Logic */}
            <div className="flex flex-wrap items-center gap-3">
                {VITALS_META.map(v => (
                    <button
                        key={v.key}
                        onClick={() => toggleVital(v.key)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${activeVitals.includes(v.key)
                                ? 'bg-white shadow-sm border-white'
                                : 'bg-transparent text-slate-400 border-slate-100 opacity-60'
                            }`}
                        style={activeVitals.includes(v.key) ? { color: v.color, borderColor: `${v.color}40` } : {}}
                    >
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                        {v.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {VITALS_META.map(v => (
                                <linearGradient key={v.key} id={`color${v.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={v.color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '1.25rem',
                                border: '1px solid rgba(255,255,255,0.7)',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                backdropFilter: 'blur(10px)',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontWeight: 800, fontSize: '12px', padding: '2px 0' }}
                            labelStyle={{ marginBottom: '8px', color: '#64748b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
                        />
                        {VITALS_META.filter(v => activeVitals.includes(v.key)).map(v => (
                            <Area
                                key={v.key}
                                type="monotone"
                                dataKey={v.key}
                                stroke={v.color}
                                strokeWidth={4}
                                fillOpacity={1}
                                fill={`url(#color${v.key})`}
                                name={v.label}
                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                animationDuration={1000}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default VitalsChart;
