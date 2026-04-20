'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos', hasDropdown: true },
  { href: '/catalogos', label: 'Catálogos' },
  { href: '/#nosotros', label: 'Nosotros' },
  { href: '/#contacto', label: 'Contacto' },
];

const productCategories = [
  { href: '/productos?categoria=pinturas-interiores', label: 'Pinturas de Interior' },
  { href: '/productos?categoria=pinturas-exteriores', label: 'Pinturas de Exterior' },
  { href: '/productos?categoria=impermeabilizantes', label: 'Impermeabilizantes' },
  { href: '/productos?categoria=esmaltes', label: 'Esmaltes' },
  { href: '/productos?categoria=recubrimientos', label: 'Recubrimientos Especiales' },
  { href: '/productos?categoria=accesorios', label: 'Accesorios y Herramientas' },
  { href: '/productos?marca=sherwin-williams', label: '★ Sherwin Williams' },
  { href: '/productos?marca=boden', label: '★ Boden' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const { getTotalItems, openCart } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProducts(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/productos?buscar=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#1C1C2E] text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+526621234567" className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors">
              <Phone className="h-3 w-3" />
              (662) 123-4567
            </a>
            <a
              href="https://maps.google.com/?q=Nayarit+116+Hermosillo+Sonora"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors"
            >
              <MapPin className="h-3 w-3" />
              Nayarit #116 Int. 2, Hermosillo, Son.
            </a>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <span>Lun-Sáb 8am - 6pm</span>
            <span className="text-[#F5A623] font-medium">Distribuidor Oficial Sherwin Williams</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md'
          : 'bg-white shadow-sm'
      )}>
        <div className="rainbow-bar" />
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-mapex.png"
                alt="MAPEX - Distribuidora de Pinturas"
                width={140}
                height={56}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-[#E8462A] bg-red-50'
                        : 'text-gray-700 hover:text-[#E8462A] hover:bg-red-50'
                    )}
                    onMouseEnter={() => link.hasDropdown && setShowProducts(true)}
                    onMouseLeave={() => link.hasDropdown && setShowProducts(false)}
                  >
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                  </Link>

                  {link.hasDropdown && showProducts && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down"
                      onMouseEnter={() => setShowProducts(true)}
                      onMouseLeave={() => setShowProducts(false)}
                    >
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#E8462A] transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    autoFocus
                    className="w-48 md:w-64 h-9 px-3 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#E8462A] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3 bg-[#E8462A] text-white rounded-r-lg hover:bg-[#c73820] transition-colors"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-1 p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-600 hover:text-[#E8462A] hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-[#E8462A] hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#E8462A] text-white text-xs flex items-center justify-center font-bold animate-scale-in">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#E8462A] hover:bg-red-50 rounded-lg transition-colors ml-1"
                aria-label="Menú"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-[#E8462A] bg-red-50'
                        : 'text-gray-700 hover:text-[#E8462A] hover:bg-red-50'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.hasDropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          className="block px-4 py-2 text-xs text-gray-600 hover:text-[#E8462A] rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1 px-4">
                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> (662) 123-4567</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Nayarit #116 Int. 2, Hermosillo</p>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
