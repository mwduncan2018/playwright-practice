export type ProductStatus = 'Active' | 'Draft' | 'Discontinued';
export const PRODUCT_STATUSES: ProductStatus[] = ['Active', 'Draft', 'Discontinued'];

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  supplier_id: number | null;
  supplier_name: string | null;
  price: number;
  stock: number;
  reorder_level: number;
  status: ProductStatus;
  low_stock: boolean;
  has_image: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  product_count: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  product_count: number;
}

export interface Activity {
  id: number;
  at: string;
  username: string;
  user_display_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  entity_label: string;
  details: string;
}

export interface ActivityUser {
  username: string;
  name: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Dashboard {
  product_count: number;
  active_count: number;
  low_stock_count: number;
  category_count: number;
  supplier_count: number;
  low_stock: Product[];
  recently_updated: Product[];
}
