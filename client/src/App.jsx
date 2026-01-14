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
import PrivateRoute from "./components/PrivateRoute";
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
import VoiceAgentFree from "./pages/VoiceAgentFree";
import Profile from "./pages/Profile";
import BillingPage from "./pages/Biling";
import Chatbot from "./pages/Chatbot";
import AnalyzeApp from "./pages/AnalyzeApp";
import Reviews from "./pages/Reviews";

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

            {/* Protected Routes - Require Authentication */}

            <Route
              path="/analyze"
              element={
                <PrivateRoute>
                  <Layout>
                    <AnalyzeApp />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route 
              path="/onboarding" 
              element={
                <PrivateRoute>
                  <OnBoarding1 />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/step-2" 
              element={
                <PrivateRoute>
                  <OnBoarding2 />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/step-3" 
              element={
                <PrivateRoute>
                  <OnBoarding3 />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/step-4" 
              element={
                <PrivateRoute>
                  <OnBoarding4 />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/step-5" 
              element={
                <PrivateRoute>
                  <OnBoarding5 />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/voice-agent" 
              element={
                <PrivateRoute>
                  <Layout>
                    <VoiceAgentFree />
                  </Layout>
                </PrivateRoute>
              } 
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route 
              path="/billing" 
              element={
                <PrivateRoute>
                  <Layout>
                    <BillingPage />
                  </Layout>
                </PrivateRoute>
              } 
            />

            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Chatbot />
                  </Layout>
                </PrivateRoute>
              } 
            />

            <Route 
              path="/reviews" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Reviews />
                  </Layout>
                </PrivateRoute>
              } 
            />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
