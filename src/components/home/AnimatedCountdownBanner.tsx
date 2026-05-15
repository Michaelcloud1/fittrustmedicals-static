'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Gift, ChevronRight } from 'lucide-react';

export default function AnimatedCountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 15, minutes: 30, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl overflow-hidden mb-8"
    >
      <div className="p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Section - Gift Icon & Text */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Flash Sale Ends In:</h3>
              <p className="text-white/80">Get up to 50% off on selected items</p>
            </div>
          </div>

          {/* Timer Section */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
              </div>
              <p className="text-xs mt-1">Days</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
              </div>
              <p className="text-xs mt-1">Hours</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
              </div>
              <p className="text-xs mt-1">Mins</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
              <p className="text-xs mt-1">Secs</p>
            </div>
          </div>

          {/* Shop Now Button - FIXED (Clickable with hover effect) */}
          <Link href="/products?filter=flash-sales" className="block">
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md">
              Shop Now <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}