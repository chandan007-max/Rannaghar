
import React, { useState, useMemo } from 'react';
import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { PlusCircle, Share2, Check, Ban, Sparkles } from 'lucide-react';
import StarRating from './StarRating';
import { RESTAURANT_NAME } from '../constants';

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onViewDetails }) => {
  const { addToCart } = useCart();
  const [isCopied, setIsCopied] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;
    addToCart(item);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `${item.name} - ${RESTAURANT_NAME}`,
      text: `Check out this delicious ${item.name} at Rannaghar! ${item.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} Order here: ${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const averageRating = useMemo(() => 
    item.reviews.length > 0
      ? item.reviews.reduce((acc, review) => acc + review.rating, 0) / item.reviews.length
      : 0, 
  [item.reviews]);

  const startingPrice = useMemo(() => {
    if (item.variants && item.variants.length > 0) {
        return Math.min(...item.variants.map(v => v.price + item.basePrice));
    }
    return item.basePrice;
  }, [item.variants, item.basePrice]);

  return (
    <div 
      onClick={item.isAvailable ? onViewDetails : undefined} 
      className={`bg-white rounded-[32px] shadow-xl shadow-maroon-100/20 overflow-hidden flex flex-col relative group ${item.isAvailable ? 'transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border border-transparent hover:border-maroon-100' : 'opacity-60 grayscale'}`}
    >
      {!item.isAvailable && (
        <div className="absolute inset-0 bg-maroon-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-white text-maroon-900 font-black py-3 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-2xl">Sold Out</span>
        </div>
      )}
      <div className="relative h-56 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-4 left-4">
             <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${item.foodType === 'Veg' ? 'bg-green-600/90 text-white' : 'bg-maroon-600/90 text-white'}`}>
                {item.foodType}
             </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2">
            <h3 className="text-xl font-black text-maroon-900 leading-tight group-hover:text-maroon-600 transition-colors">{item.name}</h3>
            {item.reviews.length > 5 && <Sparkles size={16} className="text-mustard-400 shrink-0" />}
        </div>
        <p className="text-maroon-400 mt-2 text-xs font-medium line-clamp-2 leading-relaxed flex-grow">{item.description}</p>
        
        <div className="flex items-center space-x-2 mt-4 min-h-[24px]">
          {averageRating > 0 ? (
            <>
              <StarRating rating={averageRating} size={14} />
              <span className="text-[10px] font-bold text-maroon-300 uppercase tracking-widest">({item.reviews.length} Feedbacks)</span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-maroon-200 uppercase tracking-widest">Fresh Arrival</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-maroon-300 uppercase tracking-widest leading-none mb-1">Starting from</span>
            <span className="text-2xl font-black text-maroon-900 tracking-tight">₹{startingPrice}</span>
          </div>
          <div className="flex items-center gap-3 z-10">
            <button
                onClick={handleShare}
                className={`p-3 rounded-2xl transition-all duration-300 ${isCopied ? 'bg-green-600 text-white shadow-green-100' : 'bg-maroon-50 text-maroon-400 hover:bg-maroon-100 hover:text-maroon-600'}`}
                aria-label="Share menu item"
            >
                {isCopied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex items-center justify-center font-black py-4 px-8 rounded-2xl transition-all shadow-xl active:scale-95 ${
                item.isAvailable 
                ? 'text-white bg-mustard-500 hover:bg-mustard-600 shadow-mustard-500/20' 
                : 'text-maroon-300 bg-maroon-50 cursor-not-allowed shadow-none'
              }`}
            >
              {item.isAvailable ? <PlusCircle className="h-5 w-5 mr-2" /> : <Ban className="h-5 w-5 mr-2" />}
              <span className="text-xs uppercase tracking-widest">{item.isAvailable ? 'Add' : 'Empty'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
