'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Phone, Gift, Clock, TrendingUp, Star, Zap, Shield, Heart } from 'lucide-react';

const ads = [
  {
    id: 1,
    title: "Top deals on Medical Equipment",
    subtitle: "STARTING FROM",
    description: "Exclusive on Fittrust Medicals",
    price: "₦18,999",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgGradient: "from-orange-500 to-red-600",
    icon: <Zap className="w-6 h-6" />,
    mainImage: "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775524005028_blood-transfusion-set-606.jpg",
    floatingImages: [
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775520445094_Digital_Thermometer.jpg",
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775521076329_first-aid-kit.webp"
    ],
    productName: "Medical Equipment Bundle",
    phoneNumber: "+2348083483440"
  },
  {
    id: 2,
    title: "Medical Equipment Sale",
    subtitle: "UP TO 40% OFF",
    description: "Premium quality healthcare supplies",
    price: "Starting from ₦5,000",
    discount: "40% OFF",
    buttonText: "View Deals",
    buttonLink: "/products?category=diagnostic",
    bgGradient: "from-blue-600 to-indigo-700",
    icon: <Star className="w-6 h-6" />,
    mainImage: "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775664130051_Micro_slides.jpeg",
    floatingImages: [
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775659219632_Cryovial_tube.jpeg",
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775819064133_Lithium_Heparin_Non_Vacuum1.jpeg"
    ],
    productName: "Diagnostic Kit",
    phoneNumber: "+2348083483440"
  },
  {
    id: 3,
    title: "Pocket Light",
    subtitle: "VALUE HEAVY",
    description: "Deals that go easy on your pockets",
    price: "AS LOW AS ₦5,000",
    buttonText: "Shop Now",
    buttonLink: "/products?filter=budget",
    bgGradient: "from-green-600 to-teal-600",
    icon: <Heart className="w-6 h-6" />,
    mainImage: "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775908029717_Blood_Grouping_Sera_Anti_D.jpeg",
    floatingImages: [
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775558636641_widall-2-Antigens.webp",
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775520445094_Digital_Thermometer.jpg"
    ],
    productName: "Budget Medical Supplies",
    phoneNumber: "+2348083483440"
  },
  {
    id: 4,
    title: "Free Delivery",
    subtitle: "SEND. TRACK. COLLECT.",
    description: "Send your packages securely anywhere in Nigeria",
    price: "T&Cs Apply",
    buttonText: "DISCOVER",
    buttonLink: "/shipping",
    bgGradient: "from-purple-600 to-pink-600",
    icon: <Shield className="w-6 h-6" />,
    mainImage: "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775664130051_Micro_slides.jpeg",
    floatingImages: [
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775659219632_Cryovial_tube.jpeg",
      "https://fittrust-medicals-images.s3.eu-north-1.amazonaws.com/products/1775819064133_Lithium_Heparin_Non_Vacuum1.jpeg"
    ],
    productName: "Delivery Service",
    phoneNumber: "+2348083483440"
  }
];

export default function AnimatedAds() {
  const [currentAd, setCurrentAd] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextAd = () => {
    setDirection(1);
    setCurrentAd((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setDirection(-1);
    setCurrentAd((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const handleImageLoad = (adId: number) => {
    setImagesLoaded(prev => ({ ...prev, [adId]: true }));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8 h-[450px] md:h-[500px] shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentAd}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className={`absolute inset-0 bg-gradient-to-r ${ads[currentAd].bgGradient} text-white`}
        >
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-12">
            
            {/* Left Side - Product Images */}
            <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
              {/* Main Product Image */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block shadow-2xl">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <Image
                      src={ads[currentAd].mainImage}
                      alt={ads[currentAd].productName}
                      fill
                      className="object-contain rounded-xl"
                      onLoad={() => handleImageLoad(ads[currentAd].id)}
                      unoptimized
                    />
                    {!imagesLoaded[ads[currentAd].id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Floating smaller products */}
              {ads[currentAd].floatingImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: idx === 0 ? -20 : 20, y: idx === 0 ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className={`absolute ${idx === 0 ? '-bottom-4 -right-4' : '-top-4 -left-4'} bg-white/20 backdrop-blur-sm rounded-xl p-2 shadow-lg`}
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src={img}
                      alt="Product"
                      fill
                      className="object-contain rounded-lg"
                      unoptimized
                    />
                  </div>
                </motion.div>
              ))}
              
              {/* Nigerian Healthcare Professionals Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center md:text-left mt-6"
              >
                <div className="flex items-center gap-2 justify-center md:justify-start bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-xl">🇳🇬</span>
                  <p className="text-sm font-semibold">Trusted by 10,000+ Nigerian Healthcare Professionals</p>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  {ads[currentAd].icon}
                  <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                    {ads[currentAd].subtitle}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {ads[currentAd].title}
                </h2>
                
                <p className="text-lg md:text-xl text-white/90 mb-4">
                  {ads[currentAd].description}
                </p>
                
                {ads[currentAd].price && (
                  <div className="mb-4">
                    <p className="text-sm text-white/80">Starting from</p>
                    <p className="text-3xl md:text-4xl font-bold">{ads[currentAd].price}</p>
                  </div>
                )}
                
                {ads[currentAd].discount && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block bg-yellow-400 text-red-600 px-4 py-2 rounded-lg font-bold mb-4"
                  >
                    {ads[currentAd].discount}
                  </motion.div>
                )}
                
                {/* Shop Now Button - FIXED (Clickable) */}
                <Link href={ads[currentAd].buttonLink} className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all mt-2 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {ads[currentAd].buttonText}
                    <TrendingUp className="w-4 h-4" />
                  </motion.button>
                </Link>
                
                {/* Call for Deals */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 flex items-center gap-2 text-sm justify-center md:justify-start bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit mx-auto md:mx-0"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call for Deals: {ads[currentAd].phoneNumber}</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevAd}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition z-20 backdrop-blur-sm cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextAd}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition z-20 backdrop-blur-sm cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {ads.map((_, index) => (
          <button
            key={index}
            onClick={() => { setDirection(index > currentAd ? 1 : -1); setCurrentAd(index); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentAd === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}