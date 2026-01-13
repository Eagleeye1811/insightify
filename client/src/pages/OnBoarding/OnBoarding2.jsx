// client/src/pages/OnboardingStep2.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Users,
  PenTool,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { BackgroundLines } from "../../components/ui/animated-svg-background";
import { useOnboarding } from "../../context/OnboardingContext";

const OnBoarding2 = () => {
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState(onboardingData.role || null);

  // The options available to the user
  const roles = [
    {
      id: "developer",
      title: "Developer",
      desc: "I build and code applications.",
      icon: <Code2 size={32} />,
    },
    {
      id: "manager",
      title: "Manager",
      desc: "I lead teams and manage projects.",
      icon: <Users size={32} />,
    },
    {
      id: "designer",
      title: "Designer",
      desc: "I create designs and user experiences.",
      icon: <PenTool size={32} />,
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      updateOnboardingData("role", selectedRole);
      navigate("/onboarding/step-3");
    }
  };

  const handleBack = () => {
    navigate("/onboarding"); // Go back to the Welcome page
  };

  return (
    <BackgroundLines className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      {/* --- CONTENT CONTAINER --- */}
      <div className="w-full max-w-4xl z-10">
        {/* Progress Bar */}
        <div className="mb-12 max-w-lg mx-auto">
          <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
            <span className="text-zinc-300">Step 2 of 5</span>
            <span>Role Selection</span>
          </div>
          {/* The Track */}
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            {/* The Fill (40% for step 2) */}
            <div className="h-full bg-purple-600 w-[40%] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            What's your role?
          </h1>
          <p className="text-zinc-400 text-lg">
            Help us personalize your experience to fit your needs.
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`
                        relative group cursor-pointer p-8 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4
                        ${
                          selectedRole === role.id
                            ? "bg-zinc-900 border-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.15)] ring-1 ring-purple-500/50" // Active State
                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900" // Default State
                        }
                    `}
            >
              {/* Checkmark Badge (Visible only when selected) */}
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 text-purple-500 animate-in zoom-in duration-200">
                  <CheckCircle2
                    size={20}
                    fill="currentColor"
                    className="text-black"
                  />
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                        p-4 rounded-full transition-colors duration-300
                        ${
                          selectedRole === role.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700"
                        }
                    `}
              >
                {role.icon}
              </div>

              {/* Text */}
              <div>
                <h3
                  className={`text-lg font-semibold mb-2 transition-colors ${
                    selectedRole === role.id ? "text-white" : "text-zinc-200"
                  }`}
                >
                  {role.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between max-w-lg mx-auto mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium px-4 py-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`
                    flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300
                    ${
                      selectedRole
                        ? "bg-white text-black hover:bg-zinc-200 hover:px-10 shadow-lg cursor-pointer"
                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                    }
                `}
            style={{ cursor: selectedRole ? "pointer" : "not-allowed" }}
          >
            Continue
            <ArrowRight
              size={16}
              className={selectedRole ? "opacity-100" : "opacity-0"}
            />
          </button>
        </div>
      </div>
    </BackgroundLines>
  );
};

export default OnBoarding2;
