
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { X, Plus, Minus, MapPin, CreditCard, Landmark, ShoppingBag, AlertTriangle, Bike, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';

interface CartScreenProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToMenu?: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ onOrderSuccess, onBackToMenu }) => {
  const { cart, updateQuantity, cartTotal, clearCart, removeFromCart } = useCart();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addOrder } = useOrder();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'Online'>('Online');
  const [selectedAddressId, setSelectedAddressId] = useState(user?.primaryAddressId || '');

  const mockDistanceKm = useMemo(() => {
     const dist = parseFloat((Math.random() * (settings.maximumRadius - 1) + 1).toFixed(1));
     return Math.min(dist, settings.maximumRadius);
  }, [settings.maximumRadius]);

  const currentZone = useMemo(() => {
    const sortedZones = [...settings.deliveryZones].sort((a, b) => a.radiusKm - b.radiusKm);
    const zone = sortedZones.find(z => mockDistanceKm <= z.radiusKm);
    return zone || sortedZones[sortedZones.length - 1];
  }, [mockDistanceKm, settings.deliveryZones]);

  const deliveryCharge = currentZone?.charge ?? (settings.deliveryBaseCharge + (mockDistanceKm * settings.deliveryPerKmRate));
  const minOrderRequirementMet = cartTotal >= (currentZone?.minOrderValue || 0);

  const discountAmount = (cartTotal * settings.discountPercent) / 100;
  const grandTotal = cartTotal - discountAmount + settings.packagingCharge + deliveryCharge;
  
  const selectedAddress = user?.addresses.find(addr => addr.id === selectedAddressId);
  
  const partnerEarning = settings.partnerEarningModel === 'percentage' 
    ? deliveryCharge * (settings.partnerEarningValue / 100)
    : settings.partnerEarningValue;

  const handlePlaceOrder = () => {
    if (!user || !selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (!minOrderRequirementMet) {
        alert(`Minimum order value for your zone is ₹${currentZone?.minOrderValue}. Please add more items.`);
        return;
    }

    const placedOrder = addOrder({
      customerName: user.name,
      customerPhone: user.phone,
      items: cart,
      subTotal: cartTotal,
      discountAmount,
      deliveryCharge,
      totalAmount: grandTotal,
      deliveryAddress: selectedAddress,
      distance: mockDistanceKm,
      paymentMode,
      deliveryEarning: partnerEarning,
      restaurant_margin: deliveryCharge - partnerEarning
    });

    clearCart();
    setStep('cart');
    onOrderSuccess(placedOrder.id);
  };

  const getItemPrice = (item: CartItem) => {
    const vPrice = item.variants?.find(v => v.id === item.selectedVariantId)?.price || 0;
    return (item.basePrice || 0) + vPrice;
  };

  return (
    <div className="bg-white min-h-full flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-8 pb-6 border-b border-maroon-50 sticky top-0 bg-white z-20">
        {step === 'checkout' ? (
          <button onClick={() => setStep('cart')} className="p-2 bg-maroon-50 text-maroon-600 rounded-xl hover:bg-maroon-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
        ) : onBackToMenu ? (
          <button onClick={onBackToMenu} className="p-2 bg-maroon-50 text-maroon-600 rounded-xl hover:bg-maroon-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
        ) : null}
        <div>
          <h2 className="text-2xl font-black text-maroon-900 tracking-tighter">
            {step === 'cart' ? 'Your Cart' : 'Checkout'}
          </h2>
          <p className="text-[10px] font-black text-maroon-400 uppercase tracking-widest">
            {cart.length} items • {mockDistanceKm}km away
          </p>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-8 no-scrollbar">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-maroon-50 w-32 h-32 rounded-full flex items-center justify-center mb-8">
              <ShoppingBag size={64} className="text-maroon-200" />
            </div>
            <h3 className="text-2xl font-black text-maroon-900 tracking-tighter mb-2">Your cart is empty</h3>
            <p className="text-maroon-400 font-bold mb-8">Looks like you haven't added anything yet.</p>
            <button 
              onClick={onBackToMenu}
              className="bg-maroon-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-maroon-900/20 active:scale-95 transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : step === 'cart' ? (
          <>
            {/* Delivery Info Card */}
            <div className="bg-mustard-50 p-6 rounded-[32px] border border-mustard-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-mustard-600 shadow-sm shrink-0">
                <Bike size={28}/>
              </div>
              <div>
                <p className="text-[10px] font-black text-mustard-400 uppercase tracking-widest mb-1">Delivery Zone</p>
                <p className="text-base font-black text-maroon-900">{currentZone?.name || 'Calculating...'}</p>
              </div>
            </div>

            {/* Min Order Warning */}
            {!minOrderRequirementMet && (
              <div className="bg-red-50 p-6 rounded-[32px] flex items-start gap-4 border border-red-100 animate-shake">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24}/>
                <div>
                  <p className="text-sm font-black text-red-900 leading-tight">Minimum Order Required</p>
                  <p className="text-xs font-bold text-red-600 mt-1 opacity-80">
                    Add items worth ₹{(currentZone?.minOrderValue || 0) - cartTotal} more for delivery in this zone.
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest ml-1">Items in Cart</h3>
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4 p-5 bg-maroon-50/30 rounded-[32px] border border-maroon-50 group hover:border-maroon-100 transition-all">
                  <img src={item.image} className="w-24 h-24 rounded-3xl object-cover shadow-sm" />
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="font-black text-maroon-900 text-lg leading-tight">{item.name}</p>
                        <button 
                          onClick={() => removeFromCart(item.cartId!)}
                          className="text-maroon-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.variants?.find(v => v.id === item.selectedVariantId) && (
                          <span className="text-[9px] font-black text-maroon-600 bg-maroon-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                            {item.variants.find(v => v.id === item.selectedVariantId)!.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xl font-black text-maroon-900">₹{getItemPrice(item)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-3 bg-white px-2 py-2 rounded-2xl border border-maroon-100 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.cartId!, item.quantity + 1)} 
                      className="p-2 text-maroon-600 hover:bg-maroon-50 rounded-xl transition-colors"
                    >
                      <Plus size={18}/>
                    </button>
                    <span className="font-black text-maroon-900 text-base">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId!, item.quantity - 1)} 
                      className="p-2 text-maroon-400 hover:bg-maroon-50 rounded-xl transition-colors"
                    >
                      <Minus size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-10 animate-fade-in">
            {/* Address Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-maroon-100 p-2 rounded-xl">
                    <MapPin size={20} className="text-maroon-600" />
                 </div>
                 <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest">Delivery Address</h3>
              </div>
              <div className="space-y-4">
                {user?.addresses.map(addr => (
                  <button 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full p-6 rounded-[32px] border-2 text-left transition-all duration-300 ${selectedAddressId === addr.id ? 'border-maroon-600 bg-maroon-50 shadow-xl shadow-maroon-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <p className={`font-black uppercase text-[10px] tracking-widest ${selectedAddressId === addr.id ? 'text-maroon-600' : 'text-maroon-300'}`}>{addr.label}</p>
                       {selectedAddressId === addr.id && <div className="w-3 h-3 bg-maroon-600 rounded-full shadow-lg shadow-maroon-600/30"></div>}
                    </div>
                    <p className="text-base font-bold text-maroon-900 leading-snug">{addr.fullAddress}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-maroon-100 p-2 rounded-xl">
                    <CreditCard size={20} className="text-maroon-600" />
                 </div>
                 <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest">Payment Method</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMode('Online')} className={`p-6 rounded-[32px] border-2 flex flex-col gap-3 transition-all duration-300 ${paymentMode === 'Online' ? 'border-maroon-600 bg-maroon-50 shadow-xl shadow-maroon-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}>
                      <CreditCard size={24} className={paymentMode === 'Online' ? 'text-maroon-600' : 'text-maroon-200'} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMode === 'Online' ? 'text-maroon-900' : 'text-maroon-300'}`}>Online Payment</span>
                  </button>
                  <button onClick={() => setPaymentMode('COD')} className={`p-6 rounded-[32px] border-2 flex flex-col gap-3 transition-all duration-300 ${paymentMode === 'COD' ? 'border-mustard-600 bg-mustard-50 shadow-xl shadow-mustard-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}>
                      <Landmark size={24} className={paymentMode === 'COD' ? 'text-mustard-600' : 'text-maroon-200'} />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMode === 'COD' ? 'text-maroon-900' : 'text-maroon-300'}`}>Cash on Delivery</span>
                  </button>
              </div>
            </section>

            {/* Bill Details */}
            <section className="bg-maroon-50/50 p-8 rounded-[40px] border border-maroon-50">
               <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest mb-6">Bill Details</h3>
               <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold text-maroon-400">
                     <span>Item Total</span>
                     <span>₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-maroon-400">
                     <span>Delivery Fee</span>
                     <span>₹{deliveryCharge.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-maroon-400">
                     <span>Packaging Charges</span>
                     <span>₹{settings.packagingCharge}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                       <span>Discount</span>
                       <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="pt-5 border-t border-maroon-100 flex justify-between items-center">
                     <span className="text-xl font-black text-maroon-900 tracking-tighter">Grand Total</span>
                     <span className="text-3xl font-black text-maroon-900 tracking-tighter">₹{grandTotal.toFixed(0)}</span>
                  </div>
               </div>
            </section>
          </div>
        )}
      </main>
      
      {/* Footer */}
      {cart.length > 0 && (
        <footer className="p-8 bg-white border-t border-maroon-50 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] z-30 sticky bottom-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-maroon-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-4xl font-black text-maroon-900 tracking-tighter">₹{grandTotal.toFixed(0)}</p>
            </div>
            {step === 'checkout' && (
              <button 
                onClick={() => setStep('cart')}
                className="px-5 py-2.5 bg-maroon-50 text-maroon-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-maroon-100 transition-all border border-maroon-100"
              >
                Edit Cart
              </button>
            )}
          </div>
          
          <button 
            onClick={step === 'cart' ? () => setStep('checkout') : handlePlaceOrder}
            disabled={step === 'cart' && !minOrderRequirementMet}
            className={`w-full py-6 rounded-[28px] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
              (step === 'cart' && !minOrderRequirementMet) 
              ? 'bg-maroon-200 cursor-not-allowed shadow-none' 
              : 'bg-mustard-500 hover:bg-mustard-600 shadow-mustard-500/30'
            }`}
          >
            {step === 'cart' ? (
              <>
                <span className="text-base uppercase tracking-widest">Proceed to Checkout</span>
                <ChevronRight size={24}/>
              </>
            ) : (
              <>
                <span className="text-base uppercase tracking-widest">Place Order</span>
                <ShoppingBag size={24}/>
              </>
            )}
          </button>
        </footer>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        .text-maroon-900 { color: #450a0a; }
        .text-maroon-700 { color: #7f1d1d; }
        .text-maroon-600 { color: #991b1b; }
        .text-maroon-400 { color: #f87171; }
        .text-maroon-300 { color: #fca5a5; }
        .text-maroon-200 { color: #fecaca; }
        .bg-maroon-900 { background-color: #450a0a; }
        .bg-maroon-800 { background-color: #991b1b; }
        .bg-maroon-700 { background-color: #7f1d1d; }
        .bg-maroon-100 { background-color: #fee2e2; }
        .bg-maroon-50 { background-color: #fef2f2; }
        .bg-mustard-600 { background-color: #ca8a04; }
        .bg-mustard-500 { background-color: #eab308; }
        .bg-mustard-50 { background-color: #fffbeb; }
        .text-mustard-600 { color: #ca8a04; }
        .text-mustard-400 { color: #facc15; }
        .border-maroon-600 { border-color: #991b1b; }
        .border-maroon-100 { border-color: #fee2e2; }
        .border-maroon-50 { border-color: #fef2f2; }
        .border-mustard-100 { border-color: #fef9c3; }
      `}</style>
    </div>
  );
};

export default CartScreen;
