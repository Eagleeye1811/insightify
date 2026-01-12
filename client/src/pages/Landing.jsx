import React from 'react';
import { motion } from 'framer-motion';
import AppInput from '../components/AppInput';
import { TestimonialsSection } from '../components/ui/testimonials-with-marquee';
import ValueFlowSection from '../components/ui/ValueFlowSection';
import DashboardShowcase from '../components/ui/DashboardShowcase';
import StepsSection from '../components/ui/StepsSection';
import './Landing.css';

export default function Landing() {

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
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        <span>Powered by Gemini 1.5 + RAG</span>
                    </div>

                    <h1 className="hero-title">
                        Transform Reviews into<br />
                        <span className="gradient-text">Actionable Growth</span>
                    </h1>

                    <p className="hero-description">
                        Stop guessing why users uninstall. Let our AI analyze review patterns,<br className="hide-mobile" /> providing you with data-driven retention strategies in seconds.
                    </p>

                    <div className="hero-actions">
                        <AppInput />
                    </div>

                    <p className="hero-hint">Try "Spotify", "Duolingo", or paste a link</p>

                    {/* Scrolling Badges */}
                    <div className="scrolling-badges">
                        <div className="badge-track">
                            <span className="platform-badge">Google Play</span>
                            <span className="platform-badge">Apple App Store</span>
                            <span className="platform-badge">Google Play</span>
                            <span className="platform-badge">Apple App Store</span>
                            <span className="platform-badge">Google Play</span>
                            <span className="platform-badge">Apple App Store</span>
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

            {/* Testimonials Section */}
            <TestimonialsSection
                title="What Our Users Say"
                description="Join thousands of developers and product managers who are already making smarter decisions with Insightify"
                testimonials={[
                    {
                        author: {
                            name: "Sarah Chen",
                            handle: "@sarahchen",
                            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "Insightify transformed how we analyze user feedback. We identified key pain points that led to a 40% increase in user retention.",
                        href: "https://twitter.com/sarahchen"
                    },
                    {
                        author: {
                            name: "Marcus Rodriguez",
                            handle: "@mrodriguez",
                            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "The AI-powered insights saved us weeks of manual review analysis. Now we can focus on building features users actually want.",
                        href: "https://twitter.com/mrodriguez"
                    },
                    {
                        author: {
                            name: "Emily Watson",
                            handle: "@emilywatson",
                            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "Finally, a tool that makes sense of the chaos. Insightify's competitor analysis gave us the edge we needed to stand out."
                    },
                    {
                        author: {
                            name: "David Kim",
                            handle: "@davidkim",
                            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "The voice AI mentor is incredible. It answers questions about our data faster than any analyst could. Game changer!",
                        href: "https://twitter.com/davidkim"
                    },
                    {
                        author: {
                            name: "Lisa Martinez",
                            handle: "@lisamartinez",
                            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "We discovered critical bugs through sentiment analysis that we would have missed otherwise. Worth every penny.",
                        href: "https://twitter.com/lisamartinez"
                    },
                    {
                        author: {
                            name: "James Park",
                            handle: "@jamespark",
                            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "Insightify's automated tag generation helped us categorize 50,000 reviews in minutes. Absolutely phenomenal.",
                        href: "https://twitter.com/jamespark"
                    },
                    {
                        author: {
                            name: "Sophia Anderson",
                            handle: "@sophiaanderson",
                            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "The real-time insights dashboard is our product team's favorite tool. We check it every morning!",
                        href: "https://twitter.com/sophiaanderson"
                    },
                    {
                        author: {
                            name: "Alex Thompson",
                            handle: "@alexthompson",
                            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
                        },
                        text: "Best investment we made this year. The ROI was clear within the first month of using Insightify.",
                        href: "https://twitter.com/alexthompson"
                    }
                ]}
            />
        </div>
    );
}
