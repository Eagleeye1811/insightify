import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/authcontext";
import "../pages/Landing.css"; // Reuse existing styles

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Check if we are on the landing page (to optionally change style)
    const isLanding = location.pathname === "/";

    return (
        <nav className="fixed top-6 left-0 right-0 z-100 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl">
                    {/* Logo */}
                    <div
                        className="nav-brand cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className="brand-icon">
                            <Sparkles size={18} color="white" />
                        </div>
                        Insightify
                    </div>

                    {/* Central Navigation Menu */}
                    <div className="nav-menu-center hidden md:flex items-center gap-8 bg-white/5 border border-white/10 rounded-full px-8 py-2">
                        <button onClick={() => navigate('/dashboard')} className={`nav-link-pill ${location.pathname === '/dashboard' ? 'text-white' : 'text-white/70'}`}>Dashboard</button>
                        <button onClick={() => navigate('/analyze')} className={`nav-link-pill ${location.pathname === '/analyze' ? 'text-white' : 'text-white/70'}`}>Analyze</button>
                        <button onClick={() => navigate('/voice-agent')} className={`nav-link-pill ${location.pathname === '/voice-agent' ? 'text-white' : 'text-white/70'}`}>Voice Agent</button>
                        <button onClick={() => navigate('/profile')} className={`nav-link-pill ${location.pathname === '/profile' ? 'text-white' : 'text-white/70'}`}>Profile</button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="nav-actions">
                        {currentUser ? (
                            // Logged In View
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                                    {currentUser.email?.[0].toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            // Logged Out View
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white font-medium text-sm transition-colors duration-300 hidden sm:block">
                                    Login
                                </button>
                                <button onClick={() => navigate('/login')} className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-300 shadow-lg">
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
