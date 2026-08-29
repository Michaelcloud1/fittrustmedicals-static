import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { ChevronLeft, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const whatsappNumber = '+2348164091531';

  const whatsappMessage = encodeURIComponent(
    `Hello FitTrust Medicals, I am interested in ${product.name}. Please send me the price and more information.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">

        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
        >
          <ChevronLeft size={18} />
          Back to Products
        </Link>

        <div className="grid overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-10">

          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-contain p-8"
            />
          </div>

          <div className="flex flex-col justify-center">

            <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {product.category}
            </span>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description ||
                'Quality medical supplies from FitTrust Medicals. Contact us for price and availability.'}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl bg-blue-50 p-4">
                <ShieldCheck className="mb-2 text-blue-600" size={22} />
                <p className="text-sm font-semibold text-gray-800">
                  Quality Products
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4">
                <Truck className="mb-2 text-green-600" size={22} />
                <p className="text-sm font-semibold text-gray-800">
                  Reliable Delivery
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4">
                <MessageCircle className="mb-2 text-purple-600" size={22} />
                <p className="text-sm font-semibold text-gray-800">
                  WhatsApp Support
                </p>
              </div>

            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 text-base font-bold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={22} />
              Click for Price on WhatsApp
            </a>

          </div>
        </div>
      </div>
    </main>
  );
}