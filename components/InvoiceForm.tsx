import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Invoice, Client, InvoiceItem, Product } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { generateId, generateInvoiceNumber } from '../utils/helpers';
import { addClient } from '../services/invoiceService';
import { getProducts } from '../services/productService';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'total'> | Invoice) => void;
  editingInvoice?: Invoice | null;
  clients: Client[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose, onSubmit, editingInvoice, clients }) => {
  const [invoice, setInvoice] = useState<Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'total'> | Invoice>({
    clientId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, discount: 0 }],
    taxRate: 0.05,
    isPaid: false,
    notes: '',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [activeProductSearchIdx, setActiveProductSearchIdx] = useState<number | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const productSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    if (editingInvoice) {
      setInvoice(editingInvoice);
      const selectedClient = clients.find(c => c.id === editingInvoice.clientId);
      setClientSearch(selectedClient ? selectedClient.name : '');
    } else {
      setInvoice({
        clientId: '',
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, discount: 0 }],
        taxRate: 0.05,
        isPaid: false,
        notes: '',
      });
      setClientSearch('');
    }
    setErrors({});
  }, [editingInvoice, isOpen, clients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setActiveProductSearchIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setInvoice(prev => ({ ...prev, [id]: checked }));
    } else {
      setInvoice(prev => ({ ...prev, [id]: value }));
    }
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const newItems = [...invoice.items];
    const updatedValue = ['quantity', 'unitPrice', 'discount'].includes(id) ? parseFloat(value) || 0 : value;
    newItems[index] = { ...newItems[index], [id]: updatedValue };
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const selectProductForItem = (index: number, product: Product) => {
    const subTags = product.subCategories && product.subCategories.length > 0 
      ? ` [${product.subCategories.join(', ')}]` 
      : '';
    const fullDescription = `${product.name}${subTags}${product.description ? '\n' + product.description : ''}`;

    // CHECK FOR DUPLICATES: Does this item already exist in the list (excluding current index)?
    const existingIdx = invoice.items.findIndex((item, i) => 
      i !== index && 
      (item.description === fullDescription || item.description === product.name) && 
      item.unitPrice === product.defaultPrice
    );

    if (existingIdx !== -1) {
      // SMART MERGE: Add quantity of the current searching line to the existing line
      const newItems = [...invoice.items];
      const quantityToAdd = newItems[index].quantity;
      newItems[existingIdx].quantity += quantityToAdd;
      
      // Remove the current line that we used for browsing
      newItems.splice(index, 1);
      
      // If we merged the only item, we must ensure at least one item exists (though usually we merge into an existing one)
      if (newItems.length === 0) {
        newItems.push({ id: generateId(), description: '', quantity: 1, unitPrice: 0, discount: 0 });
      }

      setInvoice(prev => ({ ...prev, items: newItems }));
    } else {
      // NORMAL UPDATE: No duplicate found, update current line
      const newItems = [...invoice.items];
      newItems[index] = {
        ...newItems[index],
        description: fullDescription,
        unitPrice: product.defaultPrice,
        discount: product.defaultDiscount || 0,
      };
      setInvoice(prev => ({ ...prev, items: newItems }));
    }
    
    setActiveProductSearchIdx(null);
  };

  const mergeAllDuplicates = () => {
    const consolidated: Record<string, InvoiceItem> = {};
    
    invoice.items.forEach(item => {
      // Create a key based on description, price, and discount to identify "identical" items
      const key = `${item.description.trim()}_${item.unitPrice}_${item.discount || 0}`;
      
      if (consolidated[key]) {
        consolidated[key].quantity += item.quantity;
      } else {
        consolidated[key] = { ...item };
      }
    });

    setInvoice(prev => ({
      ...prev,
      items: Object.values(consolidated)
    }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, unitPrice: 0, discount: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const selectClient = (client: Client) => {
    setInvoice(prev => ({ ...prev, clientId: client.id }));
    setClientSearch(client.name);
    setShowSuggestions(false);
    if (errors.clientId) {
      setErrors(prev => ({ ...prev, clientId: '' }));
    }
  };

  const pickRandomClient = () => {
    const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'James', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Charlotte', 'Theodore', 'Amelia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomName = `${randomFirstName} ${randomLastName}`;
    const randomMobile = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const newClientData: Omit<Client, 'id'> = {
      name: randomName,
      email: 'abc@gmail.com',
      address: `${Math.floor(Math.random() * 9999) + 1} Random Street, Tech City, 10101`,
      phone: randomMobile
    };
    const newClient = addClient(newClientData);
    selectClient(newClient);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!invoice.clientId) newErrors.clientId = 'Client is required.';
    if (!invoice.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice Number is required.';
    if (!invoice.issueDate) newErrors.issueDate = 'Issue Date is required.';
    if (!invoice.dueDate) newErrors.dueDate = 'Due Date is required.';
    if (invoice.items.length === 0) newErrors.items = 'At least one item is required.';
    invoice.items.forEach((item, index) => {
      if (!item.description.trim()) newErrors[`item-${index}-description`] = 'Description is required.';
      if (item.quantity <= 0) newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0.';
      if (item.unitPrice < 0) newErrors[`item-${index}-unitPrice`] = 'Price cannot be negative.';
    });
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(invoice);
    onClose();
  };

  const hasPossibleDuplicates = useMemo(() => {
    const descriptions = invoice.items.map(item => `${item.description.trim()}_${item.unitPrice}`);
    return new Set(descriptions).size !== descriptions.length;
  }, [invoice.items]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
      maxWidth="3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>{editingInvoice ? 'Save Changes' : 'Create Invoice'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative" ref={suggestionsRef}>
          <label htmlFor="clientSearch" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                id="clientSearch"
                type="text"
                placeholder="Search by name or email..."
                autoComplete="off"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowSuggestions(true);
                  if (invoice.clientId) setInvoice(prev => ({ ...prev, clientId: '' }));
                }}
                onFocus={() => setShowSuggestions(true)}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.clientId ? 'border-red-500' : ''}`}
              />
              {showSuggestions && clientSearch.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client.id}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white transition-colors"
                        onClick={() => selectClient(client)}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold block truncate">{client.name}</span>
                          <span className="text-xs text-gray-500 hover:text-blue-100 truncate">{client.email}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 px-3 text-gray-500 italic">No clients found</div>
                  )}
                </div>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={pickRandomClient} className="whitespace-nowrap flex items-center gap-1">
              🎲 New Random
            </Button>
          </div>
          {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="invoiceNumber" label="Invoice #" value={invoice.invoiceNumber} readOnly className="bg-gray-50 font-mono text-blue-700" />
          <Input id="taxRate" label="Global Tax (%)" type="number" value={(invoice.taxRate * 100).toFixed(2)} onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) / 100 || 0 }))} step="0.01" />
          <Input id="issueDate" label="Issue Date" type="date" value={invoice.issueDate} onChange={handleChange} error={errors.issueDate} required />
          <Input id="dueDate" label="Due Date" type="date" value={invoice.dueDate} onChange={handleChange} error={errors.dueDate} required />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Items
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Catalog Enabled</span>
            </h4>
            
            {hasPossibleDuplicates && (
              <button 
                type="button" 
                onClick={mergeAllDuplicates}
                className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Consolidate Duplicates
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Item #{index + 1}</span>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setActiveProductSearchIdx(activeProductSearchIdx === index ? null : index)}
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full transition-colors ${activeProductSearchIdx === index ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                    >
                      {activeProductSearchIdx === index ? 'Close Search' : 'Browse Catalog'}
                    </button>
                    {invoice.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Search View */}
                {activeProductSearchIdx === index && (
                  <div ref={productSearchRef} className="p-4 bg-blue-50 border-b border-blue-100 max-h-96 overflow-y-auto">
                    <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 sticky top-0 bg-blue-50 py-1">Select Product</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {products.length === 0 ? (
                        <p className="col-span-full text-xs text-blue-400 italic">Catalog is empty. Add items in the "Products" page.</p>
                      ) : (
                        products.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectProductForItem(index, p)}
                            className="bg-white border border-blue-100 p-2 rounded-lg text-left hover:border-blue-400 hover:shadow-sm transition-all group flex items-center gap-3"
                          >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                               {p.image ? (
                                 <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                 </div>
                               )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="font-black text-gray-900 text-[11px] truncate">{p.name}</div>
                                  <span className="text-[7px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded uppercase font-black">{p.category}</span>
                                </div>
                                <div className="text-[9px] text-gray-400 mt-0.5 font-bold">${p.defaultPrice.toFixed(2)}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description & Details</label>
                    <textarea
                      id="description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      rows={3}
                      placeholder="Search catalog or type description..."
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`item-${index}-description`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`item-${index}-description`] && <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-description`]}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                      <input
                        id="quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Price</label>
                      <input
                        id="unitPrice"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount (%)</label>
                      <input
                        id="discount"
                        type="number"
                        value={item.discount || 0}
                        onChange={(e) => handleItemChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                        step="0.1"
                      />
                    </div>
                    <div className="flex flex-col justify-end text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Line Total</span>
                      <span className="text-lg font-black text-gray-900">
                        ${((item.quantity * item.unitPrice) * (1 - (item.discount || 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addItem} className="w-full py-4 border-dashed border-2 hover:bg-blue-50 border-blue-200 text-blue-600">
              + Add Another Line Item
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Public Notes / Terms</label>
          <textarea
            id="notes"
            value={invoice.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Payment instructions, bank details, or thank you message..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input
            id="isPaid"
            type="checkbox"
            checked={invoice.isPaid}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="isPaid" className="ml-3 block text-sm font-bold text-blue-900 cursor-pointer">Mark as Paid (Finalized)</label>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;