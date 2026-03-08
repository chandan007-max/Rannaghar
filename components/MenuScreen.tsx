
import React, { useState, useMemo } from 'react';
import { useMenu } from '../context/MenuContext';
import MenuItemCard from './MenuItemCard';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, X, ChevronRight } from 'lucide-react';
import MenuItemDetailModal from './MenuItemDetailModal';
import type { MenuItem, Category } from '../types';

interface MenuScreenProps {
  onOrderSuccess: (orderId: string) => void;
  initialCategoryId?: string | null;
  onViewCart?: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onOrderSuccess, initialCategoryId, onViewCart }) => {
  const { menu, categories, subcategories } = useMenu();
  const { cartCount } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialCategoryId || null);
  
  // Filter active categories first
  const activeCategories = useMemo(() => 
    categories.filter(c => c.isActive).sort((a,b) => a.displayOrder - b.displayOrder), 
  [categories]);
  
  const availableMenu = useMemo(() => menu.filter(item => {
    const cat = categories.find(c => c.id === item.categoryId);
    const subcat = subcategories.find(s => s.id === item.subcategoryId);
    
    // Check if the item, its category, and its subcategory (if any) are all active
    const isCatActive = cat?.isActive ?? true;
    const isSubcatActive = subcat?.isActive ?? true;
    
    return item.isAvailable && isCatActive && isSubcatActive;
  }), [menu, categories, subcategories]);

  const filteredMenu = useMemo(() => {
    let result = availableMenu;
    if (activeCategoryId) {
      result = result.filter(item => item.categoryId === activeCategoryId);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    return result;
  }, [searchTerm, availableMenu, activeCategoryId]);

  const groupedMenu = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    activeCategories.forEach(cat => {
        if (activeCategoryId && cat.id !== activeCategoryId) return;
        const items = filteredMenu.filter(m => m.categoryId === cat.id);
        if (items.length > 0) groups[cat.id] = items;
    });
    return groups;
  }, [filteredMenu, activeCategories, activeCategoryId]);

  return (
    <div className="bg-white min-h-full pb-40 animate-fade-in">
      {/* Header / Search */}
      <div className="bg-white px-6 pt-8 pb-4 sticky top-0 z-30 border-b border-maroon-50">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-black text-maroon-900 tracking-tighter">
            {activeCategoryId ? categories.find(c => c.id === activeCategoryId)?.name : 'Full Menu'}
          </h2>
          {activeCategoryId && (
            <button 
              onClick={() => setActiveCategoryId(null)}
              className="text-[10px] font-black text-maroon-400 uppercase tracking-widest bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-maroon-300 group-focus-within:text-maroon-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-maroon-50 border border-maroon-100 rounded-[20px] font-bold text-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-500/10 focus:border-maroon-500 transition-all outline-none"
          />
           {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-400 hover:text-maroon-600">
                <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      {!activeCategoryId && (
        <div className="flex overflow-x-auto no-scrollbar gap-3 px-6 py-6 border-b border-maroon-50">
          {activeCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className="shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-maroon-50 text-maroon-600 border border-maroon-100 hover:bg-maroon-600 hover:text-white transition-all"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-8">
        {Object.keys(groupedMenu).length > 0 ? (
          activeCategories.filter(cat => groupedMenu[cat.id]).map(cat => (
            <div key={cat.id} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-mustard-500 rounded-full"></div>
                  <h2 className="text-2xl font-black text-maroon-900 tracking-tighter">{cat.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedMenu[cat.id].map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onViewDetails={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="bg-maroon-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-maroon-200" />
            </div>
            <p className="text-lg font-black text-maroon-900 tracking-tighter">No dishes found</p>
            <p className="text-sm font-bold text-maroon-400 mt-2">Try searching for something else</p>
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-24 left-6 right-6 z-40 animate-slide-up">
          <button
            onClick={onViewCart}
            className="w-full flex items-center justify-between bg-maroon-700 text-white rounded-[24px] shadow-2xl shadow-maroon-900/20 hover:bg-maroon-800 transition-all active:scale-95 px-8 py-5"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">View Cart</p>
                <p className="text-sm font-black">{cartCount} Items Selected</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      <MenuItemDetailModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .text-maroon-900 { color: #450a0a; }
        .text-maroon-600 { color: #991b1b; }
        .text-maroon-400 { color: #f87171; }
        .text-maroon-300 { color: #fca5a5; }
        .bg-maroon-800 { background-color: #991b1b; }
        .bg-maroon-700 { background-color: #7f1d1d; }
        .bg-maroon-100 { background-color: #fee2e2; }
        .bg-maroon-50 { background-color: #fef2f2; }
        .bg-mustard-500 { background-color: #eab308; }
        .border-maroon-100 { border-color: #fee2e2; }
        .border-maroon-50 { border-color: #fef2f2; }
        .focus\\:ring-maroon-500\\/10 { --tw-ring-color: rgba(239, 68, 68, 0.1); }
        .focus\\:border-maroon-500 { border-color: #ef4444; }
      `}</style>
    </div>
  );
};

export default MenuScreen;
