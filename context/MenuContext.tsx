
import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { MenuItem, Review, Category, Subcategory } from '../types';
import { INITIAL_MENU, INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES } from '../constants';

interface MenuContextType {
  menu: MenuItem[];
  categories: Category[];
  subcategories: Subcategory[];
  
  addMenuItem: (item: Omit<MenuItem, 'id' | 'reviews'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: number) => void;
  toggleItemAvailability: (itemId: number) => void;
  deductStock: (itemId: number, quantity: number, variantId?: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryAvailability: (id: string) => void;
  
  addSubcategory: (sub: Omit<Subcategory, 'id'>) => void;
  updateSubcategory: (sub: Subcategory) => void;
  deleteSubcategory: (id: string) => void;
  toggleSubcategoryAvailability: (id: string) => void;
  
  addReview: (itemId: number, review: Omit<Review, 'date'>) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useLocalStorage<MenuItem[]>('rannaghar_menu', INITIAL_MENU);
  const [categories, setCategories] = useLocalStorage<Category[]>('rannaghar_categories', INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useLocalStorage<Subcategory[]>('rannaghar_subcategories', INITIAL_SUBCATEGORIES);

  const deductStock = useCallback((itemId: number, quantity: number, variantId?: string) => {
    setMenu(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      if (variantId) {
        const updatedVariants = item.variants.map(v => {
          if (v.id === variantId) {
            const currentStock = v.stock ?? 999;
            return { ...v, stock: Math.max(0, currentStock - quantity) };
          }
          return v;
        });
        return { ...item, variants: updatedVariants };
      } else {
        const currentStock = item.stock ?? 999;
        return { ...item, stock: Math.max(0, currentStock - quantity) };
      }
    }));
  }, [setMenu]);

  // Items
  const addMenuItem = (itemData: Omit<MenuItem, 'id' | 'reviews'>) => {
    const newItem: MenuItem = { ...itemData, id: Date.now(), reviews: [] };
    setMenu(prev => [...prev, newItem]);
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteMenuItem = (itemId: number) => {
    setMenu(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleItemAvailability = (itemId: number) => {
    setMenu(prev => prev.map(item => item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: `cat-${Date.now()}` }]);
  };
  const updateCategory = (updated: Category) => {
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
  };
  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setMenu(prev => prev.filter(m => m.categoryId !== id));
  };
  const toggleCategoryAvailability = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  // Subcategories
  const addSubcategory = (sub: Omit<Subcategory, 'id'>) => {
    setSubcategories(prev => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
  };
  const updateSubcategory = (updated: Subcategory) => {
    setSubcategories(prev => prev.map(s => s.id === updated.id ? updated : s));
  };
  const deleteSubcategory = (id: string) => {
    setSubcategories(prev => prev.filter(s => s.id !== id));
  };
  const toggleSubcategoryAvailability = (id: string) => {
    setSubcategories(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const addReview = (itemId: number, reviewData: Omit<Review, 'date'>) => {
    const newReview: Review = { ...reviewData, date: new Date().toISOString() };
    setMenu(prev => prev.map(item => item.id === itemId ? { ...item, reviews: [newReview, ...item.reviews] } : item));
  };

  return (
    <MenuContext.Provider value={{ 
        menu, categories, subcategories,
        addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability, deductStock,
        addCategory, updateCategory, deleteCategory, toggleCategoryAvailability,
        addSubcategory, updateSubcategory, deleteSubcategory, toggleSubcategoryAvailability,
        addReview 
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
