'use client';

import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const whatsappNumber = '2348164091531';

  const whatsappMessage = encodeURIComponent(
    `Hello FitTrust Medicals, I am interested in ${product.name}. Please send me the price and more information.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-gray-50">
          <SafeImage
            src={product.image}
            alt={product.name}
            fallback="/placeholder.svg"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-4 pb-2">
          <p className="mb-1 text-xs text-blue-600">
            {product.category}
          </p>

          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
        >
          Click for Price
        </a>
      </div>
    </div>
  );
}

export { ProductCard };
export default ProductCard;