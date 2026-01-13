import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Mic, User, Settings, PieChart, Bot } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' }, // Placeholder path
        { icon: Mic, label: 'Voice Agent', path: '/voice-agent' },
        { icon: Bot, label: 'Chat Assistant', path: '/chat' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <span style={{ color: 'var(--color-primary)' }}>Insightify</span>
            </div>

            <nav className="nav-links">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <NavLink to="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
