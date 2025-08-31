// app/(app)/category/[category]/page.tsx
import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Filter, SortAsc } from 'lucide-react';
import CategoryProductGrid from './CategoryProductGrid';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

// Category display names mapping
const categoryDisplayNames: Record<string, string> = {
  'dairy': 'Dairy Products',
  'drinks': 'Beverages',
  'frozen': 'Frozen Foods',
  'deli': 'Deli',
  'produce': 'Fresh Produce',
  'meat': 'Fresh Meat',
  'bakery': 'Bakery',
  'alcohol': 'Wine & Spirits',
  'seafood': 'Fresh Seafood',
  'bread': 'Fresh Bread',
  'coffee': 'Coffee & Tea',
  'vegetables': 'Fresh Vegetables',
  'fruits': 'Fresh Fruits',
  'cheese': 'Cheese',
  'breakfast': 'Breakfast Items',
  'hot-food': 'Hot Prepared Foods',
  'cold-food': 'Cold Prepared Foods',
  'sandwiches': 'Sandwiches',
  'salads': 'Fresh Salads',
  'soups': 'Soups',
  'pizza': 'Pizza',
  'snacks': 'Snacks',
  'candy': 'Candy & Sweets',
  'desserts': 'Desserts',
  'energy': 'Energy Drinks',
  'health': 'Health Foods',
  'organic': 'Organic Products',
  'personal': 'Personal Care',
  'pharmacy': 'Pharmacy',
  'baby': 'Baby Items',
  'pet': 'Pet Supplies',
  'household': 'Household Items',
  'flowers': 'Fresh Flowers',
  'ice-cream': 'Ice Cream',
  'soda': 'Soda',
  'chips': 'Chips & Snacks',
  'paper-plastic': 'Paper & Plastic',
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const payload = await getPayload({ config });
  
  // Await params in newer Next.js versions
  const { category } = await params;

  try {
    // Fetch products for this category
    const products = await payload.find({
      collection: 'products' as any,
      where: {
        category: { equals: category }
      },
      depth: 2,
      limit: 100, // Adjust as needed
      sort: '-updatedAt',
    });

    const productList = products.docs || [];
    
    // Get category display name
    const categoryName = categoryDisplayNames[category] || category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Back Button */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>

            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {categoryName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {productList.length} {productList.length === 1 ? 'product' : 'products'} available
                </p>
              </div>

              {/* Filter & Sort Controls */}
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <SortAsc className="h-4 w-4" />
                  Sort
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {productList.length > 0 ? (
            <CategoryProductGrid products={productList} />
          ) : (
            /* Empty State */
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
                We don't have any products in the {categoryName.toLowerCase()} category yet.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    );

  } catch (error) {
    console.error('Error fetching category products:', error);
    notFound();
  }
}