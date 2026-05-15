'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Gift, Shield, Truck, Zap, Heart, Users } from 'lucide-react';

const flyers = [
  {
    id: 1,
    title: "Nigerian Healthcare",
    description: "Trusted by professionals",
    price: "Local Support",
    icon: <Users className="w-8 h-8" />,
    bgColor: "from-green-500 to-emerald-500",
    link: "/about",
    badge: "🇳🇬 Made for Nigeria"
  },
  {
    id: 2,
    title: "Medical Kit Pro",
    description: "Complete medical kit",
    price: "Save 28%",
    icon: <Gift className="w-8 h-8" />,
    bgColor: "from-blue-500 to-cyan-500",
    link: "/products?category=kits",
    badge: "Best Seller"
  },
  {
    id: 3,
    title: "Diagnostic Bundle",
    description: "BP Monitor + Thermometer",
    price: "Save ₦7,000",
    icon: <Heart className="w-8 h-8" />,
    bgColor: "from-purple-500 to-pink-500",
    link: "/products?category=diagnostic",
    badge: "Popular"
  },
  {
    id: 4,
    title: "Free Shipping",
    description: "On orders over ₦50,000",
    price: "Nationwide",
    icon: <Truck className="w-8 h-8" />,
    bgColor: "from-orange-500 to-red-500",
    link: "/shipping",
    badge: "Limited Time"
  }
];

export default function AnimatedFlyerCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {flyers.map((flyer, index) => (
        <motion.div
          key={flyer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15, duration: 0.6 }}
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
          className="rounded-xl overflow-hidden cursor-pointer group relative"
        >
          <Link href={flyer.link} className="block h-full">
            <div className={`bg-gradient-to-r ${flyer.bgColor} p-6 text-white h-full relative overflow-hidden`}>
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              {/* Badge */}
              <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold">
                {flyer.badge}
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {flyer.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{flyer.title}</h3>
                <p className="text-sm text-white/80 mb-3">{flyer.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{flyer.price}</p>
                  </div>
                  <motion.div
                    animate={{ 
                      x: [0, 6, 0],
                      y: [0, -2, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3,
                      ease: "easeInOut",
                      repeatType: "loop"
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}