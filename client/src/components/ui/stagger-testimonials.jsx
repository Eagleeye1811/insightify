"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "Finally understand what users really want! The Play Store reviews were just noise before Insightify.",
    by: "Sarah Chen, Product Manager",
    imgSrc: "https://i.pravatar.cc/150?img=1"
  },
  {
    tempId: 1,
    testimonial: "Our app rating went from 3.2 to 4.6 stars after addressing issues we found in the review analysis.",
    by: "Marcus Rodriguez, CEO at AppVenture",
    imgSrc: "https://i.pravatar.cc/150?img=2"
  },
  {
    tempId: 2,
    testimonial: "Reading 10,000+ Play Store reviews manually was impossible. Insightify did it in minutes!",
    by: "Jessica Park, Mobile Dev Lead",
    imgSrc: "https://i.pravatar.cc/150?img=3"
  },
  {
    tempId: 3,
    testimonial: "The sentiment analysis for App Store reviews is spot-on. We caught a critical bug before it went viral.",
    by: "David Kumar, QA Director",
    imgSrc: "https://i.pravatar.cc/150?img=4"
  },
  {
    tempId: 4,
    testimonial: "If I could rate this tool, I'd give it 5 stars on both stores. Best review analytics platform ever!",
    by: "Andre Williams, Head of Product",
    imgSrc: "https://i.pravatar.cc/150?img=5"
  },
  {
    tempId: 5,
    testimonial: "WE WENT FROM 2-STAR REVIEWS TO TRENDING! Understanding user feedback changed everything for us.",
    by: "Emily Torres, Growth Manager",
    imgSrc: "https://i.pravatar.cc/150?img=6"
  },
  {
    tempId: 6,
    testimonial: "Skeptical at first, but the insights from our Google Play reviews tripled our retention rate!",
    by: "James O'Connor, Marketing Director",
    imgSrc: "https://i.pravatar.cc/150?img=7"
  },
  {
    tempId: 7,
    testimonial: "Tracking review sentiment across both stores in real-time? The ROI is absolutely insane.",
    by: "Priya Patel, Data Analyst",
    imgSrc: "https://i.pravatar.cc/150?img=8"
  },
  {
    tempId: 8,
    testimonial: "Best tool for understanding what App Store reviewers actually mean. Period.",
    by: "Fernando Santos, UX Designer",
    imgSrc: "https://i.pravatar.cc/150?img=9"
  },
  {
    tempId: 9,
    testimonial: "Switched from reading reviews manually 3 years ago. Our app is now #1 in our category!",
    by: "Andy Mitchell, Founder at TopApps",
    imgSrc: "https://i.pravatar.cc/150?img=10"
  },
  {
    tempId: 10,
    testimonial: "I've been searching for Play Store review analytics like this for YEARS. Game changer!",
    by: "Rachel Green, Growth Hacker",
    imgSrc: "https://i.pravatar.cc/150?img=11"
  },
  {
    tempId: 11,
    testimonial: "So intuitive! Even our intern understood the review trends and user pain points instantly.",
    by: "Tom Anderson, Team Lead",
    imgSrc: "https://i.pravatar.cc/150?img=12"
  },
  {
    tempId: 12,
    testimonial: "The automated responses to common App Store complaints saved us 20 hours per week!",
    by: "Olivia Brown, Customer Success",
    imgSrc: "https://i.pravatar.cc/150?img=13"
  },
  {
    tempId: 13,
    testimonial: "Our 1-star reviews dropped 70% after we fixed issues highlighted in the review analysis!",
    by: "Raj Sharma, Operations Manager",
    imgSrc: "https://i.pravatar.cc/150?img=14"
  },
  {
    tempId: 14,
    testimonial: "Understanding Play Store feedback patterns revolutionized our update strategy completely!",
    by: "Lila Johnson, Product Strategist",
    imgSrc: "https://i.pravatar.cc/150?img=15"
  },
  {
    tempId: 15,
    testimonial: "Started with one app's reviews, now analyzing 20+ apps across both stores. Scales perfectly!",
    by: "Trevor Chang, Portfolio Manager",
    imgSrc: "https://i.pravatar.cc/150?img=16"
  },
  {
    tempId: 16,
    testimonial: "The feature request mining from reviews is brilliant. We built exactly what users wanted!",
    by: "Naomi Lee, Innovation Lead",
    imgSrc: "https://i.pravatar.cc/150?img=17"
  },
  {
    tempId: 17,
    testimonial: "ROI of 500%+ in 2 months just from fixing bugs mentioned in negative Play Store reviews.",
    by: "Victor Martinez, Finance Lead",
    imgSrc: "https://i.pravatar.cc/150?img=18"
  },
  {
    tempId: 18,
    testimonial: "Powerful review analytics yet so simple to use. Finally understand our App Store ratings!",
    by: "Yuki Tanaka, Tech Lead",
    imgSrc: "https://i.pravatar.cc/150?img=19"
  },
  {
    tempId: 19,
    testimonial: "Tried 5 other review tools. Insightify's Play Store analysis is the most accurate and actionable!",
    by: "Zoe Adams, Performance Manager",
    imgSrc: "https://i.pravatar.cc/150?img=20"
  }
];

const TestimonialCard = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out group",
        isCenter 
          ? "z-10 border-white/20" 
          : "z-0 border-border hover:border-white/30"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        backgroundColor: isCenter ? '#ffffff' : 'hsl(var(--card))',
        color: isCenter ? '#0a0a0a' : 'hsl(var(--card-foreground))',
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(255, 255, 255, 0.15), 0 0 30px rgba(255, 255, 255, 0.2)" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
          backgroundColor: isCenter ? 'rgba(10, 10, 10, 0.15)' : 'hsl(var(--border))'
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className="mb-4 h-14 w-12 object-cover object-top"
        style={{
          backgroundColor: isCenter ? 'rgba(10, 10, 10, 0.1)' : 'hsl(var(--muted))',
          boxShadow: isCenter ? "3px 3px 0px rgba(10, 10, 10, 0.1)" : "3px 3px 0px hsl(var(--background))"
        }}
      />
      <h3 className={cn(
        "text-base sm:text-xl font-medium",
        isCenter && "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
        isCenter ? "text-gray-600" : "opacity-80"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ 
        height: 600,
        backgroundColor: 'hsl(var(--muted) / 0.3)'
      }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-all duration-300",
            "border-2 text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "hover:scale-110 hover:shadow-lg hover:shadow-white/20"
          )}
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--background))';
            e.currentTarget.style.borderColor = 'hsl(var(--border))';
            e.currentTarget.style.color = '#ffffff';
          }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-all duration-300",
            "border-2 text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "hover:scale-110 hover:shadow-lg hover:shadow-white/20"
          )}
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--background))';
            e.currentTarget.style.borderColor = 'hsl(var(--border))';
            e.currentTarget.style.color = '#ffffff';
          }}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
