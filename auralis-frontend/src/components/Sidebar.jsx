import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    Calendar,
    Settings,
    LogOut,
    X,
    PieChart,
    Stethoscope,
    Shield,
    Heart,
    FileText,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout, user } = useAuth();

    const getNavItems = () => {
        if (user?.role === 'Admin') {
            return [
                { name: 'Control Center', path: '/admin', icon: Shield },
                { name: 'Analytics', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Clinicians', path: '/doctors', icon: Stethoscope },
                { name: 'System Settings', path: '/settings', icon: Settings },
            ];
        }
        if (user?.role === 'Doctor') {
            return [
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Appointments', path: '/appointments', icon: ClipboardList },
                { name: 'Patients', path: '/patients', icon: Users },
                { name: 'Analytics', path: '/analytics', icon: PieChart },
                { name: 'Schedule', path: '/schedule', icon: Calendar },
                { name: 'Settings', path: '/settings', icon: Settings },
            ];
        }
        // Default: Patient
        return [
            { name: 'My Health', path: '/portal', icon: Heart },
            { name: 'Appointments', path: '/schedule', icon: Calendar },
            { name: 'Medical Records', path: '/patients', icon: FileText },
            { name: 'Settings', path: '/settings', icon: Settings },
        ];
    };

    const navItems = getNavItems();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card border-r border-border shadow-sm">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        Auralis
                    </span>
                </div>
                <button
                    className="md:hidden text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:transform-none",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </motion.aside>
        </>
    );
};

export default Sidebar;
