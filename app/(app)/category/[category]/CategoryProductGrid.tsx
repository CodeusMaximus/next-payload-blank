'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  images?: any[];
  description?: string;
  stock?: number;
  dealOfWeek?: boolean;
  tags?: string[];
  sku?: string;
}

interface CategoryProductGridProps {
  products: Product[];
}

interface Filters {
  priceRange: [number, number];
  availability: 'all' | 'instock' | 'outofstock';
  sale: 'all' | 'sale' | 'regular';
  tags: string[];
  dealOfWeek: boolean;
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get price range and available tags from products
  const allPrices = products.map(p => p.onSale && p.salePrice ? p.salePrice : p.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const allTags = Array.from(new Set(products.flatMap(p => p.tags || [])));

  const [filters, setFilters] = useState<Filters>({
    priceRange: [minPrice, maxPrice],
    availability: 'all',
    sale: 'all',
    tags: [],
    dealOfWeek: false,
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const currentPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
    
    // Price range filter
    if (currentPrice < filters.priceRange[0] || currentPrice > filters.priceRange[1]) return false;
    
    // Availability filter
    if (filters.availability === 'instock' && (product.stock ?? 0) === 0) return false;
    if (filters.availability === 'outofstock' && (product.stock ?? 0) > 0) return false;
    
    // Sale filter
    if (filters.sale === 'sale' && !product.onSale) return false;
    if (filters.sale === 'regular' && product.onSale) return false;
    
    // Tags filter
    if (filters.tags.length > 0 && !filters.tags.some(tag => product.tags?.includes(tag))) return false;
    
    // Deal of week filter
    if (filters.dealOfWeek && !product.dealOfWeek) return false;
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        const priceA = a.onSale && a.salePrice ? a.salePrice : a.price;
        const priceB = b.onSale && b.salePrice ? b.salePrice : b.price;
        return priceA - priceB;
      case 'price-high':
        const priceA2 = a.onSale && a.salePrice ? a.salePrice : a.price;
        const priceB2 = b.onSale && b.salePrice ? b.salePrice : b.price;
        return priceB2 - priceA2;
      case 'newest':
      default:
        return 0;
    }
  });

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [minPrice, maxPrice],
      availability: 'all',
      sale: 'all',
      tags: [],
      dealOfWeek: false,
    });
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'priceRange' && (value[0] !== minPrice || value[1] !== maxPrice)) return count + 1;
    if (key === 'availability' && value !== 'all') return count + 1;
    if (key === 'sale' && value !== 'all') return count + 1;
    if (key === 'tags' && value.length > 0) return count + 1;
    if (key === 'dealOfWeek' && value) return count + 1;
    return count;
  }, 0);

  return (
    <>
      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={() => setShowFilters(false)} 
        />
      )}

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0 lg:relative fixed lg:static top-0 left-0 z-50 lg:z-auto h-full lg:h-auto`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl lg:shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full lg:h-auto overflow-y-auto lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => updateFilters({ 
                        priceRange: [Number(e.target.value), filters.priceRange[1]] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => updateFilters({ 
                        priceRange: [filters.priceRange[0], Number(e.target.value)] 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Availability</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Products' },
                    { value: 'instock', label: 'In Stock Only' },
                    { value: 'outofstock', label: 'Out of Stock' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={filters.availability === option.value}
                        onChange={(e) => updateFilters({ availability: e.target.value as any })}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sale Filter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sale Status</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Products' },
                    { value: 'sale', label: 'On Sale Only' },
                    { value: 'regular', label: 'Regular Price' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sale"
                        value={option.value}
                        checked={filters.sale === option.value}
                        onChange={(e) => updateFilters({ sale: e.target.value as any })}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deal of Week Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.dealOfWeek}
                    onChange={(e) => updateFilters({ dealOfWeek: e.target.checked })}
                    className="text-blue-600"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">Deal of the Week Only</span>
                </label>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allTags.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilters({ tags: [...filters.tags, tag] });
                            } else {
                              updateFilters({ tags: filters.tags.filter(t => t !== tag) });
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {tag.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedProducts.length} of {products.length} products
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters:</h4>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice ? (
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <button onClick={() => updateFilters({ priceRange: [minPrice, maxPrice] })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null}
                {filters.availability !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {filters.availability === 'instock' ? 'In Stock' : 'Out of Stock'}
                    <button onClick={() => updateFilters({ availability: 'all' })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.sale !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {filters.sale === 'sale' ? 'On Sale' : 'Regular Price'}
                    <button onClick={() => updateFilters({ sale: 'all' })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.dealOfWeek && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    Deal of the Week
                    <button onClick={() => updateFilters({ dealOfWeek: false })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {tag.replace('-', ' ')}
                    <button onClick={() => updateFilters({ tags: filters.tags.filter(t => t !== tag) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const mainImage = Array.isArray(product.images) ? product.images[0] : product.images;
  const imageUrl = typeof mainImage === 'object' && mainImage?.url ? mainImage.url : null;
  const imageAlt = typeof mainImage === 'object' && mainImage?.alt ? mainImage.alt : product.name;

  const isOnSale = product.onSale && product.salePrice;
  const displayPrice = isOnSale ? product.salePrice : product.price;
  const originalPrice = isOnSale ? product.price : null;
  const isOutOfStock = (product.stock ?? 0) === 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square relative bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                SALE
              </span>
            )}
            {product.dealOfWeek && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Deal
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-gray-700">
            <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full"
              >
                {tag.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Rating (placeholder) */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${displayPrice?.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {isOnSale && originalPrice && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {(((originalPrice - displayPrice!) / originalPrice) * 100).toFixed(0)}% off
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="mb-3">
            {product.stock > 0 ? (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-xs text-red-600 dark:text-red-400">
                ✗ Out of Stock
              </p>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          disabled={isOutOfStock}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}