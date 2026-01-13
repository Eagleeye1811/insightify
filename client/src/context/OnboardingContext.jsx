import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const OnboardingContext = createContext();

const initialOnboardingData = {
  role: null,
  companyName: "",
  goals: [],
  appName: "",
  completedAt: null,
};

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState(initialOnboardingData);

  // Reset onboarding data whenever the user changes
  useEffect(() => {
    console.log("User changed, resetting onboarding data");
    setOnboardingData(initialOnboardingData);
  }, [user?.uid]); // Reset when user ID changes

  const updateOnboardingData = (field, value) => {
    setOnboardingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveOnboardingToFirestore = async () => {
    if (!user) {
      console.error("No user found, cannot save onboarding data");
      return false;
    }

    try {
      const completionDate = new Date();
      const dataToSave = {
        ...onboardingData,
        completedAt: completionDate,
        userId: user.uid,
      };

      console.log("Saving onboarding data:", dataToSave);

      // Save to subcollection: users/{uid}/onboarding/data
      const onboardingRef = doc(db, "users", user.uid, "onboarding", "data");
      await setDoc(onboardingRef, dataToSave);

      // Also update the main user document to mark onboarding as complete
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          onboardingCompleted: true,
          onboardingCompletedAt: completionDate,
          // Store onboarding data at root level too for easy access
          onboarding: dataToSave,
        },
        { merge: true }
      );

      console.log("✅ Onboarding data saved successfully to Firestore");
      return true;
    } catch (error) {
      console.error("❌ Error saving onboarding data:", error);
      console.error("Error details:", error.message);
      return false;
    }
  };

  const value = {
    onboardingData,
    updateOnboardingData,
    saveOnboardingToFirestore,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
