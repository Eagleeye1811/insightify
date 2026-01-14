import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Loader2,
  Star,
  Download,
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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing analysis...");
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Loading text animation
  useEffect(() => {
    if (!isAnalyzing) return;

    const loadingStates = [
      "Initializing analysis...",
      "Fetching app data from Play Store...",
      "Collecting user reviews...",
      "Processing thousands of reviews...",
      "Analyzing sentiment patterns...",
      "Identifying key themes...",
      "Detecting user complaints...",
      "Finding feature requests...",
      "Calculating sentiment scores...",
      "Generating AI insights...",
      "Creating growth recommendations...",
      "Almost done...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingStates.length;
      setLoadingText(loadingStates[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Real-time search as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        // Search directly via our backend
        const searchResponse = await authenticatedFetch(
          "http://localhost:5001/api/search-apps",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: searchQuery }),
          }
        );

        if (searchResponse.ok) {
          const data = await searchResponse.json();
          setSearchResults(data.apps || []);
        } else {
          // Fallback: show search term as single result
          setSearchResults([
            {
              appId: searchQuery,
              title: searchQuery,
              icon: "📱",
              rating: "N/A",
              installs: "Search Play Store",
            },
          ]);
        }
      } catch (error) {
        console.error("Search error:", error);
        // Fallback: show search term as single result
        setSearchResults([
          {
            appId: searchQuery,
            title: searchQuery,
            icon: "📱",
            rating: "N/A",
            installs: "Search Play Store",
          },
        ]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce search

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Handle app selection and trigger analysis
  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    setSearchQuery("");
    setSearchResults([]);
    setIsAnalyzing(true);
    setLoadingText("Initializing analysis...");

    try {
      console.log("🔍 Starting analysis for:", app.appId);

      // Step 1: Trigger scraping
      const analyzeResponse = await authenticatedFetch(
        "http://localhost:5001/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ term: app.appId }),
        }
      );

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || "Failed to start analysis");
      }

      console.log("✅ Analysis started:", analyzeData);

      // Step 2: Wait for scraping to complete (poll for status)
      const appId = analyzeData.appId;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      const pollForData = async () => {
        while (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Polling attempt ${attempts}/${maxAttempts} for ${appId}...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));

          try {
            const statusResponse = await authenticatedFetch(
              `http://localhost:5001/api/results/${appId}`,
              {
                method: "GET",
              }
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();

              if (statusData.reviews && statusData.reviews.length > 0) {
                console.log(`✅ Reviews fetched! Count: ${statusData.reviews.length}`);
                console.log("🤖 Triggering AI analysis...");

                // Step 3: Trigger AI analysis
                const aiResponse = await authenticatedFetch(
                  "http://localhost:5001/api/analyze-ai",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ appId }),
                  }
                );

                if (aiResponse.ok) {
                  console.log("✅ AI analysis started successfully");

                  // Wait for AI to process (may take 30-60 seconds)
                  console.log("⏳ Waiting for AI analysis to complete...");
                  await new Promise((resolve) => setTimeout(resolve, 10000));

                  // Step 4: Save onboarding data
                  updateOnboardingData("appName", app.title);
                  await saveOnboardingToFirestore();

                  setAnalysisComplete(true);
                  setIsAnalyzing(false);

                  console.log("🎉 Analysis complete! Redirecting to dashboard...");

                  // Navigate to dashboard with appId after 2 seconds
                  setTimeout(() => {
                    navigate(`/dashboard?appId=${appId}`);
                  }, 2000);

                  return;
                }
              } else {
                console.log(`⏳ Waiting... Reviews not ready yet (attempt ${attempts}/${maxAttempts})`);
              }
            } else {
              console.log(`⏳ Waiting... Data not ready yet (${statusResponse.status})`);
            }
          } catch (error) {
            // 404 is expected while waiting, don't log as error
            if (error.message && !error.message.includes('404')) {
              console.error("⚠️ Polling error:", error.message);
            }
          }
        }

        throw new Error("Analysis timeout - reviews may be too large. Please try again.");
      };

      await pollForData();
    } catch (error) {
      console.error("❌ Analysis error:", error);
      setSearchError(error.message || "Failed to analyze app. Please try again.");
      setIsAnalyzing(false);
      setSelectedApp(null);
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      // Save onboarding data without app
      console.log("Skipping app selection, saving onboarding data...");
      await saveOnboardingToFirestore();
      navigate("/analyze");
    } catch (error) {
      console.error("Error during skip:", error);
      navigate("/analyze");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BackgroundLines className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl z-10">
        {/* Progress Bar: Step 5 of 5 */}
        <div className="mb-12 max-w-lg mx-auto">
          <div className="flex justify-between items-end text-xs font-medium text-zinc-500 mb-3">
            <span className="text-zinc-300">Step 5 of 5</span>
            <span>Connect App</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-violet-500 w-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
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
          {!isAnalyzing && !analysisComplete ? (
            <>
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-purple-500">
                  <div className="pl-4 text-zinc-500">
                    <Search size={22} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError("");
                    }}
                    placeholder="Type your app name (e.g., Instagram, WhatsApp)..."
                    className="w-full bg-transparent text-white py-4 px-4 focus:outline-none placeholder:text-zinc-600"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="pr-4">
                      <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((app, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectApp(app)}
                      className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 p-4 rounded-xl flex items-center gap-4 transition-all duration-200 group"
                    >
                      {/* App Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        {app.icon && app.icon.startsWith("http") ? (
                          <img
                            src={app.icon}
                            alt={app.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '📱';
                            }}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          "📱"
                        )}
                      </div>

                      {/* App Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate group-hover:text-purple-300 transition-colors">
                          {app.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {app.rating && app.rating !== "N/A" && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <Star size={12} className="fill-yellow-500 text-yellow-500" />
                              <span>{app.rating}</span>
                            </div>
                          )}
                          {app.installs && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <Download size={12} />
                              <span>{app.installs}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="mt-4 p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {searchError}
                </div>
              )}
            </>
          ) : isAnalyzing ? (
            // Analyzing State
            <div className="bg-zinc-900/50 border border-purple-500/30 p-8 rounded-xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-purple-500/10 animate-pulse"></div>

              {/* App being analyzed */}
              {selectedApp && (
                <div className="flex items-center justify-center gap-4 z-10 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                    {selectedApp.icon && selectedApp.icon.startsWith("http") ? (
                      <img
                        src={selectedApp.icon}
                        alt={selectedApp.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '📱';
                        }}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      "📱"
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-xl">
                      {selectedApp.title}
                    </h3>
                    <p className="text-purple-400 text-sm">Analyzing...</p>
                  </div>
                </div>
              )}

              {/* Loading Animation */}
              <div className="flex justify-center z-10 relative">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              </div>

              {/* Dynamic Loading Text */}
              <div className="space-y-2 z-10 relative">
                <p className="text-white font-medium text-lg">{loadingText}</p>
                <p className="text-zinc-400 text-sm">
                  This may take 1-2 minutes. Please don't close this page.
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 z-10 relative">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : analysisComplete ? (
            // Success State
            <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-500/30 p-8 rounded-xl text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-2xl mb-2">
                  Analysis Complete!
                </h3>
                <p className="text-green-400">
                  {selectedApp?.title} has been analyzed successfully.
                </p>
                <p className="text-zinc-400 text-sm mt-2">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Navigation */}
        {!isAnalyzing && !analysisComplete && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/onboarding/step-4")}
              className="px-6 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium flex items-center gap-2"
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={handleSkip}
              disabled={isSaving}
              className="group px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Skip for now"}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}

        {/* Helper Text */}
        {!isAnalyzing && !analysisComplete && (
          <p className="text-center text-zinc-500 text-xs mt-6">
            Search and select your app for instant analysis, or skip to add it later
          </p>
        )}
      </div>
    </BackgroundLines>
  );
};

export default OnBoarding5;
