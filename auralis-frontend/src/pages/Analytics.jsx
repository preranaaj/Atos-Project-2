import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Users, Activity, BedDouble, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const demographicsData = [
    { name: '0-18', value: 150 },
    { name: '19-35', value: 300 },
    { name: '36-50', value: 450 },
    { name: '51-70', value: 200 },
    { name: '70+', value: 100 },
];

const occupancyData = [
    { day: 'Mon', patients: 120, capacity: 150 },
    { day: 'Tue', patients: 132, capacity: 150 },
    { day: 'Wed', patients: 145, capacity: 150 }, // Peak
    { day: 'Thu', patients: 138, capacity: 150 },
    { day: 'Fri', patients: 125, capacity: 150 },
    { day: 'Sat', patients: 90, capacity: 150 },
    { day: 'Sun', patients: 85, capacity: 150 },
];

const conditionData = [
    { name: 'Cardiology', patients: 85, color: '#3b82f6' },
    { name: 'Neurology', patients: 45, color: '#8b5cf6' },
    { name: 'Orthopedics', patients: 60, color: '#f59e0b' },
    { name: 'Oncology', patients: 30, color: '#ef4444' },
    { name: 'Pediatrics', patients: 55, color: '#10b981' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const KPICard = ({ title, value, change, icon: Icon, time, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(change)}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-dashed border-border">
            vs. previous {time}
        </p>
    </motion.div>
);

const Analytics = () => {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Hospital Analytics</h2>
                <p className="text-muted-foreground">Detailed insights into patient demographics and ward efficiency.</p>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Admissions" value="1,248" change={12} icon={Users} time="month" delay={0} />
                <KPICard title="Avg. Recovery Time" value="4.2 Days" change={-5} icon={Activity} time="month" delay={0.1} />
                <KPICard title="Bed Occupancy" value="86%" change={8} icon={BedDouble} time="week" delay={0.2} />
                <KPICard title="Appointments" value="342" change={24} icon={Calendar} time="week" delay={0.3} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ward Occupancy Trend */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-card p-6 rounded-2xl border border-border shadow-sm"
                >
                    <h3 className="text-lg font-bold mb-6">Ward Occupancy Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={occupancyData}>
                                <defs>
                                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="patients"
                                    stroke="var(--primary)"
                                    fillOpacity={1}
                                    fill="url(#colorPatients)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Patient Demographics */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-card p-6 rounded-2xl border border-border shadow-sm"
                >
                    <h3 className="text-lg font-bold mb-6">Patient Demographics (Age)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographicsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {demographicsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Department Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2"
                >
                    <h3 className="text-lg font-bold mb-6">Patients by Department</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={conditionData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                                <Tooltip
                                    cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Bar dataKey="patients" radius={[0, 4, 4, 0]} barSize={32}>
                                    {conditionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
