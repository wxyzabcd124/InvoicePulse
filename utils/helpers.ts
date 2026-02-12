// Helper to generate unique internal IDs
export const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Helper to generate professional invoice numbers (e.g., INV-123456)
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}${random}`;
};
