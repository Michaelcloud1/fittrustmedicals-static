'use client';

import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppChat() {
  const phoneNumber = '2348164091531';

  const message =
    'Hello FitTrust Medicals, I would like to make an enquiry about your medical products.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with FitTrust Medicals on WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-200 hover:scale-110 hover:bg-[#20bd5a] active:scale-95 sm:bottom-6 sm:right-6"
    >
      <FaWhatsapp className="h-9 w-9" />
    </a>
  );
}
