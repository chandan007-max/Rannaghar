
import React, { useState } from 'react';
import { Search, MapPin, ChevronRight, Star, Clock, Flame, Utensils, Coffee, Pizza, Soup, IceCream } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import type { MenuItem, Category } from '../types';
import MenuItemCard from './MenuItemCard';
import MenuItemDetailModal from './MenuItemDetailModal';

interface HomeScreenProps {
  onCategoryClick: (categoryId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onCategoryClick }) => {
  const { menu, categories } = useMenu();
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const popularDishes = menu.filter(m => m.rating && m.rating >= 4.5).slice(0, 5);
  const todaysSpecials = menu.filter(m => m.isAvailable).slice(5, 10);
  const recommended = menu.filter(m => m.isAvailable).sort(() => 0.5 - Math.random()).slice(0, 6);

  const categoryIcons: Record<string, React.ReactNode> = {
    'Bengali': <Utensils className="text-maroon-600" />,
    'North Indian': <Flame className="text-orange-600" />,
    'Chinese': <Soup className="text-red-600" />,
    'Tandoor': <Flame className="text-amber-600" />,
    'Combo Meals': <Pizza className="text-mustard-600" />,
    'Beverages': <Coffee className="text-blue-600" />,
    'Desserts': <IceCream className="text-pink-600" />,
  };

  return (
    <div className="bg-white min-h-full pb-32 animate-fade-in">
      {/* Top Section: Location & Search */}
      <div className="px-6 pt-6 pb-4 sticky top-0 bg-white z-40 shadow-sm border-b border-maroon-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-maroon-100 p-2 rounded-full">
              <MapPin size={18} className="text-maroon-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-maroon-400 uppercase tracking-widest">Deliver to</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-black text-maroon-900 truncate max-w-[150px]">
                  {user?.addresses.find(a => a.id === user.primaryAddressId)?.label || 'Select Address'}
                </p>
                <ChevronRight size={14} className="text-maroon-400" />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-mustard-100 flex items-center justify-center border-2 border-mustard-200">
            <span className="text-mustard-700 font-black text-xs">{user?.name?.charAt(0) || 'U'}</span>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-300 group-focus-within:text-maroon-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search for Bengali delicacies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-maroon-50 border border-maroon-100 rounded-[24px] font-bold text-maroon-900 focus:bg-white focus:ring-4 focus:ring-maroon-500/10 focus:border-maroon-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* Offer Banner Slider (Mock) */}
      <div className="px-6 mt-6">
        <div className="w-full h-44 bg-gradient-to-br from-maroon-700 to-maroon-900 rounded-[32px] p-6 relative overflow-hidden shadow-xl shadow-maroon-100">
          <div className="relative z-10">
            <p className="text-mustard-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Limited Time Offer</p>
            <h3 className="text-white text-2xl font-black leading-tight mb-4">Get 50% OFF on<br/>Traditional Thalis</h3>
            <button className="bg-mustard-500 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-mustard-900/20 active:scale-95 transition-all">
              Order Now
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
             <Utensils size={120} className="text-white" />
          </div>
        </div>
      </div>

      {/* Food Categories */}
      <div className="mt-10">
        <div className="px-6 flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-maroon-900 tracking-tighter">Explore Categories</h3>
          <button className="text-maroon-600 font-black text-[10px] uppercase tracking-widest">View All</button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 pb-4">
          {categories.filter(c => c.isActive).map(cat => (
            <button 
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="flex flex-col items-center gap-3 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-[24px] bg-maroon-50 border border-maroon-100 flex items-center justify-center group-hover:bg-maroon-600 group-hover:border-maroon-600 transition-all duration-300 shadow-sm">
                {categoryIcons[cat.name] || <Utensils className="text-maroon-600 group-hover:text-white" />}
              </div>
              <p className="text-[10px] font-black text-maroon-900 uppercase tracking-tighter group-hover:text-maroon-600 transition-colors">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Dishes */}
      <div className="mt-10">
        <div className="px-6 flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-maroon-900 tracking-tighter">Popular Dishes</h3>
          <div className="flex items-center gap-1 text-mustard-600">
            <Star size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest">Top Rated</span>
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 pb-4">
          {popularDishes.map(item => (
            <div key={item.id} className="w-48 shrink-0">
               <MenuItemCard item={item} onViewDetails={() => setSelectedItem(item)} />
            </div>
          ))}
        </div>
      </div>

      {/* Today's Special */}
      <div className="mt-10 px-6">
        <div className="bg-mustard-50 border border-mustard-100 rounded-[40px] p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-mustard-500 p-1.5 rounded-full">
                <Clock size={14} className="text-white" />
              </div>
              <p className="text-mustard-700 font-black text-[10px] uppercase tracking-widest">Today's Special</p>
            </div>
            <h3 className="text-maroon-900 text-2xl font-black tracking-tighter mb-6">Chef's Recommended<br/>Bengali Platter</h3>
            <div className="grid grid-cols-2 gap-4">
              {todaysSpecials.slice(0, 2).map(item => (
                <div key={item.id} className="bg-white p-3 rounded-3xl shadow-sm border border-mustard-100">
                   <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded-2xl mb-2" />
                   <p className="text-[10px] font-black text-maroon-900 truncate">{item.name}</p>
                   <p className="text-[10px] font-bold text-maroon-400">₹{item.basePrice}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-mustard-200/30 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="mt-10 px-6">
        <h3 className="text-xl font-black text-maroon-900 tracking-tighter mb-6">Recommended for You</h3>
        <div className="grid grid-cols-1 gap-6">
          {recommended.map(item => (
            <MenuItemCard key={item.id} item={item} onViewDetails={() => setSelectedItem(item)} />
          ))}
        </div>
      </div>

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
        .bg-maroon-600 { background-color: #991b1b; }
        .bg-maroon-100 { background-color: #fee2e2; }
        .bg-maroon-50 { background-color: #fef2f2; }
        .bg-mustard-500 { background-color: #eab308; }
        .bg-mustard-100 { background-color: #fef9c3; }
        .bg-mustard-50 { background-color: #fffbeb; }
        .text-mustard-700 { color: #a16207; }
        .text-mustard-600 { color: #ca8a04; }
        .text-mustard-400 { color: #facc15; }
        .border-maroon-100 { border-color: #fee2e2; }
        .border-maroon-50 { border-color: #fef2f2; }
        .border-mustard-200 { border-color: #fef08a; }
        .border-mustard-100 { border-color: #fef9c3; }
        .shadow-maroon-100 { --tw-shadow-color: #fee2e2; --tw-shadow: var(--tw-shadow-colored); }
      `}</style>
    </div>
  );
};

export default HomeScreen;
