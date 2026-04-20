export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  website_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  category_id: string | null;
  brand_id: string | null;
  base_price: number;
  compare_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  finish: string | null;
  base_type: string | null;
  coverage_sqm_per_liter: number | null;
  dry_time_hours: number | null;
  coats_required: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  compare_price: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  street: string;
  colonia: string;
  city: string;
  state: string;
  zip: string;
  address_notes: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  variant?: ProductVariant & { product?: Product };
}

export interface LocalCartItem {
  variant_id: string;
  quantity: number;
  product_name: string;
  variant_name: string;
  price: number;
  image_url: string | null;
  slug: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  delivery_fee: number;
  address_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  address?: Address;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  finish?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest' | 'featured';
  page?: number;
  limit?: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  delivering: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  delivering: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const FINISH_LABELS: Record<string, string> = {
  flat: 'Mate/Flat',
  matte: 'Mate',
  eggshell: 'Cáscara de huevo',
  satin: 'Satinado',
  'semi-gloss': 'Semi-brillante',
  gloss: 'Brillante',
  'high-gloss': 'Alto brillo',
};
