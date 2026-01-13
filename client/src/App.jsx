// client/src/App.jsx
import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import OnBoarding1 from "./pages/OnBoarding/OnBoarding1";
import OnBoarding2 from "./pages/OnBoarding/OnBoarding2";
import OnBoarding3 from "./pages/OnBoarding/OnBoarding3";
import OnBoarding4 from "./pages/OnBoarding/OnBoarding4";
import OnBoarding5 from "./pages/OnBoarding/OnBoarding5";
// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VoiceAgent from "./pages/VoiceAgent";
import Profile from "./pages/Profile";
import BillingPage from "./pages/Biling";
import Chatbot from "./pages/Chatbot";
import AnalyzeApp from "./pages/AnalyzeApp";

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <Landing />
                </Layout>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Authenticated Routes with Layout */}

            <Route
              path="/analyze"
              element={
                <Layout>
                  <AnalyzeApp />
                </Layout>
              }
            />

            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route path="/onboarding" element={<OnBoarding1 />} />
            <Route path="/onboarding/step-2" element={<OnBoarding2 />} />
            <Route path="/onboarding/step-3" element={<OnBoarding3 />} />
            <Route path="/onboarding/step-4" element={<OnBoarding4 />} />
            <Route path="/onboarding/step-5" element={<OnBoarding5 />} />

            <Route
              path="/voice-agent"
              element={
                <Layout>
                  <VoiceAgent />
                </Layout>
              }
            />

            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />

          <Route path="/billing" element={
            <Layout>
              <BillingPage />
            </Layout>
          } />

          <Route path="/chat" element={
            <Layout>
              <Chatbot />
            </Layout>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
