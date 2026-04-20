'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Tags, Users,
  LogOut, BarChart3, MessageSquare, ChevronLeft, ChevronRight, Menu,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { href: '/admin/categorias', icon: Tags, label: 'Categorías' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/mensajes', icon: MessageSquare, label: 'Mensajes' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 bg-[#1C1C2E] rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-[#1C1C2E] flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`flex items-center border-b border-white/10 h-16 flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          {!collapsed && (
            <Image src="/logo-mapex.png" alt="MAPEX" width={100} height={40} className="h-8 w-auto brightness-0 invert" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 rounded-lg bg-white/10 items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`
                flex items-center rounded-xl text-sm font-medium transition-colors group
                ${collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'}
                ${isActive(href)
                  ? 'bg-[#E8462A] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'}
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive(href) ? 'text-white' : 'group-hover:text-[#F5A623]'} transition-colors`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? 'Ver sitio web' : undefined}
            className={`flex items-center rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5'}`}
          >
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Ver sitio web</span>}
          </Link>
          <Link
            href="/api/auth/logout"
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`flex items-center rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5'}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </Link>
        </div>
      </aside>

      {/* Spacer for content */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`} />
    </>
  );
}
