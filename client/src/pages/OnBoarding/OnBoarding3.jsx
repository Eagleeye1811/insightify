import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, ArrowRight, ArrowLeft } from "lucide-react";
import { BackgroundLines } from "../../components/ui/animated-svg-background";
import { useOnboarding } from "../../context/OnboardingContext";

const OnBoarding3 = () => {
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [workspaceName, setWorkspaceName] = useState(
    onboardingData.companyName || ""
  );

  const handleContinue = () => {
    if (workspaceName.trim()) {
      updateOnboardingData("companyName", workspaceName.trim());
      navigate("/onboarding/step-4");
    }
  };

  return (
    <BackgroundLines className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl z-10">
        {/* Progress Bar: Step 3 of 5 */}
        <div className="mb-10">
          <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
            <span className="text-zinc-300">Step 3 of 5</span>
            <span>Workspace</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 w-[60%] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
          </div>
        </div>

        {/* Header - Changed to focus on Workspace */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Name your Company
          </h1>
          <p className="text-zinc-400">This will be your team's home base.</p>
        </div>

        {/* Input Field */}
        <div className="max-w-md mx-auto mb-12">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5 ml-1">
            Company Name
          </label>
          <div className="relative group">
            <Layout
              className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-purple-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Acme Corp, Project X"
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-zinc-600"
              autoFocus
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/onboarding/step-2")}
            className="px-6 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!workspaceName.trim()}
            className={`
                    group px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2
                    ${
                      workspaceName.trim()
                        ? "bg-white text-black hover:bg-zinc-200 hover:scale-105 cursor-pointer"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }
                `}
          >
            Continue
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </BackgroundLines>
  );
};

export default OnBoarding3;
