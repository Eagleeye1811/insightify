import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DashboardShowcase.css";

const dashboardImages = [
  "/dashboard-1.png",
  "/dashboard-2.png",
  "/dashboard-3.png",
];

export default function DashboardShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dashboardImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getImageIndex = (offset) => {
    return (currentIndex + offset) % dashboardImages.length;
  };
  return (
    <section className="relative bg-black py-32 overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#7c3aed_0%,transparent_45%)] opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            See Your Data Come Alive
          </h2>
          <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto">
            A powerful dashboard experience designed to turn raw data into
            confident decisions.
          </p>
        </motion.div>

        {/* Image stack */}
        <div className="relative mt-20 h-[520px] md:h-[680px] flex justify-center items-center perspective">
          {/* Back image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={`back-${currentIndex}`}
              src={dashboardImages[getImageIndex(2)]}
              alt="Dashboard Analytics"
              className="absolute w-[90%] md:w-[900px] rounded-xl translate-y-10 -rotate-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {/* Middle image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={`middle-${currentIndex}`}
              src={dashboardImages[getImageIndex(1)]}
              alt="Dashboard Insights"
              className="absolute w-[95%] md:w-[950px] rounded-xl rotate-3 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {/* Front image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={`front-${currentIndex}`}
              src={dashboardImages[getImageIndex(0)]}
              alt="Dashboard Overview"
              className="relative w-[100%] md:w-[1000px] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05, rotate: 0 }}
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
