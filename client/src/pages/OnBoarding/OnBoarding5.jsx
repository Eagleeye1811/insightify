import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Smartphone } from "lucide-react";

const OnBoarding5 = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Simulate searching for an app
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedApp(null); // Reset selection if typing

    if (query.length > 2) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    } else {
      setIsSearching(false);
    }
  };

  const handleSelectApp = () => {
    // Simulate selecting the result
    setSelectedApp({ name: searchQuery || "My Awesome App", icon: "📱" });
    setSearchQuery(""); // Clear search to show the selected card
  };

  const handleFinish = () => {
    // Final logic: Save everything and go to Dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience - Golden/Warm for "Success" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl z-10">
        
        {/* Progress Bar: Step 5 of 5 */}
        <div className="mb-10">
            <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
                <span className="text-zinc-300">Step 5 of 5</span>
                <span>Connect App</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-2">
                <Sparkles size={12} />
                <span>Final Step</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Let's find your app
            </h1>
            <p className="text-zinc-400 text-lg">
                Search for your application on the App Store or Play Store to start tracking immediately.
            </p>
        </div>

        {/* Search Interface */}
        <div className="mb-12 relative">
            
            {/* If app is NOT selected yet, show search bar */}
            {!selectedApp ? (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 group-focus-within:opacity-50 transition-opacity blur"></div>
                    <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50">
                        <div className="pl-4 text-zinc-500">
                            <Search size={22} />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Type your app name (e.g. Instagram)..."
                            className="w-full bg-transparent text-white py-4 px-4 focus:outline-none placeholder:text-zinc-600"
                            autoFocus
                        />
                        {isSearching && (
                            <div className="pr-4">
                                <div className="w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    
                    {/* Simulated Search Result Dropdown */}
                    {searchQuery.length > 2 && !isSearching && (
                        <div 
                            onClick={handleSelectApp}
                            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl cursor-pointer hover:bg-zinc-800 transition-colors animate-in slide-in-from-top-2"
                        >
                            <div className="flex items-center gap-3 p-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-xl">
                                    📱
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{searchQuery}</p>
                                    <p className="text-xs text-zinc-500">Business • 4.8★</p>
                                </div>
                                <div className="ml-auto text-blue-500 text-xs font-bold px-3 py-1 bg-blue-500/10 rounded-full">
                                    Connect
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // If App IS Selected, show this "Connected" Card
                <div className="bg-zinc-900/50 border border-indigo-500/30 p-4 rounded-xl flex items-center gap-4 animate-in zoom-in duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-2xl z-10">
                        📱
                    </div>
                    <div className="z-10">
                        <h3 className="font-bold text-white text-lg">{selectedApp.name}</h3>
                        <p className="text-green-400 text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} /> Ready to sync
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedApp(null)} 
                        className="ml-auto text-xs text-zinc-500 hover:text-white z-10 underline"
                    >
                        Change
                    </button>
                </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between">
            <button 
                onClick={() => navigate("/onboarding/step-4")}
                className="px-6 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <button 
                onClick={handleFinish}
                // Allow finish only if app is selected OR if they want to skip (optional, here I force selection or non-empty query)
                className={`
                    group px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2
                    ${selectedApp
                        ? "bg-white text-black hover:bg-indigo-50 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }
                `}
                disabled={!selectedApp}
            >
                Launch Dashboard
                <Sparkles size={16} className={selectedApp ? "text-indigo-600 fill-indigo-600" : ""} />
            </button>
        </div>

      </div>
    </div>
  );
};

export default OnBoarding5;