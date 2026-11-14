import path from 'node:path';

import { uniqueSku } from '../../shared/test-data';

export interface TestProduct {
  sku: string;
  name: string;
  category: string;
  supplier: string;
  price: string;
  stock: string;
  status: 'Active' | 'Draft' | 'Discontinued';
}

/** The plan's test data for a new product (SC-005, SC-007, SC-008), with a SKU of its own. */
export function newTestProduct(): TestProduct {
  const sku = uniqueSku();
  return {
    sku,
    name: `Test product ${sku}`,
    category: 'Home & Kitchen',
    supplier: 'Granite Works',
    price: '19.99',
    stock: '25',
    status: 'Draft',
  };
}

/** The image the plan uses in SC-007. Manual testers can use the same file. */
export const PRODUCT_IMAGE = path.join(__dirname, 'test-files', 'product.png');
