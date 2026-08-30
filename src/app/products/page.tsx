'use client';

import { Suspense, useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { products } from '@/data/products';

function ProductsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    ...Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    ),
  ];

  /*
   * Read category/search from the URL.
   *
   * This makes these links work:
   * /products
   * /products?category=Diagnostics
   * /products?search=thermometer
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const category = params.get('category');
    const search = params.get('search');

    if (category && categories.includes(category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory('All');
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      query === '' ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query);

    const matchesCategory =
      activeCategory === 'All' ||
      product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    const url =
      category === 'All'
        ? '/products'
        : `/products?category=${encodeURIComponent(category)}`;

    window.history.replaceState({}, '', url);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const params = new URLSearchParams(window.location.search);

    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }

    if (activeCategory !== 'All') {
      params.set('category', activeCategory);
    }

    const queryString = params.toString();

    window.history.replaceState(
      {},
      '',
      queryString ? `/products?${queryString}` : '/products'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {activeCategory === 'All'
                ? 'All Products'
                : activeCategory}
            </h1>

            <p className="mt-1 text-gray-500">
              Browse our complete catalog of medical supplies.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">

          {/* FILTER SIDEBAR */}
          <aside className="w-full shrink-0 lg:w-64">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">

              <div className="mb-5 flex items-center gap-2 border-b pb-4">
                <SlidersHorizontal size={20} />

                <h2 className="text-lg font-bold">
                  Categories
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition lg:block lg:w-full ${
                      activeCategory === category
                        ? 'bg-blue-50 font-semibold text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <main className="min-w-0 flex-1">

            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-700">
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>

              {activeCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleCategoryChange('All')}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all products
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white p-10 text-center sm:p-16">
                <Search
                  className="mx-auto mb-4 text-gray-300"
                  size={48}
                />

                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  No products found
                </h3>

                <p className="text-gray-500">
                  Try adjusting your search or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    handleCategoryChange('All');
                  }}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  View All Products
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
