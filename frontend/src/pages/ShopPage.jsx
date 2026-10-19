import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  Star
} from 'lucide-react';
import ProductGrid from '../components/common/ProductGrid.jsx';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { apiService } from '../services/api.js';
import { CATEGORIES } from '../data/products.js';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL or default
  const activeCategory = searchParams.get('category') || 'all';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'featured';

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [sortBy, setSortBy] = useState(activeSort);
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under-50', '50-100', '100-200', '200-plus'
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  // Sync state if URL changes (e.g. from navbar link)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchTerm(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  // Fetch products whenever filters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let minPrice = '';
        let maxPrice = '';
        if (priceRange === 'under-50') {
          maxPrice = 50;
        } else if (priceRange === '50-100') {
          minPrice = 50;
          maxPrice = 100;
        } else if (priceRange === '100-200') {
          minPrice = 100;
          maxPrice = 200;
        } else if (priceRange === '200-plus') {
          minPrice = 200;
        }

        const res = await apiService.getProducts({
          category: selectedCategory,
          search: searchTerm,
          minPrice,
          maxPrice,
          minRating: minRating > 0 ? minRating : undefined,
          inStockOnly,
          sortBy,
          page: 1,
          limit: 100 // Load all matching to support load more
        });

        setProducts(Array.isArray(res?.data) ? res.data : []);
        setVisibleCount(8);
      } catch (err) {
        console.error('Failed to query products', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory, searchTerm, sortBy, priceRange, minRating, inStockOnly]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'featured') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', val);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange('all');
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchTerm !== '' ||
    priceRange !== 'all' ||
    minRating > 0 ||
    inStockOnly;

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const categoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'All Products';
    const found = CATEGORIES.find(c => c.slug === selectedCategory);
    return found ? found.name : selectedCategory;
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Shop', to: selectedCategory !== 'all' ? '/shop' : null },
            ...(selectedCategory !== 'all' ? [{ label: categoryName }] : [])
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between py-4 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {searchTerm ? `Results for "${searchTerm}"` : categoryName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {visibleProducts.length} of {products.length} {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap py-3 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                Category: {categoryName}
                <button onClick={() => handleCategoryChange('all')} aria-label="Remove category filter">
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                Keyword: "{searchTerm}"
                <button onClick={() => { setSearchTerm(''); const p = new URLSearchParams(searchParams); p.delete('search'); setSearchParams(p); }}>
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                Price: {priceRange.replace('-', ' to $').replace('under-', 'Under $').replace('-plus', '+')}
                <button onClick={() => setPriceRange('all')}>
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                {minRating}★ & Above
                <button onClick={() => setMinRating(0)}>
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-semibold text-slate-900 block mb-2">Search</label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Filter by keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat.itemCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Price Range
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-50', label: 'Under $50' },
                  { id: '50-100', label: '$50 to $100' },
                  { id: '100-200', label: '$100 to $200' },
                  { id: '200-plus', label: '$200 and Above' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input
                      type="radio"
                      name="price-filter"
                      checked={priceRange === item.id}
                      onChange={() => setPriceRange(item.id)}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Customer Rating
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                {[
                  { val: 0, label: 'All Ratings' },
                  { val: 4.8, label: '4.8★ & Above' },
                  { val: 4.5, label: '4.5★ & Above' },
                  { val: 4.0, label: '4.0★ & Above' }
                ].map((item) => (
                  <label key={item.val} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                    <input
                      type="radio"
                      name="rating-filter"
                      checked={minRating === item.val}
                      onChange={() => setMinRating(item.val)}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Show in-stock items only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {products.length === 0 && !loading ? (
              <EmptyState
                title="No matching products found"
                description="We couldn't find any products matching your selected filter criteria. Try resetting your search or expanding the price range."
                actionLabel="Reset All Filters"
                actionTo={null}
                onActionClick={clearAllFilters}
              />
            ) : (
              <>
                <ProductGrid products={visibleProducts} loading={loading} />

                {/* Load More Button */}
                {visibleCount < products.length && (
                  <div className="mt-12 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
                    >
                      Load More Products ({products.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto max-w-xs w-full bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Category
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left p-2 rounded ${
                      selectedCategory === 'all' ? 'bg-slate-900 text-white font-medium' : 'text-slate-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.slug)}
                      className={`w-full text-left p-2 rounded ${
                        selectedCategory === c.slug ? 'bg-slate-900 text-white font-medium' : 'text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Price
                </h4>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-50', label: 'Under $50' },
                    { id: '50-100', label: '$50 to $100' },
                    { id: '100-200', label: '$100 to $200' },
                    { id: '200-plus', label: '$200 and Above' }
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={priceRange === p.id}
                        onChange={() => setPriceRange(p.id)}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
