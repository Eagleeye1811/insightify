import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Paste Your App Name/Link",
    desc: "Drop your App name or Google Play Store link. We instantly start analyzing user reviews.",
    icon: "",
  },
  {
    step: "02",
    title: "Visualize Your Dashboard  ",
    desc: "Your personalized insights dashboard appears automatically—ready to explore.",
    icon: "",
  },
  {
    step: "03",
    title: "Get AI-Powered Insights",
    desc: "Receive actionable recommendations and implement changes to improve your app's performance and user satisfaction.",
    icon: "",
  },
];

export default function StepsSection() {
  return (
    <section className="relative bg-black py-32 overflow-hidden">
      {/* Heading */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Get Started in 3 Simple Steps
        </h2>
        <p className="mt-6 text-white/70 text-lg">
          From app link to actionable insights—faster than you expect.
        </p>
      </motion.div>

      {/* Steps container - Desktop */}
      <div className="hidden md:block relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 relative">
          {/* Connecting lines between steps */}
          <div className="absolute top-16 left-0 right-0 flex items-center justify-center px-32">
            {/* <div className="w-full h-[2px] bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 opacity-30"></div> */}
          </div>

          {steps.map((item, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                type: "spring",
                stiffness: 100,
              }}
            >
              {/* Step number circle */}
              <motion.div
                className="relative mx-auto w-16 h-16 mb-8 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2 + 0.3,
                  type: "spring",
                }}
              >
                {/* Glowing background */}
                {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full blur-xl opacity-60 animate-pulse"></div> */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-violet-600 to-gblack rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                  {item.step}
                </div>
              </motion.div>

              {/* Card */}
              <motion.div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
                <div className="relative">
                  {/* Icon */}
                  <div className="text-5xl mb-4 inline-block">{item.icon}</div>

                  <h3 className="text-xl font-semibold text-white mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text">
                    {item.title}
                  </h3>

                  <p className="text-white/70 leading-relaxed text-sm">
                    {item.desc}
                  </p>

                  {/* Arrow indicator */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="absolute -right-12 top-1/2 -translate-y-1/2 text-white text-3xl"
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Steps container - Mobile */}
      <div className="md:hidden relative max-w-lg mx-auto px-6">
        {/* Vertical line */}
        <div className="absolute left-14 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-600 via-purple-600 to-violet-600 opacity-30"></div>

        <div className="space-y-12">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              className="relative flex gap-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Step number */}
              <motion.div
                className="relative flex-shrink-0"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full blur-lg opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {item.step}
                </div>
              </motion.div>

              {/* Card */}
              <motion.div
                className="flex-1 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-[0_8px_40px_rgba(99,102,241,0.15)]"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
