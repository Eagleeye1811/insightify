import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Bug, MessageSquare, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";

const OnBoarding4 = () => {
  const navigate = useNavigate();
  // Multi-select state
  const [selectedGoals, setSelectedGoals] = useState([]);

  const goals = [
    {
      id: "sentiment",
      title: "Track Sentiment",
      desc: "Monitor user happiness & trends.",
      icon: <Target size={24} />,
    },
    {
      id: "bugs",
      title: "Fix Bugs Faster",
      desc: "Prioritize crash reports & issues.",
      icon: <Bug size={24} />,
    },
    {
      id: "reviews",
      title: "Manage Reviews",
      desc: "Reply to user feedback instantly.",
      icon: <MessageSquare size={24} />,
    },
    {
      id: "growth",
      title: "Analyze Growth",
      desc: "Track downloads & retention.",
      icon: <BarChart3 size={24} />,
    },
  ];

  const toggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((item) => item !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleContinue = () => {
     // We will connect Step 5 here later
     console.log("Goals selected:", selectedGoals);
    navigate("/onboarding/step-5");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience - Blue/Purple for "Analysis" vibe */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-4xl z-10">
        
        {/* Progress Bar: Step 4 of 5 */}
        <div className="mb-10 max-w-xl mx-auto">
            <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
                <span className="text-zinc-300">Step 4 of 5</span>
                <span>Goals</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[80%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                What do you want to track?
            </h1>
            <p className="text-zinc-400">
                Select all that apply. We'll prioritize these in your feed.
            </p>
        </div>

        {/* Grid for Goals Selection (Moved from Page 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                    <div 
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`
                            cursor-pointer p-6 rounded-2xl border transition-all duration-200 flex items-center gap-5 select-none
                            ${isSelected 
                                ? "bg-blue-950/30 border-blue-500/50 ring-1 ring-blue-500/50" 
                                : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                            }
                        `}
                    >
                        <div className={`shrink-0 p-3 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                            {goal.icon}
                        </div>
                        <div className="text-left">
                            <h3 className={`font-semibold text-base ${isSelected ? "text-white" : "text-zinc-300"}`}>{goal.title}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{goal.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between max-w-xl mx-auto">
            <button 
                onClick={() => navigate("/onboarding/step-3")}
                className="px-6 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <button 
                onClick={handleContinue}
                className={`
                    group px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2
                    ${selectedGoals.length > 0
                        ? "bg-white text-black hover:bg-zinc-200 hover:scale-105" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }
                `}
            >
                Continue
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default OnBoarding4;