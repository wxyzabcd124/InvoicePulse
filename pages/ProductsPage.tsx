import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct, consolidateCatalog } from '../services/productService';
import { getSettings } from '../services/settingsService';
import Button from '../components/ui/Button';
import ProductForm from '../components/ProductForm';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const settings = getSettings();

  const fetchProducts = useCallback(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    
    const uniqueCats = Object.keys(counts).sort();
    return [
      { name: 'All', count: products.length },
      ...uniqueCats.map(cat => ({ name: cat, count: counts[cat] }))
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower) ||
        (p.subCategories && p.subCategories.some(sub => sub.toLowerCase().includes(searchLower))) ||
        (p.description && p.description.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const handleAddProduct = (data: Omit<Product, 'id'>) => {
    const newProduct = addProduct(data);
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (data: Product) => {
    const updated = updateProduct(data);
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Remove this product from your catalog?')) {
      deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleConsolidate = () => {
    const count = consolidateCatalog();
    if (count > 0) {
      alert(`Successfully merged ${count} duplicate products. Your catalog is now clean!`);
      fetchProducts();
    } else {
      alert('No duplicate products found. Your catalog is already consolidated.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Organize your services and physical items.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={handleConsolidate} className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Clean Up
          </Button>
          <Button className="rounded-xl" onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 mb-8">
        <div className="relative group max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search catalog by name, category or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar border-b border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 border-2 whitespace-nowrap ${
                activeCategory === cat.name
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 translate-y-[-2px]'
                  : 'bg-white border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.name}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeCategory === cat.name ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your catalog is empty</h3>
          <p className="text-gray-500 mt-1 max-w-xs mx-auto text-sm">Organized products allow you to create professional invoices in a fraction of the time.</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}>
            Add Your First Product
          </Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-900">No results found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search term or category filters.</p>
          <Button variant="ghost" className="mt-4 text-blue-600" onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}>
            Reset all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                   <button 
                     type="button"
                     onClick={(e) => handleEditClick(e, product)} 
                     className="p-2.5 bg-white/95 backdrop-blur rounded-xl text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                     title="Edit Product"
                   >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleDeleteProduct(e, product.id)} 
                    className="p-2.5 bg-white/95 backdrop-blur rounded-xl text-red-600 shadow-xl hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                    title="Delete Product"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="absolute top-4 left-4 z-10">
                   <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-2 py-1 rounded-lg tracking-widest shadow-lg">{product.category}</span>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                
                {product.subCategories && product.subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.subCategories.map((sub, i) => (
                      <span key={i} className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded border border-gray-100">#{sub}</span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed flex-grow">{product.description || 'No description provided.'}</p>

                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Base Cost</span>
                    <span className="text-2xl font-black text-gray-900">{settings.currency}{product.defaultPrice.toFixed(2)}</span>
                  </div>
                  {product.defaultDiscount ? (
                    <div className="text-right">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Discount %</span>
                       <span className="text-sm font-black text-blue-600">-{product.defaultDiscount}%</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductsPage;