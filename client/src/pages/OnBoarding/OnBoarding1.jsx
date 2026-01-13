// client/src/pages/Onboarding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart2, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Layers
} from "lucide-react";
// Importing the image from the assets folder based on your file structure shown
import OnboardingBg from '../../assets/image.png'; // ✅This goes up 2 levels to 'src'

const OnBoarding1 = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the next step or directly to the dashboard
    navigate("/onboarding/step-2");
  };

  return (
    // Outer container: Dark theme background, flex layout for split screen
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      
      {/* ================= LEFT COLUMN: CONTENT ================= */}
      {/* Full width on mobile, 50% on large screens. Centered vertically. */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative z-10">
        
        {/* Optional Brand Header located top left */}
        <div className="absolute top-8 left-8 sm:left-12 lg:left-24 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layers className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">Insightify</span>
        </div>

        {/* Main Text Content Area */}
        <div className="max-w-lg mx-auto lg:mx-0 mt-16 lg:mt-0">
            
            {/* Headline & Subtext */}
            <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
                    Welcome to <br />
                    {/* Gradient text effect for branding */}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                        Insightify
                    </span>
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                    The comprehensive platform for mastering your app's performance. Connect data sources, analyze sentiment with AI, and grow faster.
                </p>
            </div>

            {/* Feature List - Adapted to Dark Theme */}
            <div className="space-y-8 pt-12">
                {/* Feature 1 */}
                <div className="flex gap-5 group">
                    {/* Icon Container: Dark zinc bg with subtle border and hover glow */}
                    <div className="shrink-0 mt-1 w-12 h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all duration-300">
                        <BarChart2 size={22} className="text-blue-500 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Connect Data Sources</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Seamlessly integrate with App Store & Google Play consoles for real-time tracking.</p>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-5 group">
                     <div className="shrink-0 mt-1 w-12 h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all duration-300">
                        <Zap size={22} className="text-purple-500 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Automate review tagging and analyze user sentiment trends instantly.</p>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-5 group">
                     <div className="shrink-0 mt-1 w-12 h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-300">
                        <ShieldCheck size={22} className="text-emerald-500 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Growth Recommendations</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">Receive actionable, data-driven steps to improve ratings and retention.</p>
                    </div>
                </div>
            </div>

            {/* Action Area (Button and Steps) */}
            <div className="pt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                <button 
                    onClick={handleGetStarted}
                    // White button on black background for maximum contrast, matching reference style but inverted colors
                    className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all duration-300 hover:pr-12 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    Get Started
                    {/* Animated arrow that slides in on hover */}
                    <ArrowRight size={18} className="absolute right-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </button>
                
                {/* Step indicator */}
                <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                    <span>Step 1 of 5</span>
                    {/* Progress bar visual */}
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-blue-600 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: IMAGE ================= */}
      {/* Hidden on mobile/tablet, visible on desktop (lg screen and up) */}
      <div className="hidden lg:block w-1/2 relative bg-zinc-900 h-full overflow-hidden">
        
        {/* Gradient Overlay: Blends the hard edge between the black content area and the image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10 pointer-events-none"></div>
        
        {/* The Image Asset */}
        <img 
            src={OnboardingBg} 
            alt="Insightify Dashboard Preview" 
            className="w-full h-full object-cover object-center scale-105"
        />
      </div>

    </div>
  );
};

export default OnBoarding1;