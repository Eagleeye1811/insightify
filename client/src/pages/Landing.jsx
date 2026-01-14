import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppInput from "../components/AppInput";
import { TestimonialsSection } from "../components/ui/testimonials-with-marquee";
import ValueFlowSection from "../components/ui/ValueFlowSection";
import DashboardShowcase from "../components/ui/DashboardShowcase";
import StepsSection from "../components/ui/StepsSection";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown,
  Brain,
  Tags,
  FileText,
  SlidersHorizontal,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import "./Landing.css";

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const faqs = [
    {
      question: "How does the free trial work?",
      answer:
        "Sign up with your email and get instant access to all premium features for 14 days. No credit card required. After the trial, choose a plan that fits your needs or continue with our free tier.",
    },
    {
      question: "How do auto-suggested replies work?",
      answer:
        "Our AI analyzes the sentiment and content of each review, then generates contextually appropriate responses. You can customize these templates, save your favorites, and apply them with one click to save hours of manual work.",
    },
    {
      question: "How are tags generated?",
      answer:
        "Using advanced natural language processing, our AI identifies key themes, topics, and issues mentioned in reviews. It automatically categorizes them into relevant tags like 'Performance', 'UI/UX', 'Bugs', or 'Feature Requests' for easy filtering and analysis.",
    },
    {
      question: "Is customer support available 24/7?",
      answer:
        "Yes! Our support team is available around the clock via chat and email. Premium users get priority support with response times under 2 hours. We also have comprehensive documentation and video tutorials available anytime.",
    },
    {
      question: "How secure is my data?",
      answer:
        "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II certified and GDPR compliant. Your app data is never shared with third parties and is stored in secure, isolated environments.",
    },
    {
      question: "What is HashiCorp Vault and why do you use it?",
      answer:
        "HashiCorp Vault is an industry-leading secrets management tool. We use it to securely store and manage all sensitive credentials, API tokens, and encryption keys. This ensures your data remains protected with enterprise-grade security standards.",
    },
    {
      question: "How are my credentials and API tokens protected?",
      answer:
        "All credentials are encrypted using HashiCorp Vault with dynamic secrets that rotate automatically. API tokens are scoped with minimum required permissions and are never logged or exposed. Access is monitored and audited in real-time.",
    },
    {
      question: "Is my environment isolated from other users?",
      answer:
        "Absolutely. Each user operates in a completely isolated environment with dedicated resources. Your data, analysis, and settings are segregated using industry-standard multi-tenancy architecture, ensuring zero data leakage between accounts.",
    },
    {
      question: "Can I integrate with multiple platforms?",
      answer:
        "Yes! Insightify seamlessly integrates with Google Play Store, Apple App Store, and major review platforms. Connect multiple apps from different stores and manage all your feedback from a single, unified dashboard.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans. All payments are processed securely through Stripe, and you can update your payment method anytime from your account settings.",
    },
  ];

  return (
    <div className="landing-page">
      {/* Particle Background */}
      <div className="particles-background-simple">
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
        <div className="particle-dot"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* <div className="hero-badge">
                        <span className="badge-dot"></span>
                        <span>Powered by Gemini 1.5 + RAG</span>
                    </div> */}

          <h1 className="hero-title pt-25">
          Transform <span style={{ color: "#a855f7" }}>Reviews</span> into
            <br />
            <span className="gradient-text">Actionable</span>{" "}
            <span style={{ color: "#a855f7" }}>Growth</span>
          </h1>

          <p className="hero-description">
            Stop guessing why users uninstall. Let our AI analyze review
            patterns,
            <br className="hide-mobile" /> providing you with data-driven
            retention strategies in seconds.
          </p>

          <div className="hero-actions">
            <button
              className="get-started-btn"
              onClick={() => navigate(user ? "/analyze" : "/login")}
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Scrolling Badges */}
          <div className="scrolling-badges">
            <div className="badge-track">
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
              {/* Duplicate for seamless loop */}
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
              <span className="platform-badge">Google Play Store</span>
              {/* <span className="platform-badge">Apple App Store</span> */}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <StepsSection />

      {/* Value Flow Section */}
      <ValueFlowSection />

      {/* Dashboard Showcase */}
      <DashboardShowcase />

      {/* Features Section */}
      <section
        className="features-section"
        style={{
          padding: "6rem 2rem",
          background: "#000",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            Features
          </p>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
              color: "white",
            }}
          >
            What Makes Us Different
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#9ca3af",
              maxWidth: "900px",
              margin: "0 auto 3rem",
              lineHeight: "1.7",
            }}
          >
            AI-powered analysis of reviews from platforms like Google Play and
            App Store. Generate tags, summaries, and insights while filtering
            reviews by tags, time, or quality to drive smarter decisions.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: Brain,
                title: "AI-Powered Review Analysis",
                desc: "Analyze user reviews with advanced AI algorithms, identifying key topics, sentiments, and trends to gain valuable insights.",
              },
              {
                icon: Tags,
                title: "Automated Tag Generation",
                desc: "Automatically generate relevant tags for reviews to categorize and streamline feedback for better understanding.",
              },
              {
                icon: FileText,
                title: "Review Summarization",
                desc: "Condense long reviews into concise summaries, making it easier to grasp user feedback at a glance.",
              },
              {
                icon: SlidersHorizontal,
                title: "Advanced Filtering Options",
                desc: "Filter reviews by tags, time, or quality to focus on the most relevant feedback for your needs.",
              },
              {
                icon: MessageSquare,
                title: "AI-Powered Responses",
                desc: "Respond to user reviews with saved templates or AI-generated replies, saving time while ensuring professionalism.",
              },
              {
                icon: TrendingUp,
                title: "Insightful Trends and Reports",
                desc: "Stay ahead with data-driven reports that highlight user trends and actionable insights over time.",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  style={{
                    padding: "2rem",
                    background: "#151515",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = "#8b5cf6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      fontSize: "2rem",
                    }}
                  >
                    <IconComponent size={32} color="#8b5cf6" />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "white",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#9ca3af",
                      lineHeight: "1.6",
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection
        title="What Our Users Say"
        description="Join thousands of developers and product managers who are already making smarter decisions with Insightify"
        testimonials={[
          {
            author: {
              name: "Sarah Chen",
              handle: "@sarahchen",
              avatar:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
            },
            text: "Insightify transformed how we analyze user feedback. We identified key pain points that led to a 40% increase in user retention.",
            href: "https://twitter.com/sarahchen",
          },
          {
            author: {
              name: "Marcus Rodriguez",
              handle: "@mrodriguez",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            },
            text: "The AI-powered insights saved us weeks of manual review analysis. Now we can focus on building features users actually want.",
            href: "https://twitter.com/mrodriguez",
          },
          {
            author: {
              name: "Emily Watson",
              handle: "@emilywatson",
              avatar:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
            },
            text: "Finally, a tool that makes sense of the chaos. Insightify's competitor analysis gave us the edge we needed to stand out.",
          },
          {
            author: {
              name: "David Kim",
              handle: "@davidkim",
              avatar:
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            },
            text: "The voice AI mentor is incredible. It answers questions about our data faster than any analyst could. Game changer!",
            href: "https://twitter.com/davidkim",
          },
          {
            author: {
              name: "Lisa Martinez",
              handle: "@lisamartinez",
              avatar:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            },
            text: "We discovered critical bugs through sentiment analysis that we would have missed otherwise. Worth every penny.",
            href: "https://twitter.com/lisamartinez",
          },
          {
            author: {
              name: "James Park",
              handle: "@jamespark",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            },
            text: "Insightify's automated tag generation helped us categorize 50,000 reviews in minutes. Absolutely phenomenal.",
            href: "https://twitter.com/jamespark",
          },
          {
            author: {
              name: "Sophia Anderson",
              handle: "@sophiaanderson",
              avatar:
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
            },
            text: "The real-time insights dashboard is our product team's favorite tool. We check it every morning!",
            href: "https://twitter.com/sophiaanderson",
          },
          {
            author: {
              name: "Alex Thompson",
              handle: "@alexthompson",
              avatar:
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
            },
            text: "Best investment we made this year. The ROI was clear within the first month of using Insightify.",
            href: "https://twitter.com/alexthompson",
          },
        ]}
      />

      {/* FAQ Section */}
      <section
        style={{
          padding: "6rem 2rem",
          background: "#000",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            FAQS
          </p>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "3rem",
              color: "white",
            }}
          >
            Common{" "}
            <span
              style={{
                textDecoration: "underline",
                textDecorationColor: "#8b5cf6",
                textDecorationThickness: "4px",
                textUnderlineOffset: "8px",
              }}
            >
              Questions
            </span>
          </h2>

          <div style={{ textAlign: "left" }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  borderBottom: "2px solid rgba(255, 255, 255, 0.5)",
                  padding: "1.5rem 0",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "0",
                  }}
                >
                  {faq.question}
                  <ChevronDown
                    size={20}
                    style={{
                      transition: "transform 0.3s ease",
                      transform:
                        openFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                      color: "#9ca3af",
                      flexShrink: 0,
                      marginLeft: "1rem",
                    }}
                  />
                </button>

                <div
                  style={{
                    maxHeight: openFaq === index ? "500px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p
                    style={{
                      marginTop: "1rem",
                      color: "#9ca3af",
                      lineHeight: "1.7",
                      fontSize: "1rem",
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
