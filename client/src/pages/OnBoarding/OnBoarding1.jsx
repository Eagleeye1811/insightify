// client/src/pages/Onboarding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, Zap, ShieldCheck, ArrowRight, Layers } from "lucide-react";
// Importing the image from the assets folder based on your file structure shown
import OnboardingBg from "../../assets/image.png"; // ✅This goes up 2 levels to 'src'

const OnBoarding1 = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the next step or directly to the dashboard
    navigate("/onboarding/step-2");
  };

  return (
    // Outer container: Fixed height, no scrolling, flex layout for split screen
    <div className="h-screen bg-black text-white font-sans flex overflow-hidden">
      {/* ================= LEFT COLUMN: CONTENT ================= */}
      {/* Full width on mobile, 50% on large screens. Centered vertically. */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-8 sm:py-12 relative z-10 overflow-y-auto">
        {/* Main Text Content Area */}
        <div className="max-w-lg mx-auto lg:mx-0 w-full">
          {/* Headline & Subtext */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Grow Your App by <br />
              {/* Gradient text effect for branding */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500">
                Understanding Reviews
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              We analyze every review to show you exactly what users love and what needs improvement. 
              Turn feedback into growth with AI-powered insights.
            </p>
          </div>

          {/* Feature List - Adapted to Dark Theme */}
          <div className="space-y-5 sm:space-y-6 md:space-y-8 pt-8 sm:pt-10 md:pt-12">
            {/* Feature 1 */}
            <div className="flex gap-3 sm:gap-4 md:gap-5 group">
              {/* Icon Container: Dark zinc bg with subtle border and hover glow */}
              <div className="shrink-0 mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all duration-300">
                <BarChart2
                  size={20}
                  className="text-purple-500 transition-colors sm:w-[22px] sm:h-[22px]"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Analyze All Your Reviews
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  We automatically collect and analyze reviews from App Store & Google Play 
                  to give you a complete picture.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-3 sm:gap-4 md:gap-5 group">
              <div className="shrink-0 mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all duration-300">
                <Zap size={20} className="text-purple-500 transition-colors sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Discover What Users Really Want
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  Our AI reads every review to identify patterns, complaints, and 
                  feature requests you might have missed.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-3 sm:gap-4 md:gap-5 group">
              <div className="shrink-0 mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-900/50 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-300">
                <ShieldCheck
                  size={20}
                  className="text-emerald-500 transition-colors sm:w-[22px] sm:h-[22px]"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Get Clear Steps to Grow
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  We show you exactly what to fix, what to improve, and what features 
                  to build next based on real user feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Action Area (Button and Steps) */}
          <div className="pt-8 sm:pt-10 md:pt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
            <button
              onClick={handleGetStarted}
              // White button on black background for maximum contrast, matching reference style but inverted colors
              className="group relative inline-flex items-center gap-3 bg-white text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all duration-300 hover:pr-10 sm:hover:pr-12 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
              {/* Animated arrow that slides in on hover */}
              <ArrowRight
                size={16}
                className="absolute right-3 sm:right-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 sm:w-[18px] sm:h-[18px]"
              />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-zinc-500">
              <span>Step 1 of 5</span>
              {/* Progress bar visual */}
              <div className="w-16 sm:w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-1/5 h-full bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: IMAGE ================= */}
      {/* Hidden on mobile/tablet, visible on desktop (lg screen and up) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden">
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
