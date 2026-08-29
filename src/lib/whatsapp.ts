const WHATSAPP_NUMBER = "2348164091531";

export function getWhatsAppLink(productName: string) {
  const message = `Hello, I am interested in ${productName}. Please send me the price and more information.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
