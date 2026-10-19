import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductGrid from '../components/common/ProductGrid.jsx';
import { apiService } from '../services/api.js';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featRes, trendRes, catRes] = await Promise.all([
          apiService.getFeaturedProducts(4),
          apiService.getTrendingProducts(4),
          apiService.getCategories()
        ]);
        setFeaturedProducts(Array.isArray(featRes?.data) ? featRes.data : []);
        setTrendingProducts(Array.isArray(trendRes?.data) ? trendRes.data : []);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline and Call-to-Action */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold w-max mb-5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>New Season Essentials Collection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
                Refined essentials for conscious, modern living.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed">
                Discover a thoughtfully curated collection of timeless audio tech, organic apparel, and handcrafted home goods crafted for effortless daily longevity.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?category=electronics"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 transition-colors"
                >
                  Featured Audio & Tech
                </Link>
              </div>

              {/* Small Trust Micro-bar */}
              <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-slate-600">
                <div>
                  <div className="text-lg font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500">Authentic Goods</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">2-4 Days</div>
                  <div className="text-xs text-slate-500">Fast Express Delivery</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">30 Days</div>
                  <div className="text-xs text-slate-500">Simple Return Policy</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Product / Lifestyle Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm aspect-4/3 sm:aspect-5/4 lg:aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85"
                  alt="AcousticPro Premium Noise-Cancelling Headphones"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-x-4 bottom-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">Staff Pick</span>
                    <h2 className="text-xs sm:text-sm font-semibold text-slate-900">AcousticPro Noise-Cancelling</h2>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">$199.99</p>
                  </div>
                  <Link
                    to="/product/prod-elec-1"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Explore our focused product departments</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Array.isArray(categories) ? categories : []).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col bg-slate-50 hover:bg-white border border-slate-200 rounded-xl overflow-hidden p-3 transition-all duration-200 hover:shadow-sm hover:border-slate-300"
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {cat.itemCount} items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                Handpicked
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Products</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
            >
              View Full Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* 4. Promotional Banner */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 sm:p-12 lg:p-14">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-teal-400 mb-2 block">
                Limited Promotion
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-snug">
                Take 10% off your first checkout with code WELCOME10
              </h3>
              <p className="text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
                Enjoy complimentary express delivery on orders surpassing $50. No subscription fees, no surprises at checkout.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/shop"
                  className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
                >
                  Shop the Promotion
                </Link>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                  CODE: WELCOME10
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="rounded-xl overflow-hidden border border-slate-800 aspect-16/9">
                <img
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80"
                  alt="Apparel and Accessories"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending / New Arrivals */}
      <section className="py-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
              Fresh Additions
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending & New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
          >
            See All New Releases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={trendingProducts} loading={loading} />
      </section>
    </div>
  );
}
