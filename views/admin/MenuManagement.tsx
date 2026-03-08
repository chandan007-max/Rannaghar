import React, { useState } from 'react';
import { 
  UtensilsCrossed, Plus, Edit2, Trash2, 
  CheckCircle2, XCircle, Search, Filter,
  Layers, Package, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { useMenu } from '../../context/MenuContext';
import type { Category, MenuItem, ItemVariant } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const MenuManagement: React.FC = () => {
    const { 
        menu, categories, 
        addCategory, updateCategory, deleteCategory, toggleCategoryAvailability,
        addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability 
    } = useMenu();

    const [view, setView] = useState<'categories' | 'items'>('categories');
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form States
    const [catForm, setCatForm] = useState({ name: '', description: '', displayOrder: 0 });
    const [itemForm, setItemForm] = useState({
        name: '', description: '', basePrice: 0, packagingCharge: 0, categoryId: '', foodType: 'Veg' as 'Veg' | 'Non-Veg' | 'Egg', image: '', isAvailable: true
    });

    const handleSaveCategory = () => {
        if (!catForm.name) return alert('Name is required');
        
        if (editingCategory) {
            updateCategory({ ...editingCategory, ...catForm });
        } else {
            addCategory({ ...catForm, isActive: true });
        }
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCatForm({ name: '', description: '', displayOrder: 0 });
    };

    const handleSaveItem = () => {
        if (!itemForm.name || !itemForm.categoryId || itemForm.basePrice <= 0) {
            return alert('Please fill all required fields');
        }

        if (editingItem) {
            updateMenuItem({ ...editingItem, ...itemForm });
        } else {
            addMenuItem({ 
                ...itemForm, 
                variants: [], 
                reviews: [],
                image: itemForm.image || 'https://picsum.photos/seed/food/400/300'
            });
        }
        setIsItemModalOpen(false);
        setEditingItem(null);
        setItemForm({ name: '', description: '', basePrice: 0, packagingCharge: 0, categoryId: '', foodType: 'Veg', image: '', isAvailable: true });
    };

    const openEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCatForm({ name: cat.name, description: cat.description || '', displayOrder: cat.displayOrder });
        setIsCategoryModalOpen(true);
    };

    const openEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setItemForm({ 
            name: item.name, 
            description: item.description, 
            basePrice: item.basePrice, 
            packagingCharge: item.packagingCharge || 0,
            categoryId: item.categoryId, 
            foodType: item.foodType,
            image: item.image,
            isAvailable: item.isAvailable
        });
        setIsItemModalOpen(true);
    };

    const filteredItems = menu.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = !selectedCatId || item.categoryId === selectedCatId;
        return matchesSearch && matchesCat;
    });

    const selectedCategoryName = categories.find(c => c.id === selectedCatId)?.name || 'All Items';

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="p-6 pt-12 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            {view === 'categories' ? 'Menu' : selectedCategoryName}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {view === 'categories' ? 'Manage Categories' : `${filteredItems.length} Items Available`}
                        </p>
                    </div>
                    {view === 'items' && (
                        <button 
                            onClick={() => { setView('categories'); setSelectedCatId(null); }}
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Back
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search items or categories..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[24px] text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                    />
                </div>
            </header>

            {/* Categories Grid */}
            {view === 'categories' && (
                <div className="px-6 grid grid-cols-2 gap-4">
                    {categories.sort((a,b) => a.displayOrder - b.displayOrder).map(cat => (
                        <motion.div 
                            key={cat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSelectedCatId(cat.id); setView('items'); }}
                            className="bg-slate-50 p-5 rounded-[32px] flex flex-col items-center text-center space-y-3 relative group"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                <Layers size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-sm leading-tight">{cat.name}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {menu.filter(m => m.categoryId === cat.id).length} Items
                                </p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                                className="absolute top-2 right-2 p-2 text-slate-300 hover:text-indigo-600"
                            >
                                <Edit2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                    
                    {/* Add Category Card */}
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEditingCategory(null); setCatForm({ name: '', description: '', displayOrder: 0 }); setIsCategoryModalOpen(true); }}
                        className="border-2 border-dashed border-slate-200 p-5 rounded-[32px] flex flex-col items-center justify-center text-slate-400 space-y-2"
                    >
                        <Plus size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">New Category</span>
                    </motion.button>
                </div>
            )}

            {/* Items List */}
            {view === 'items' && (
                <div className="px-6 space-y-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex gap-4 items-center">
                            <div className="relative">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-20 h-20 rounded-[24px] object-cover" 
                                    referrerPolicy="no-referrer" 
                                />
                                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    item.foodType === 'Veg' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                                    <button onClick={() => openEditItem(item)} className="p-1 text-slate-300">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm font-black text-indigo-600">₹{item.basePrice}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Pkg: ₹{item.packagingCharge || 0}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${item.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {item.isAvailable ? 'Available' : 'Sold Out'}
                                    </span>
                                    <button 
                                        onClick={() => toggleItemAvailability(item.id)}
                                        className={`w-10 h-6 rounded-full relative transition-all ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.isAvailable ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <UtensilsCrossed size={40} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No items in this category yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Action Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { 
                    setEditingItem(null); 
                    setItemForm({ 
                        name: '', description: '', basePrice: 0, packagingCharge: 0, 
                        categoryId: selectedCatId || categories[0]?.id || '', 
                        foodType: 'Veg', image: '', isAvailable: true 
                    }); 
                    setIsItemModalOpen(true); 
                }}
                className="fixed bottom-28 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center z-40"
            >
                <Plus size={32} />
            </motion.button>

            {/* Item Add/Edit Screen (Full Screen Modal) */}
            <AnimatePresence>
                {isItemModalOpen && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-white flex flex-col"
                    >
                        <div className="p-6 pt-12 flex justify-between items-center border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                {editingItem ? 'Edit Item' : 'New Item'}
                            </h3>
                            <button onClick={() => setIsItemModalOpen(false)} className="p-2 text-slate-400">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Image Upload Placeholder */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Item Image</label>
                                <div 
                                    onClick={() => {
                                        const url = prompt('Enter Image URL:');
                                        if (url) setItemForm({...itemForm, image: url});
                                    }}
                                    className="aspect-video bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative"
                                >
                                    {itemForm.image ? (
                                        <img src={itemForm.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <>
                                            <ImageIcon size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Tap to add image</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Item Name</label>
                                    <input 
                                        type="text" 
                                        value={itemForm.name}
                                        onChange={e => setItemForm({...itemForm, name: e.target.value})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                        placeholder="e.g., Paneer Tikka"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Price (₹)</label>
                                        <input 
                                            type="number" 
                                            value={itemForm.basePrice}
                                            onChange={e => setItemForm({...itemForm, basePrice: Number(e.target.value)})}
                                            className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pkg Charge (₹)</label>
                                        <input 
                                            type="number" 
                                            value={itemForm.packagingCharge}
                                            onChange={e => setItemForm({...itemForm, packagingCharge: Number(e.target.value)})}
                                            className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                    <select 
                                        value={itemForm.categoryId}
                                        onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 appearance-none"
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Food Type</label>
                                    <div className="flex gap-2 mt-1">
                                        {['Veg', 'Non-Veg', 'Egg'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setItemForm({...itemForm, foodType: type as any})}
                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    itemForm.foodType === type 
                                                    ? (type === 'Veg' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : type === 'Non-Veg' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200')
                                                    : 'bg-white text-slate-400 border-slate-100'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                    <textarea 
                                        value={itemForm.description}
                                        onChange={e => setItemForm({...itemForm, description: e.target.value})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 resize-none h-24"
                                        placeholder="Tell customers about this dish..."
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Item Available</span>
                                    <button 
                                        onClick={() => setItemForm({...itemForm, isAvailable: !itemForm.isAvailable})}
                                        className={`w-12 h-7 rounded-full relative transition-all ${itemForm.isAvailable ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${itemForm.isAvailable ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-50">
                            <button 
                                onClick={handleSaveItem}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                            >
                                {editingItem ? 'Update Item' : 'Save Item'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Modal (Simple Overlay) */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl space-y-6"
                        >
                            <div className="text-center">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={catForm.name}
                                        onChange={e => setCatForm({...catForm, name: e.target.value})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Order</label>
                                    <input 
                                        type="number" 
                                        value={catForm.displayOrder}
                                        onChange={e => setCatForm({...catForm, displayOrder: Number(e.target.value)})}
                                        className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveCategory}
                                    className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuManagement;
