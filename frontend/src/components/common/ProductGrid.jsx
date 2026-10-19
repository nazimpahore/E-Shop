import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-xl overflow-hidden p-4">
            <div className="aspect-square bg-slate-100 rounded-lg mb-3" />
            <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="h-5 bg-slate-100 rounded w-1/4" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
