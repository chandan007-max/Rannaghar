
import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { X, Plus, Save, Image as ImageIcon, Tag, Hash, ShieldCheck, Trash2, Layers, Boxes } from 'lucide-react';
import type { MenuItem, ItemVariant } from '../types';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({ isOpen, onClose }) => {
  const { categories, subcategories, addMenuItem } = useMenu();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    image: '',
    categoryId: categories[0]?.id || '',
    subcategoryId: '',
    foodType: 'Veg' as 'Veg' | 'Non-Veg' | 'Egg',
    isAvailable: true
  });

  const [variants, setVariants] = useState<Omit<ItemVariant, 'id'>[]>([
    { name: 'Standard', price: 0, isAvailable: true, stock: 50 }
  ]);

  const filteredSubcategories = subcategories.filter(s => s.categoryId === formData.categoryId);

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', price: 0, isAvailable: true, stock: 10 }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof Omit<ItemVariant, 'id'>, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (variants.some(v => !v.name.trim())) {
      alert("Please provide a name for all variants.");
      return;
    }

    const processedVariants: ItemVariant[] = variants.map((v, idx) => ({
      ...v,
      id: `v-${Date.now()}-${idx}`
    }));

    // If variants exist, we treat basePrice as the lowest variant price for sorting/display
    const minPrice = Math.min(...processedVariants.map(v => v.price));

    addMenuItem({
      ...formData,
      basePrice: minPrice, // Use lowest variant price as reference
      variants: processedVariants,
      stock: processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
    });
    
    alert('Menu item added successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
        <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Dish</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Menu Expansion Protocol</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <X size={20}/>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-10 space-y-10 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12}/> Dish Identity
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g., Dum Biryani"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={12}/> Visual Asset URL
              </label>
              <input 
                required
                type="url" 
                placeholder="https://..."
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Culinary Story</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe the flavors, ingredients, and preparation style..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Variants Management Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={12}/> Item Variants (Portions/Sizes)
              </label>
              <button 
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
              >
                <Plus size={14}/> Add Variant
              </button>
            </div>
            
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4 animate-slide-in">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Variant #{index + 1}</span>
                    {variants.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase ml-1">Size/Name</p>
                      <input 
                        type="text" 
                        placeholder="Half / Full / Large"
                        value={variant.name}
                        onChange={e => handleVariantChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase ml-1">Price (₹)</p>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={variant.price || ''}
                        onChange={e => handleVariantChange(index, 'price', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase ml-1">Initial Stock</p>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={variant.stock || ''}
                        onChange={e => handleVariantChange(index, 'stock', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Category</label>
              <select 
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value, subcategoryId: ''})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dietary Classification</label>
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {['Veg', 'Non-Veg', 'Egg'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, foodType: type as any})}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.foodType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100">
            <div className={`w-3 h-3 rounded-full ${formData.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.isAvailable} 
                onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                className="hidden"
              />
              {formData.isAvailable ? 'Live on Menu' : 'Set as Hidden'}
            </label>
          </div>
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="flex-grow py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <ShieldCheck size={20}/> Commit to Inventory
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AddMenuItemModal;
