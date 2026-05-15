'use client';

import { motion } from 'framer-motion';

interface WhatsAppChatProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export default function WhatsAppChat({ 
  phoneNumber = '2348164091531', // Client's WhatsApp number (without +)
  message = 'Hello! I need help with medical equipment.',
  position = 'bottom-right'
}: WhatsAppChatProps) {
  // Remove any spaces or special characters from phone number
  const cleanNumber = phoneNumber.replace(/\s/g, '').replace('+', '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed ${positionClasses[position]} z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all cursor-pointer`}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
    >
      {/* WhatsApp Icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-6 h-6"
      >
        <path d="M12.032 12.032a.5.5 0 0 0 .16-.08c.06-.04.16-.1.28-.18a1.5 1.5 0 0 0 .48-.64c.04-.12.06-.24.06-.36 0-.12-.02-.24-.06-.36a1.5 1.5 0 0 0-.48-.64c-.12-.08-.22-.14-.28-.18a.5.5 0 0 0-.16-.08.5.5 0 0 0-.2.04 1.5 1.5 0 0 0-.64.48c-.08.12-.14.22-.18.28a.5.5 0 0 0-.08.16.5.5 0 0 0 .04.2c.04.12.1.22.18.28.08.06.16.1.28.18a1.5 1.5 0 0 0 .64.48.5.5 0 0 0 .2.04.5.5 0 0 0 .16-.08z"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    </motion.a>
  );
}