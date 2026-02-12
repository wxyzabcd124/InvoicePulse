import { Product } from '../types';

const PRODUCTS_STORAGE_KEY = 'invoicePulseProducts';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

export const getProducts = (): Product[] => {
  const productsJson = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!productsJson) return [];
  try {
    return JSON.parse(productsJson);
  } catch (e) {
    console.error('Failed to parse products', e);
    return [];
  }
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

export const isDuplicateProduct = (name: string, category: string, excludeId?: string): Product | null => {
  const products = getProducts();
  const duplicate = products.find(p => 
    p.id !== excludeId &&
    p.name.trim().toLowerCase() === name.trim().toLowerCase() &&
    p.category.trim().toLowerCase() === category.trim().toLowerCase()
  );
  return duplicate || null;
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = { ...product, id: generateId() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (updatedProduct: Product): Product => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  }
  throw new Error('Product not found');
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const updatedProducts = products.filter(p => p.id !== id);
  saveProducts(updatedProducts);
};

export const consolidateCatalog = (): number => {
  const products = getProducts();
  const consolidatedMap: Record<string, Product> = {};
  let removedCount = 0;

  products.forEach(p => {
    const key = `${p.name.trim().toLowerCase()}_${p.category.trim().toLowerCase()}`;
    if (consolidatedMap[key]) {
      // Merge logic: Keep the one with more data
      const existing = consolidatedMap[key];
      // Prefer entry with image or longer description
      if (!existing.image && p.image) existing.image = p.image;
      if (p.description.length > existing.description.length) existing.description = p.description;
      // Always use latest price (assuming order of entry)
      existing.defaultPrice = p.defaultPrice;
      existing.defaultDiscount = p.defaultDiscount || existing.defaultDiscount;
      removedCount++;
    } else {
      consolidatedMap[key] = { ...p };
    }
  });

  saveProducts(Object.values(consolidatedMap));
  return removedCount;
};