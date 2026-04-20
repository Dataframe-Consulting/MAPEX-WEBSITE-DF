'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { slug: 'pinturas-interiores', name: 'Pinturas Interior' },
  { slug: 'pinturas-exteriores', name: 'Pinturas Exterior' },
  { slug: 'impermeabilizantes', name: 'Impermeabilizantes' },
  { slug: 'esmaltes', name: 'Esmaltes' },
  { slug: 'recubrimientos', name: 'Recubrimientos' },
  { slug: 'accesorios', name: 'Accesorios' },
];

const brands = [
  { slug: 'sherwin-williams', name: 'Sherwin Williams' },
  { slug: 'boden', name: 'Boden' },
];

const finishes = ['flat', 'matte', 'eggshell', 'satin', 'semi-gloss', 'gloss', 'high-gloss'];
const finishLabels: Record<string, string> = {
  flat: 'Mate/Flat', matte: 'Mate', eggshell: 'Cáscara de huevo',
  satin: 'Satinado', 'semi-gloss': 'Semi-brillante', gloss: 'Brillante', 'high-gloss': 'Alto brillo',
};

const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
];

export function ProductFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('buscar') || '');

  const currentCategory = searchParams.get('categoria') || '';
  const currentBrand = searchParams.get('marca') || '';
  const currentFinish = searchParams.get('acabado') || '';
  const currentSort = searchParams.get('orden') || 'featured';

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('pagina');
    router.push(`/productos?${params.toString()}`);
  }, [router, searchParams]);

  const clearAll = () => {
    router.push('/productos');
    setSearch('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('buscar', search);
  };

  const hasFilters = currentCategory || currentBrand || currentFinish || searchParams.get('buscar');

  return (
    <div className="space-y-4">
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] focus:border-transparent"
            />
          </div>
          <Button type="submit" variant="primary" size="md">Buscar</Button>
        </form>

        <div className="flex gap-2">
          <select
            value={currentSort}
            onChange={e => updateFilter('orden', e.target.value)}
            className="h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border transition-colors ${
              showFilters || hasFilters
                ? 'bg-[#E8462A] text-white border-[#E8462A]'
                : 'border-gray-200 text-gray-700 hover:border-[#E8462A] hover:text-[#E8462A]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasFilters && (
              <span className="h-5 w-5 rounded-full bg-white text-[#E8462A] text-xs flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter tags */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          {searchParams.get('buscar') && (
            <FilterTag label={`"${searchParams.get('buscar')}"`} onRemove={() => updateFilter('buscar', '')} />
          )}
          {currentCategory && (
            <FilterTag label={categories.find(c => c.slug === currentCategory)?.name || currentCategory} onRemove={() => updateFilter('categoria', '')} />
          )}
          {currentBrand && (
            <FilterTag label={brands.find(b => b.slug === currentBrand)?.name || currentBrand} onRemove={() => updateFilter('marca', '')} />
          )}
          {currentFinish && (
            <FilterTag label={finishLabels[currentFinish] || currentFinish} onRemove={() => updateFilter('acabado', '')} />
          )}
          <button onClick={clearAll} className="text-xs text-[#E8462A] hover:underline">Limpiar todo</button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-down">
          <FilterGroup title="Categoría">
            {categories.map(cat => (
              <FilterOption
                key={cat.slug}
                label={cat.name}
                active={currentCategory === cat.slug}
                onClick={() => updateFilter('categoria', currentCategory === cat.slug ? '' : cat.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Marca">
            {brands.map(brand => (
              <FilterOption
                key={brand.slug}
                label={brand.name}
                active={currentBrand === brand.slug}
                onClick={() => updateFilter('marca', currentBrand === brand.slug ? '' : brand.slug)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Acabado">
            {finishes.map(finish => (
              <FilterOption
                key={finish}
                label={finishLabels[finish]}
                active={currentFinish === finish}
                onClick={() => updateFilter('acabado', currentFinish === finish ? '' : finish)}
              />
            ))}
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#E8462A] text-xs font-medium px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-[#E8462A] text-white font-medium'
          : 'text-gray-600 hover:bg-red-50 hover:text-[#E8462A]'
      }`}
    >
      {label}
    </button>
  );
}
