import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { isDuplicateProduct } from '../services/productService';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'> | Product) => void;
  editingProduct?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, editingProduct }) => {
  const [product, setProduct] = useState<Omit<Product, 'id'> | Product>({
    name: '',
    category: '',
    subCategories: [],
    description: '',
    defaultPrice: 0,
    defaultDiscount: 0,
    image: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<Product | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setProduct(editingProduct);
    } else {
      setProduct({ 
        name: '', 
        category: '', 
        subCategories: [], 
        description: '', 
        defaultPrice: 0, 
        defaultDiscount: 0,
        image: undefined,
      });
    }
    setErrors({});
    setDuplicateWarning(null);
  }, [editingProduct, isOpen]);

  // Check for duplicates as the user types name/category
  useEffect(() => {
    if (product.name.trim() && product.category.trim()) {
      const duplicate = isDuplicateProduct(product.name, product.category, (product as Product).id);
      setDuplicateWarning(duplicate);
    } else {
      setDuplicateWarning(null);
    }
  }, [product.name, product.category, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const val = id === 'defaultPrice' || id === 'defaultDiscount' ? parseFloat(value) || 0 : value;
    setProduct(prev => ({ ...prev, [id]: val }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProduct(prev => ({ ...prev, image: undefined }));
  };

  const handleSubCategoryChange = (index: number, value: string) => {
    const newSubs = [...product.subCategories];
    newSubs[index] = value;
    setProduct(prev => ({ ...prev, subCategories: newSubs }));
  };

  const addSubCategory = () => {
    setProduct(prev => ({ ...prev, subCategories: [...prev.subCategories, ''] }));
  };

  const removeSubCategory = (index: number) => {
    setProduct(prev => ({ 
      ...prev, 
      subCategories: prev.subCategories.filter((_, i) => i !== index) 
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!product.name.trim()) newErrors.name = 'Product name is required.';
    if (!product.category.trim()) newErrors.category = 'Category is required.';
    if (product.defaultPrice < 0) newErrors.defaultPrice = 'Price cannot be negative.';
    
    // Hard block on duplicates if adding new
    const duplicate = isDuplicateProduct(product.name, product.category, (product as Product).id);
    if (duplicate) {
      newErrors.name = 'A product with this name already exists in this category.';
    }
    
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const cleanedProduct = {
      ...product,
      subCategories: product.subCategories.filter(s => s.trim() !== '')
    };
    onSubmit(cleanedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!!duplicateWarning && !editingProduct}>
            {editingProduct ? 'Save Changes' : 'Add to Catalog'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {duplicateWarning && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900 leading-tight">Duplicate Detected</p>
              <p className="text-xs text-amber-700 mt-1">"{product.name}" is already registered in "{product.category}".</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
           <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${product.image ? 'border-blue-100' : 'border-gray-200 bg-gray-50'}`}>
              {product.image ? (
                <img src={product.image} alt="Product Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-300 flex flex-col items-center text-center p-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[8px] font-black uppercase mt-1 tracking-widest leading-tight">Upload Product Image</span>
                </div>
              )}
           </div>
           <div className="flex gap-2">
             <label className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
               {product.image ? 'Replace Photo' : 'Add Photo'}
               <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
             </label>
             {product.image && (
               <button type="button" onClick={removeImage} className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                 Remove
               </button>
             )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="name"
            label="Product Name"
            value={product.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Consulting"
            required
            className={duplicateWarning ? 'border-amber-400 focus:ring-amber-500' : ''}
          />
          <Input
            id="category"
            label="Category"
            value={product.category}
            onChange={handleChange}
            error={errors.category}
            placeholder="e.g., Services"
            required
            className={duplicateWarning ? 'border-amber-400 focus:ring-amber-500' : ''}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider text-[11px]">Sub-Categories (Optional)</label>
            <Button type="button" variant="outline" size="sm" onClick={addSubCategory} className="text-[10px] py-1 px-2 border-blue-200 text-blue-600">
              + Add Sub
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.subCategories.map((sub, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 pl-3 rounded-lg">
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                  placeholder="Sub-label"
                  className="bg-transparent border-none text-xs focus:ring-0 w-24 p-0"
                />
                <button 
                  type="button" 
                  onClick={() => removeSubCategory(index)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
          <textarea
            id="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            placeholder="Helpful details for your invoice..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="defaultPrice"
            label="Unit Price"
            type="number"
            value={product.defaultPrice}
            onChange={handleChange}
            error={errors.defaultPrice}
            step="0.01"
            required
          />
          <Input
            id="defaultDiscount"
            label="Default Discount (%)"
            type="number"
            value={product.defaultDiscount}
            onChange={handleChange}
            step="0.1"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;