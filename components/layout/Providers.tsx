'use client';

import { CartSidebar } from './CartSidebar';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <CartSidebar />
    </ToastProvider>
  );
}
