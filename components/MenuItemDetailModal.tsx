
import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { X, PlusCircle, MinusCircle, Star, Clock, Utensils, ChevronRight, Heart, Share2 } from 'lucide-react';

interface MenuItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({ item, onClose }) => {
  const { addToCartAdvanced } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // Reset local state when item changes
  useEffect(() => {
    if (item) {
        setSelectedVariantId(item.variants?.[0]?.id || '');
        setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const currentVariant = item.variants?.find(v => v.id === selectedVariantId);
  const basePrice = item.basePrice || 0;
  const variantPrice = currentVariant?.price || 0;
  const unitPrice = basePrice + variantPrice;
  const totalItemPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCartAdvanced(item, selectedVariantId, []);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-maroon-950/80 backdrop-blur-xl z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 transition-all duration-500" onClick={onClose}>
      <div 
        className="bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl w-full max-w-xl h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col transform transition-all duration-500 animate-sheet-up overflow-hidden border-t border-maroon-100/20" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image Section */}
        <div className="relative h-[40vh] sm:h-80 shrink-0 group">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>

          {/* Top Actions */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <button 
              onClick={onClose} 
              className="bg-white/20 backdrop-blur-xl rounded-2xl p-3 text-white hover:bg-white/40 transition-all shadow-2xl border border-white/30 active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`bg-white/20 backdrop-blur-xl rounded-2xl p-3 transition-all shadow-2xl border border-white/30 active:scale-90 ${isLiked ? 'text-rose-500' : 'text-white'}`}
              >
                <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="bg-white/20 backdrop-blur-xl rounded-2xl p-3 text-white hover:bg-white/40 transition-all shadow-2xl border border-white/30 active:scale-90">
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-4">
             <div className="flex items-center gap-3 mb-3">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${item.foodType === 'Veg' ? 'bg-green-600 text-white' : 'bg-maroon-700 text-white'}`}>
                  {item.foodType}
                </span>
                {item.rating && (
                  <div className="flex items-center gap-1.5 bg-white px-4 py-1.5 rounded-full text-maroon-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-maroon-50">
                    <Star size={12} fill="currentColor" className="text-mustard-500" />
                    {item.rating}
                  </div>
                )}
             </div>
             <h2 className="text-4xl font-black text-maroon-950 tracking-tighter leading-none drop-shadow-sm">{item.name}</h2>
          </div>
        </div>
        
        <main className="flex-grow overflow-y-auto px-8 pb-40 space-y-10 no-scrollbar bg-white">
          {/* Description Section */}
          <section className="pt-2">
            <p className="text-maroon-500 text-base leading-relaxed font-medium opacity-80">
              {item.description || "Indulge in the rich, authentic flavors of Bengal. This dish is prepared using traditional recipes and the finest local ingredients."}
            </p>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-maroon-50/40 p-5 rounded-[32px] border border-maroon-100/50 flex items-center gap-4 group hover:bg-maroon-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-maroon-600 shadow-sm shrink-0 border border-maroon-50">
                   <Clock size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-maroon-300 uppercase tracking-widest mb-0.5">Prep Time</p>
                   <p className="text-sm font-black text-maroon-900">15-20 Mins</p>
                </div>
             </div>
             <div className="bg-maroon-50/40 p-5 rounded-[32px] border border-maroon-100/50 flex items-center gap-4 group hover:bg-maroon-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-maroon-600 shadow-sm shrink-0 border border-maroon-50">
                   <Utensils size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-maroon-300 uppercase tracking-widest mb-0.5">Portion</p>
                   <p className="text-sm font-black text-maroon-900">Serves 1-2</p>
                </div>
             </div>
          </div>

          {/* Variant Selection Section */}
          {item.variants && item.variants.length > 0 && (
            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-maroon-950 uppercase tracking-[0.2em]">Select Variation</h3>
                  <span className="text-[9px] font-black text-mustard-600 bg-mustard-50 px-3 py-1 rounded-full uppercase tracking-widest border border-mustard-100">Required</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {item.variants.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => setSelectedVariantId(v.id)} 
                          className={`flex items-center justify-between p-6 rounded-[32px] border-2 transition-all duration-500 group ${selectedVariantId === v.id ? 'border-maroon-600 bg-maroon-50/50 shadow-xl shadow-maroon-100/30' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}
                        >
                            <div className="flex items-center gap-5">
                               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedVariantId === v.id ? 'border-maroon-600 bg-maroon-600' : 'border-maroon-200 bg-white'}`}>
                                  {selectedVariantId === v.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                               </div>
                               <div className="text-left">
                                  <span className={`font-black uppercase text-xs tracking-widest block mb-0.5 transition-colors ${selectedVariantId === v.id ? 'text-maroon-900' : 'text-maroon-400'}`}>{v.name}</span>
                                  <span className="text-[10px] font-bold text-maroon-300 uppercase tracking-widest">Standard Portion</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className={`text-xl font-black transition-colors ${selectedVariantId === v.id ? 'text-maroon-900' : 'text-maroon-400'}`}>₹{v.price + basePrice}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
          )}

          {/* Quantity Selection Section */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-maroon-950 uppercase tracking-[0.2em]">Quantity</h3>
                <span className="text-[10px] font-bold text-maroon-300 uppercase tracking-widest">Max 10 items</span>
             </div>
             <div className="flex items-center justify-between bg-maroon-50/50 p-2.5 rounded-[32px] border border-maroon-100 w-full max-w-[240px] shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-maroon-400 hover:text-maroon-600 transition-all shadow-md active:scale-90 border border-maroon-50"
                >
                   <MinusCircle size={28} />
                </button>
                <div className="flex flex-col items-center">
                   <span className="text-3xl font-black text-maroon-950 tracking-tighter leading-none">{quantity}</span>
                   <span className="text-[8px] font-black text-maroon-300 uppercase tracking-widest mt-1">Units</span>
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))} 
                  className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-maroon-600 hover:text-maroon-700 transition-all shadow-md active:scale-90 border border-maroon-50"
                >
                   <PlusCircle size={28} />
                </button>
             </div>
          </section>
        </main>
        
        {/* Fixed Bottom Action Bar */}
        <footer className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-2xl border-t border-maroon-100/50 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] flex items-center justify-between gap-8 z-30">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-maroon-300 uppercase tracking-[0.2em] mb-1">Grand Total</span>
            <div className="flex items-baseline gap-1">
               <span className="text-sm font-black text-maroon-900">₹</span>
               <span className="text-4xl font-black text-maroon-900 tracking-tighter">{totalItemPrice.toFixed(0)}</span>
            </div>
          </div>
          <button 
            onClick={handleAddToCart} 
            className="flex-grow py-6 bg-mustard-500 text-white font-black rounded-[32px] shadow-2xl shadow-mustard-500/40 flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-mustard-600 group"
          >
            <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
               <PlusCircle className="h-6 w-6" /> 
            </div>
            <span className="text-base uppercase tracking-[0.1em]">Add to Cart</span>
            <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
          </button>
        </footer>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes sheetUp { 
          from { transform: translateY(100%); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-sheet-up { animation: sheetUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .text-maroon-950 { color: #2d0606; }
        .text-maroon-900 { color: #450a0a; }
        .text-maroon-700 { color: #7f1d1d; }
        .text-maroon-600 { color: #991b1b; }
        .text-maroon-500 { color: #b91c1c; }
        .text-maroon-400 { color: #f87171; }
        .text-maroon-300 { color: #fca5a5; }
        .bg-maroon-950 { background-color: #2d0606; }
        .bg-maroon-50 { background-color: #fef2f2; }
        .bg-mustard-500 { background-color: #eab308; }
        .bg-mustard-600 { background-color: #ca8a04; }
        .bg-mustard-50 { background-color: #fffbeb; }
        .border-maroon-600 { border-color: #991b1b; }
        .border-maroon-100 { border-color: #fee2e2; }
        .border-maroon-50 { border-color: #fef2f2; }
        .border-mustard-100 { border-color: #fef9c3; }
        .text-mustard-600 { color: #ca8a04; }
        .text-mustard-500 { color: #eab308; }
      `}</style>
    </div>
  );
};

export default MenuItemDetailModal;
