import path from 'node:path';

import { uniqueSku } from '../../shared/test-data';

export interface TestProduct {
  sku: string;
  name: string;
  category: string;
  supplier: string;
  price: string;
  stock: string;
}

export function newTestProduct(): TestProduct {
  const sku = uniqueSku();
  return {
    sku,
    name: `Test product ${sku}`,
    category: 'Home & Kitchen',
    supplier: 'Granite Works',
    price: '19.99',
    stock: '25',
  };
}

export const PRODUCT_IMAGE = path.join(__dirname, 'test-files', 'product.png');
