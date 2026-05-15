'use client';

import { WhatsAppChat } from '@/components/chat/WhatsAppChat';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WhatsAppChat />
    </>
  );
}