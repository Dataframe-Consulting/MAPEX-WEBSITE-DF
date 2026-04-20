import { Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandBanner } from '@/components/home/BrandBanner';
import { WhyMapex } from '@/components/home/WhyMapex';
import { CatalogSection } from '@/components/home/CatalogSection';
import { ContactSection } from '@/components/home/ContactSection';

function ProductsLoading() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-10 bg-gray-100 rounded-lg w-64 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-2xl aspect-square mb-3" />
              <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-100 rounded mb-3 w-1/2" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <Suspense fallback={<ProductsLoading />}>
        <FeaturedProducts />
      </Suspense>
      <BrandBanner />
      <WhyMapex />
      <CatalogSection />
      <ContactSection />
    </>
  );
}
