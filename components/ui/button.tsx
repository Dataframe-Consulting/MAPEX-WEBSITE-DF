'use client';

import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-[#E8462A] text-white hover:bg-[#c73820] active:scale-95 focus-visible:ring-[#E8462A]',
        secondary: 'bg-[#1C1C2E] text-white hover:bg-[#2d2d44] active:scale-95 focus-visible:ring-[#1C1C2E]',
        outline: 'border-2 border-[#E8462A] text-[#E8462A] bg-transparent hover:bg-[#E8462A] hover:text-white active:scale-95',
        ghost: 'text-[#1a1a1a] hover:bg-gray-100 hover:text-[#E8462A]',
        white: 'bg-white text-[#1C1C2E] hover:bg-gray-50 shadow-md active:scale-95',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
        success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-5',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Cargando...
          </>
        ) : children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
