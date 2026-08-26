export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description?: string;
  image: string;
  stock?: number;
  featured?: boolean;
  isPromotional?: boolean;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
}

export const products: Product[] = [
  {
    id: "1775520478118",
    name: "Digital Thermometer",
    price: 4999,
    originalPrice: 10000,
    category: "Diagnostics",
    description: "Digital Thermometer",
    image: "/images/products/OIP.webp",
    stock: 1,
    featured: true,
    isPromotional: true,
    discountPercentage: 25,
  },

  {
    id: "1775524087587",
    name: "Blood Transfusion Set",
    price: 6000,
    originalPrice: 10000,
    category: "IV Sets & Accessories",
    description: "Single chamber blood transfusion set.",
    image: "/images/products/blood-transfusion-set.jpg",
    stock: 4,
    featured: true,
    isPromotional: true,
    discountPercentage: 25,
  },

  {
    id: "1775558956188-5nxgcjxvh",
    name: "Widal-2 Antigens",
    price: 3000,
    originalPrice: 6000,
    category: "Serological Reagent",
    description: "Serological reagent for laboratory testing.",
    image: "/images/products/widal-2-antigens.webp",
    stock: 3,
    featured: false,
    isPromotional: true,
    discountPercentage: 20,
  },

  {
    id: "1775659282198-v1mlx5ak8",
    name: "Cryovial Tube",
    price: 1000,
    originalPrice: 3000,
    category: "Diagnostics & Research",
    description: "Premium cryogenic storage tube.",
    image: "/images/products/cryovial-tube.jpeg",
    stock: 1,
    featured: true,
    isPromotional: true,
    discountPercentage: 25,
  },

  {
    id: "1775664194025-iuuy58yrd",
    name: "Micro Slides",
    price: 1499.99,
    originalPrice: 5000,
    category: "Diagnostics & Research",
    description: "Optical-quality microscope slides.",
    image: "/images/products/micro-slides.jpeg",
    stock: 2,
    featured: true,
    isPromotional: true,
    discountPercentage: 25,
  },

  {
    id: "1775819075513-4g14d95a4",
    name: "Lithium Heparin Non-Vacuum Blood Collection Tube",
    price: 10002,
    originalPrice: 40000,
    category: "Blood Collection Tubes",
    description: "Non-vacuum blood collection tube with lithium heparin.",
    image: "/images/products/lithium-heparin-tube.jpeg",
    stock: 1,
    featured: true,
    isPromotional: true,
    discountPercentage: 25,
  },

  {
    id: "1775908113105-u3genoaql",
    name: "Blood Grouping Sera Anti D",
    price: 1000,
    originalPrice: 4000,
    category: "Blood Collection Tubes",
    description: "Blood grouping sera Anti-D.",
    image: "/images/products/blood-grouping-sera-anti-d.jpeg",
    stock: 13,
    featured: true,
    isPromotional: true,
    discountPercentage: 19,
  },

  {
    id: "1776025727212-dfv4e951a",
    name: "U-100 Insulin Syringe",
    price: 1000,
    originalPrice: 3000,
    category: "Diabetes Care",
    description: "Precision disposable U-100 insulin syringe.",
    image: "/images/products/insulin-syringe.jpeg",
    stock: 33,
    featured: true,
    isPromotional: true,
    discountPercentage: 19,
  },
];