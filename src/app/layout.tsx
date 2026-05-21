import type { Metadata } from 'next';
import './globals.css';
import { BackendStatus } from '@/components/BackendStatus';
import { Footer } from '@/components/layout/Footer';
import ClientWrapper from '@/components/layout/ClientWrapper';

export const metadata: Metadata = {
  title: 'Fittrustmedicals - Quality Medical Equipment & Supplies',
  description: 'Discover quality medical equipment and supplies for healthcare professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans overflow-x-hidden w-full">
        <BackendStatus />
        {/* ⚠️ MAKE SURE THERE IS NO <Header /> HERE ⚠️ */}
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ClientWrapper />
      </body>
    </html>
  );
}