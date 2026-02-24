import React, { useState, useEffect } from 'react';
import { Pill, Stethoscope, FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPatientTimeline } from '../lib/api';

const TimelineItem = ({ event, index }) => {
    // Dynamic icon and color mapping
    const getIcon = () => {
        switch (event.event) {
            case 'Admission': return { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' };
            case 'Medication Review': return { icon: Pill, color: 'text-blue-500 bg-blue-500/10' };
            case 'Physician Consult': return { icon: Stethoscope, color: 'text-purple-500 bg-purple-500/10' };
            case 'Specialist Review': return { icon: FileText, color: 'text-amber-500 bg-amber-500/10' };
            default: return { icon: Activity, color: 'text-slate-500 bg-slate-500/10' };
        }
    };

    const { icon: Icon, color } = getIcon();
    const dateObj = new Date(event.time);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-8 pb-8 last:pb-0 group"
        >
            {/* Connector Line */}
            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border group-last:hidden" />

            {/* Dot */}
            <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center border-2 border-background ${color} ring-4 ring-background`}>
                <Icon className="h-3 w-3" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                <h4 className="text-sm font-semibold text-foreground">{event.event}</h4>
                <span className="text-[10px] text-muted-foreground">
                    {dateObj.toLocaleDateString()}, {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg border border-border/50">
                Patient monitored by {event.provider}. Vitals logged and reviewed.
            </p>
        </motion.div>
    );
};

const Timeline = ({ patientId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!patientId) return;

        const loadTimeline = async () => {
            setLoading(true);
            try {
                const data = await fetchPatientTimeline(patientId);
                // Just take the last 5 events for the dashboard preview
                setEvents(data.slice(-5).reverse());
            } catch (err) {
                console.error("Error loading timeline:", err);
            } finally {
                setLoading(false);
            }
        };

        loadTimeline();
    }, [patientId]);

    if (loading) return <div className="space-y-4 py-4 text-center text-sm text-muted-foreground">Loading history...</div>;
    if (events.length === 0) return <div className="space-y-4 py-4 text-center text-sm text-muted-foreground">No events recorded.</div>;

    return (
        <div className="space-y-2">
            {events.map((event, index) => (
                <TimelineItem key={`${event.time}-${index}`} event={event} index={index} />
            ))}
        </div>
    );
};

export default Timeline;
