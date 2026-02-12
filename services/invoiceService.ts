import { Client, Invoice, InvoiceItem } from '../types';

const CLIENTS_STORAGE_KEY = 'invoicePulseClients';
const INVOICES_STORAGE_KEY = 'invoicePulseInvoices';

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Client Service
export const getClients = (): Client[] => {
  const clientsJson = localStorage.getItem(CLIENTS_STORAGE_KEY);
  return clientsJson ? JSON.parse(clientsJson) : [];
};

export const saveClients = (clients: Client[]): void => {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
};

export const addClient = (client: Omit<Client, 'id'>): Client => {
  const clients = getClients();
  const newClient: Client = { ...client, id: generateId() };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
};

export const updateClient = (updatedClient: Client): Client => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === updatedClient.id);
  if (index !== -1) {
    clients[index] = updatedClient;
    saveClients(clients);
    return updatedClient;
  }
  throw new Error('Client not found');
};

export const deleteClient = (id: string): void => {
  let clients = getClients();
  clients = clients.filter(c => c.id !== id);
  saveClients(clients);
};

export const getClientById = (id: string): Client | undefined => {
  const clients = getClients();
  return clients.find(c => c.id === id);
};


// Invoice Service
export const getInvoices = (): Invoice[] => {
  const invoicesJson = localStorage.getItem(INVOICES_STORAGE_KEY);
  return invoicesJson ? JSON.parse(invoicesJson) : [];
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
};

export const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number): { subtotal: number; taxAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = item.discount ? (baseAmount * (item.discount / 100)) : 0;
    return sum + baseAmount - discountAmount;
  }, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
};

export const addInvoice = (invoice: Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'total'>): Invoice => {
  const invoices = getInvoices();
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const newInvoice: Invoice = {
    ...invoice,
    id: generateId(),
    subtotal,
    taxAmount,
    total,
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
};

export const updateInvoice = (updatedInvoice: Invoice): Invoice => {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === updatedInvoice.id);
  if (index !== -1) {
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(updatedInvoice.items, updatedInvoice.taxRate);
    const invoiceToSave = {
      ...updatedInvoice,
      subtotal,
      taxAmount,
      total,
    };
    invoices[index] = invoiceToSave;
    saveInvoices(invoices);
    return invoiceToSave;
  }
  throw new Error('Invoice not found');
};

export const deleteInvoice = (id: string): void => {
  let invoices = getInvoices();
  invoices = invoices.filter(i => i.id !== id);
  saveInvoices(invoices);
};

export const getInvoiceById = (id: string): Invoice | undefined => {
  const invoices = getInvoices();
  return invoices.find(i => i.id === id);
};

// Alert Helpers
export interface InvoiceAlert {
  invoice: Invoice;
  type: 'overdue' | 'upcoming';
  daysLeft?: number;
}

export const getInvoiceAlerts = (): InvoiceAlert[] => {
  const invoices = getInvoices();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const alerts: InvoiceAlert[] = [];
  
  invoices.forEach(inv => {
    if (inv.isPaid) return;
    
    const dueDate = new Date(inv.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      alerts.push({ invoice: inv, type: 'overdue' });
    } else if (diffDays <= 3) {
      alerts.push({ invoice: inv, type: 'upcoming', daysLeft: diffDays });
    }
  });
  
  return alerts.sort((a, b) => {
    if (a.type === 'overdue' && b.type !== 'overdue') return -1;
    if (a.type !== 'overdue' && b.type === 'overdue') return 1;
    return new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime();
  });
};