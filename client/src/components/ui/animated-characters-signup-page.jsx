import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!pupilRef.current) return;

    if (forceLookX !== undefined && forceLookY !== undefined) {
      setPosition({ x: forceLookX, y: forceLookY });
      return;
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(
      Math.sqrt(deltaX ** 2 + deltaY ** 2),
      maxDistance
    );

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    setPosition({ x, y });
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!eyeRef.current) return;

    if (forceLookX !== undefined && forceLookY !== undefined) {
      setPosition({ x: forceLookX, y: forceLookY });
      return;
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(
      Math.sqrt(deltaX ** 2 + deltaY ** 2),
      maxDistance
    );

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    setPosition({ x, y });
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        border: "2px solid #333",
        transition: "height 0.1s ease-out",
      }}
    >
      {!isBlinking && (
        <Pupil
          size={pupilSize}
          maxDistance={maxDistance}
          pupilColor={pupilColor}
          forceLookX={forceLookX}
          forceLookY={forceLookY}
        />
      )}
    </div>
  );
};

function SignupPage() {
  const navigate = useNavigate();
  const { signupWithEmail, loginWithGoogle, user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const orangeRef = useRef(null);
  const yellowRef = useRef(null);

  const [purplePos, setPurplePos] = useState({
    faceX: 0,
    faceY: 0,
    bodySkew: 0,
  });
  const [blackPos, setBlackPos] = useState({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [orangePos, setOrangePos] = useState({
    faceX: 0,
    faceY: 0,
    bodySkew: 0,
  });
  const [yellowPos, setYellowPos] = useState({
    faceX: 0,
    faceY: 0,
    bodySkew: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX } = e;
      const centerX = window.innerWidth / 2;
      const deltaX = clientX - centerX;

      setPurplePos({
        faceX: (deltaX / centerX) * 15,
        faceY: 0,
        bodySkew: deltaX / 120,
      });
      setBlackPos({
        faceX: (deltaX / centerX) * 10,
        faceY: 0,
        bodySkew: deltaX / 150,
      });
      setOrangePos({
        faceX: (deltaX / centerX) * 8,
        faceY: 0,
        bodySkew: deltaX / 180,
      });
      setYellowPos({
        faceX: (deltaX / centerX) * 8,
        faceY: 0,
        bodySkew: deltaX / 180,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const randomBlinkPurple = () => {
      setIsPurpleBlinking(true);
      setTimeout(() => setIsPurpleBlinking(false), 150);
      setTimeout(randomBlinkPurple, 3000 + Math.random() * 4000);
    };

    const randomBlinkBlack = () => {
      setIsBlackBlinking(true);
      setTimeout(() => setIsBlackBlinking(false), 150);
      setTimeout(randomBlinkBlack, 3000 + Math.random() * 4000);
    };

    const purpleTimer = setTimeout(
      randomBlinkPurple,
      2000 + Math.random() * 3000
    );
    const blackTimer = setTimeout(
      randomBlinkBlack,
      2500 + Math.random() * 3000
    );

    return () => {
      clearTimeout(purpleTimer);
      clearTimeout(blackTimer);
    };
  }, []);

  useEffect(() => {
    setIsLookingAtEachOther(isTyping);
  }, [isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signupWithEmail(email, password);
      const currentUser = result.user;

      // Store user data in Firestore
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          name: username || email.split("@")[0],
          email: currentUser.email,
          photoURL: currentUser.photoURL || null,
          role: "Analyst",
          organization: "Insightify Corp",
          createdAt: new Date(),
          onboardingCompleted: false,
        });
      } catch (firestoreErr) {
        console.error("Firestore error (non-critical):", firestoreErr);
        // Continue anyway - user is created in Firebase Auth
      }

      // Always navigate to onboarding after successful auth
      navigate("/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      const currentUser = result.user;

      // Check if user already exists in Firestore
      const { getDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // NEW USER - Create account and go to onboarding
        console.log("New user detected - creating account");

        await setDoc(userRef, {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          role: "Analyst",
          organization: "Insightify Corp",
          createdAt: new Date(),
          onboardingCompleted: false,
        });

        console.log("New user account created, navigating to onboarding");
        navigate("/onboarding");
      } else {
        // EXISTING USER - Go directly to dashboard
        console.log("Existing user detected, navigating to dashboard");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Failed to sign up with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Signup Form Section */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <Sparkles className="size-4 text-purple-600" />
            </div>
            <span className="text-white">Insightify</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
              Create an account
            </h1>
            <p className="text-zinc-400 text-sm">Get started with Insightify</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-white"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-white"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-white"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-zinc-900 border-zinc-800 text-white focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked)}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal cursor-pointer text-zinc-300 leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-purple-400 hover:underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-purple-400 hover:underline font-medium"
                >
                  Privacy Policy
                </a>
              </Label>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          {/* Social Signup */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full h-12 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"
              type="button"
              onClick={handleGoogleSignup}
            >
              <Mail className="mr-2 size-5" />
              Sign up with Google
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-zinc-400 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Character Animation Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-1 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative size-[600px]">
            {/* Purple character - Tall back */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "180px",
                width: "180px",
                height: "280px",
                zIndex: 1,
                backgroundColor: "#6C3FF5",
                borderRadius: "90px 90px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(-5deg)`
                    : `skewX(${purplePos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${65}px`
                      : isLookingAtEachOther
                      ? `${52}px`
                      : `${58 + purplePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${35}px`
                      : isLookingAtEachOther
                      ? `${65}px`
                      : `${75 + purplePos.faceY}px`,
                }}
              >
                <EyeBall
                  size={20}
                  pupilSize={8}
                  maxDistance={6}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -6
                      : isLookingAtEachOther
                      ? -6
                      : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? 3
                      : isLookingAtEachOther
                      ? 3
                      : undefined
                  }
                />
                <EyeBall
                  size={20}
                  pupilSize={8}
                  maxDistance={6}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -6
                      : isLookingAtEachOther
                      ? -6
                      : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? 3
                      : isLookingAtEachOther
                      ? 3
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Black character - Medium back right */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                right: "140px",
                width: "120px",
                height: "180px",
                zIndex: 2,
                backgroundColor: "#2D2D2D",
                borderRadius: "60px 60px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(5deg)`
                    : `skewX(${blackPos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${10}px`
                      : isLookingAtEachOther
                      ? `${32}px`
                      : `${26 + blackPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${28}px`
                      : isLookingAtEachOther
                      ? `${12}px`
                      : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                      ? 0
                      : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                      ? -4
                      : undefined
                  }
                />
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                      ? 0
                      : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                      ? -4
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Orange semi-circle character - Front left */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px",
                width: "240px",
                height: "200px",
                zIndex: 3,
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${50}px`
                      : `${82 + (orangePos.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${85}px`
                      : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -3 : undefined
                  }
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -3 : undefined
                  }
                />
              </div>
            </div>

            {/* Yellow rounded character - Front right */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                right: "20px",
                width: "160px",
                height: "140px",
                zIndex: 3,
                backgroundColor: "#FFD166",
                borderRadius: "80px 80px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${20}px`
                      : `${52 + (yellowPos.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${35}px`
                      : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
              </div>
              <div
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${10}px`
                      : `${40 + (yellowPos.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${88}px`
                      : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export const Component = SignupPage;
export default SignupPage;
