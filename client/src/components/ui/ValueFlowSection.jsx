import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  {
    title: "Review Analysis",
    desc: "Identify sentiment shifts and topic clusters automatically from user feedback.",
    icon: "",
  },
  {
    title: "Feature Mining",
    desc: "Discover hidden feature requests buried deep within thousands of reviews.",
    icon: "",
  },
  {
    title: "Voice AI Mentor",
    desc: "Chat with your data. Ask strategic questions and get instant, sourced answers.",
    icon: "",
  },
  {
    title: "Competitor Intel",
    desc: "Compare performance metrics directly against your top competitors.",
    icon: "",
  },
];

export default function ValueFlowSection() {
  const sectionRef = useRef(null);

  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  // Transform scroll progress to line height (0 to 100%)
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-28 text-white overflow-hidden"
    >
      {/* Heading */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center mb-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          What Do We Bring to You?
        </h2>
        <p className="mt-6 text-white/70 text-lg">
          Intelligent tools that simplify decisions, uncover opportunities, and
          give your business an unfair advantage.
        </p>
      </motion.div>

      {/* Flow container */}
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Vertical glowing line - animated on scroll */}
        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-white via-white to-indigo-500 opacity-40"
            style={{
              height: lineHeight,
              originY: 0,
            }}
          />
        </div>

        {/* Glowing nodes on the line */}
        {features.map((_, index) => {
          // Each node appears at its proportional position in the scroll
          const nodeProgress = useTransform(
            scrollYProgress,
            [index / features.length, (index + 0.5) / features.length],
            [0, 1]
          );
          const nodeOpacity = useTransform(nodeProgress, [0, 1], [0, 1]);
          const nodeScale = useTransform(nodeProgress, [0, 1], [0, 1]);

          return (
            <motion.div
              key={`node-${index}`}
              className="absolute left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_20px_rgba(167,139,250,0.8)]"
              style={{
                top: `${(index * 100) / (features.length - 1)}%`,
                opacity: nodeOpacity,
                scale: nodeScale,
              }}
            />
          );
        })}

        {/* Feature items */}
        <div className="flex flex-col gap-32 relative z-10">
          {features.map((item, index) => {
            // Each card appears at its proportional position in the scroll
            const cardProgress = useTransform(
              scrollYProgress,
              [index / features.length, (index + 0.7) / features.length],
              [0, 1]
            );
            const cardOpacity = useTransform(cardProgress, [0, 1], [0, 1]);
            const cardX = useTransform(
              cardProgress,
              [0, 1],
              [index % 2 === 0 ? -100 : 100, 0]
            );
            const cardScale = useTransform(cardProgress, [0, 1], [0.8, 1]);

            return (
              <motion.div
                key={index}
                className={`flex ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
                style={{
                  opacity: cardOpacity,
                  x: cardX,
                  scale: cardScale,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="relative group w-full max-w-[460px]">
                  {/* Connecting line from center to card */}
                  <div
                    className={`absolute top-1/2 ${
                      index % 2 === 0 ? "left-full" : "right-full"
                    } w-20 h-[2px] bg-gradient-to-${
                      index % 2 === 0 ? "r" : "l"
                    } from-violet-500 to-transparent opacity-40`}
                  />

                  {/* Feature card */}
                  <div className="relative px-8 py-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_60px_rgba(139,92,246,0.2)] overflow-hidden group-hover:border-violet-500/50 transition-all duration-300">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-purple-600/0 to-indigo-600/0 group-hover:from-violet-600/10 group-hover:via-purple-600/5 group-hover:to-indigo-600/10 transition-all duration-500" />

                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

                    <div className="relative flex items-start gap-5">
                      <motion.span
                        className="text-5xl flex-shrink-0"
                        whileHover={{
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.2,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.span>
                      <div>
                        <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                          {item.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
