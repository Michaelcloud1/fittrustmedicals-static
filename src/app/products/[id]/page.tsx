import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import {
  ChevronLeft,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

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

  const whatsappNumber = '2348164091531';

  const whatsappMessage = encodeURIComponent(
    `Hello FitTrust Medicals, I am interested in ${product.name}. Please send me the price and more information.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">

        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <ChevronLeft size={18} />
          Back to Products
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">

            {/* PRODUCT IMAGES */}
            <div className="p-5 sm:p-8">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="h-full w-full object-contain p-8"
                />
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-slate-50"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">

              <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {product.category}
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Product Information
                </h2>

                <p className="mt-3 text-base leading-8 text-gray-600">
                  {product.description ||
                    `The ${product.name} is a medical product available from FitTrust Medicals. Contact us for current pricing, availability and further product information.`}
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-blue-600"
                    size={22}
                  />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      Need more information?
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Contact FitTrust Medicals on WhatsApp for price,
                      availability, specifications and other product details.
                    </p>
                  </div>
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
      </div>
    </main>
  );
}
