export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategories: string[];
  description: string;
  defaultPrice: number;
  defaultDiscount?: number;
  image?: string; // base64 string
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // Per-item percentage reduction (e.g., 10 for 10% off)
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g., 0.05 for 5%
  taxAmount: number;
  total: number;
  isPaid: boolean;
  notes?: string;
}

export interface CompanySettings {
  name: string;
  email: string;
  address: string;
  phone: string;
  logo?: string; // base64 string
  currency: string;
}