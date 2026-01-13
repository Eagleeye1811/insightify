import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Loader2,
} from "lucide-react";
import { BackgroundLines } from "../../components/ui/animated-svg-background";
import { useOnboarding } from "../../context/OnboardingContext";
import { authenticatedFetch } from "../../lib/authHelper";
import { useAuth } from "../../context/AuthContext";

const OnBoarding5 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onboardingData, updateOnboardingData, saveOnboardingToFirestore } =
    useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedApp, setSelectedApp] = useState(
    onboardingData.appName ? { name: onboardingData.appName, icon: "📱" } : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [appData, setAppData] = useState(null);

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchError("");
  };

  // Fetch app from Google Play Store via API
  const handleSelectApp = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await authenticatedFetch(
        "http://localhost:5001/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ term: searchQuery }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch app data");
      }

      // Set the selected app with data from API
      setSelectedApp({
        name: data.appName || searchQuery,
        icon: data.icon || "📱",
        appId: data.appId,
      });
      setAppData(data);
      setSearchQuery(""); // Clear search to show the selected card
    } catch (error) {
      console.error("Error fetching app:", error);
      setSearchError(error.message || "Failed to fetch app. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Update app name if selected - need to wait for state update
      const appName = selectedApp ? selectedApp.name : "";
      if (appName) {
        updateOnboardingData("appName", appName);
      }

      // Wait a bit for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Save all onboarding data to Firestore
      console.log("Starting to save onboarding data...");
      const success = await saveOnboardingToFirestore();

      if (success) {
        navigate("/analyze");
      } else {
        // Even if Firestore fails, navigate to analyze
        console.error("Failed to save onboarding data, but continuing...");
        navigate("/analyze");
      }
    } catch (error) {
      console.error("Error during finish:", error);
      navigate("/analyze");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BackgroundLines className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl z-10">
        {/* Progress Bar: Step 5 of 5 */}
        <div className="mb-10">
          <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
            <span className="text-zinc-300">Step 5 of 5</span>
            <span>Connect App</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-violet-500 w-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-medium mb-2">
            <Sparkles size={12} />
            <span>Final Step</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Let's find your app
          </h1>
          <p className="text-zinc-400 text-lg">
            Search for your application on the App Store or Play Store to start
            tracking immediately.
          </p>
        </div>

        {/* Search Interface */}
        <div className="mb-12 relative">
          {/* If app is NOT selected yet, show search bar */}
          {!selectedApp ? (
            <>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl opacity-20 group-focus-within:opacity-50 transition-opacity blur"></div>
                <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
                  <div className="pl-4 text-zinc-500">
                    <Search size={22} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        handleSelectApp();
                      }
                    }}
                    placeholder="Type your app name or Play Store URL..."
                    className="w-full bg-transparent text-white py-4 px-4 focus:outline-none placeholder:text-zinc-600"
                    autoFocus
                  />
                  {isSearching ? (
                    <div className="pr-4">
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    </div>
                  ) : (
                    searchQuery.trim() && (
                      <button
                        onClick={handleSelectApp}
                        className="mr-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Search
                      </button>
                    )
                  )}
                </div>
              </div>
              {searchError && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {searchError}
                </div>
              )}
            </>
          ) : (
            // If App IS Selected, show this "Connected" Card
            <div className="bg-zinc-900/50 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4 animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-2xl z-10">
                📱
              </div>
              <div className="z-10">
                <h3 className="font-bold text-white text-lg">
                  {selectedApp.name}
                </h3>
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
            disabled={isSaving}
            className="group px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 bg-white text-black hover:bg-purple-50 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Continue"}
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

export default OnBoarding5;
