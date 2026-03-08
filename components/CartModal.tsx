
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { X, Plus, Minus, MapPin, CreditCard, Landmark, ShoppingBag, AlertTriangle, Bike, ChevronRight } from 'lucide-react';
import type { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, updateQuantity, cartTotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addOrder } = useOrder();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'Online'>('Online');
  const [selectedAddressId, setSelectedAddressId] = useState(user?.primaryAddressId || '');
  const [instructions, setInstructions] = useState('');

  const mockDistanceKm = useMemo(() => {
     const dist = parseFloat((Math.random() * (settings.maximumRadius - 1) + 1).toFixed(1));
     return Math.min(dist, settings.maximumRadius);
  }, [isOpen, settings.maximumRadius]);

  const currentZone = useMemo(() => {
    if (!settings.deliveryZones || settings.deliveryZones.length === 0) return null;
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
      instructions,
      deliveryEarning: partnerEarning,
      restaurant_margin: deliveryCharge - partnerEarning
    });

    clearCart();
    setStep('cart');
    onClose();
    onOrderSuccess(placedOrder.id);
  };

  const getItemPrice = (item: CartItem) => {
    const vPrice = item.variants?.find(v => v.id === item.selectedVariantId)?.price || 0;
    return (item.basePrice || 0) + vPrice;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-maroon-900/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-[48px] sm:rounded-[48px] shadow-2xl w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col transform transition-all duration-500 animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-8 border-b border-maroon-50">
            <div>
                <h2 className="text-2xl font-black text-maroon-900 tracking-tighter">
                  {step === 'cart' ? 'Your Cart' : 'Checkout'}
                </h2>
                <p className="text-[10px] font-black text-maroon-400 uppercase tracking-widest">{cart.length} items • {mockDistanceKm}km away</p>
            </div>
            <button onClick={onClose} className="p-3 bg-maroon-50 text-maroon-400 rounded-2xl hover:bg-maroon-100 transition-colors"><X size={24} /></button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-8 pb-48 space-y-8 no-scrollbar bg-white">
          {cart.length === 0 ? (
            <div className="text-center py-20">
                <div className="bg-maroon-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={48} className="text-maroon-200" />
                </div>
                <p className="text-xl font-black text-maroon-900 tracking-tighter">Your cart is empty</p>
                <p className="text-sm font-bold text-maroon-400 mt-2">Add some delicious Bengali food!</p>
            </div>
          ) : step === 'cart' ? (
            <>
              {currentZone && (
                 <div className="bg-mustard-50 p-5 rounded-[32px] flex items-center gap-4 border border-mustard-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-mustard-600 shadow-sm"><Bike size={24}/></div>
                    <div>
                        <p className="text-[10px] font-black text-mustard-400 uppercase tracking-widest">Delivery Zone</p>
                        <p className="text-sm font-black text-maroon-900">{currentZone.name}</p>
                    </div>
                 </div>
              )}

              {!minOrderRequirementMet && (
                <div className="bg-red-50 p-5 rounded-[32px] flex items-start gap-4 border border-red-100 animate-shake">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20}/>
                    <div>
                        <p className="text-sm font-black text-red-900 leading-tight">Minimum Order Required</p>
                        <p className="text-xs font-bold text-red-600 mt-1 opacity-80">Add items worth ₹{(currentZone?.minOrderValue || 0) - cartTotal} more for delivery in this zone.</p>
                    </div>
                </div>
              )}

              <div className="space-y-4">
                {cart.map((item: any) => (
                  <div key={item.cartId} className="flex gap-4 p-4 bg-maroon-50/50 rounded-[32px] border border-maroon-50">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                    <div className="flex-grow">
                      <p className="font-black text-maroon-900 leading-tight">{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.variants?.find((v: any) => v.id === item.selectedVariantId) && (
                            <span className="text-[9px] font-black text-maroon-600 bg-maroon-100 px-2 py-0.5 rounded-md uppercase tracking-widest">{item.variants.find((v: any) => v.id === item.selectedVariantId).name}</span>
                        )}
                      </div>
                      <p className="text-sm font-black text-maroon-900 mt-2">₹{getItemPrice(item)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white p-1 rounded-2xl border border-maroon-100">
                        <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-1.5 text-maroon-600 hover:bg-maroon-50 rounded-xl transition-colors"><Plus size={16}/></button>
                        <span className="font-black text-maroon-900 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-1.5 text-maroon-400 hover:bg-maroon-50 rounded-xl transition-colors"><Minus size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <section>
                <div className="flex items-center gap-2 mb-4">
                   <MapPin size={18} className="text-maroon-600" />
                   <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest">Delivery Address</h3>
                </div>
                <div className="space-y-3">
                  {user?.addresses.map(addr => (
                    <button 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full p-5 rounded-[32px] border-2 text-left transition-all duration-300 ${selectedAddressId === addr.id ? 'border-maroon-600 bg-maroon-50 shadow-xl shadow-maroon-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                         <p className={`font-black uppercase text-[10px] tracking-widest ${selectedAddressId === addr.id ? 'text-maroon-600' : 'text-maroon-300'}`}>{addr.label}</p>
                         {selectedAddressId === addr.id && <div className="w-2 h-2 bg-maroon-600 rounded-full"></div>}
                      </div>
                      <p className="text-sm font-bold text-maroon-900 truncate">{addr.fullAddress}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                   <CreditCard size={18} className="text-maroon-600" />
                   <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest">Payment Method</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPaymentMode('Online')} className={`p-5 rounded-[32px] border-2 flex flex-col gap-2 transition-all duration-300 ${paymentMode === 'Online' ? 'border-maroon-600 bg-maroon-50 shadow-xl shadow-maroon-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}>
                        <CreditCard size={20} className={paymentMode === 'Online' ? 'text-maroon-600' : 'text-maroon-200'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMode === 'Online' ? 'text-maroon-900' : 'text-maroon-300'}`}>Online Payment</span>
                    </button>
                    <button onClick={() => setPaymentMode('COD')} className={`p-5 rounded-[32px] border-2 flex flex-col gap-2 transition-all duration-300 ${paymentMode === 'COD' ? 'border-mustard-600 bg-mustard-50 shadow-xl shadow-mustard-100/50' : 'border-maroon-50 bg-white hover:border-maroon-100'}`}>
                        <Landmark size={20} className={paymentMode === 'COD' ? 'text-mustard-600' : 'text-maroon-200'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMode === 'COD' ? 'text-maroon-900' : 'text-maroon-300'}`}>Cash on Delivery</span>
                    </button>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                   <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest">Kitchen Note</h3>
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any special instructions for the kitchen? (e.g. less spicy, no onions)"
                  className="w-full p-5 rounded-[32px] border-2 border-maroon-50 bg-white focus:border-maroon-200 outline-none text-sm font-bold text-maroon-900 transition-all placeholder:text-maroon-200"
                  rows={3}
                />
              </section>

              <section className="bg-maroon-50 p-6 rounded-[32px] border border-maroon-100">
                 <h3 className="text-sm font-black text-maroon-900 uppercase tracking-widest mb-4">Order Summary</h3>
                 <div className="space-y-3">
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
                    <div className="pt-3 border-t border-maroon-100 flex justify-between items-center">
                       <span className="text-lg font-black text-maroon-900 tracking-tighter">Grand Total</span>
                       <span className="text-2xl font-black text-maroon-900 tracking-tighter">₹{grandTotal.toFixed(0)}</span>
                    </div>
                 </div>
              </section>
            </div>
          )}
        </main>
        
        {cart.length > 0 && (
          <footer className="p-6 bg-white border-t border-maroon-50 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-maroon-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-maroon-900 tracking-tighter">₹{grandTotal.toFixed(0)}</p>
              </div>
              {step === 'checkout' && (
                <button 
                  onClick={() => setStep('cart')}
                  className="px-4 py-2 bg-maroon-50 text-maroon-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-maroon-100 transition-all"
                >
                  Edit Cart
                </button>
              )}
            </div>
            
            <button 
              onClick={step === 'cart' ? () => setStep('checkout') : handlePlaceOrder}
              disabled={step === 'cart' && !minOrderRequirementMet}
              className={`w-full py-5 rounded-[24px] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                (step === 'cart' && !minOrderRequirementMet) 
                ? 'bg-maroon-200 cursor-not-allowed shadow-none' 
                : 'bg-mustard-500 hover:bg-mustard-600 shadow-mustard-500/20'
              }`}
            >
              {step === 'cart' ? (
                <>
                  <span className="text-sm uppercase tracking-widest">Proceed to Checkout</span>
                  <ChevronRight size={20}/>
                </>
              ) : (
                <>
                  <span className="text-sm uppercase tracking-widest">Place Order</span>
                  <ShoppingBag size={20}/>
                </>
              )}
            </button>
          </footer>
        )}
      </div>
       <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .text-maroon-900 { color: #450a0a; }
        .text-maroon-600 { color: #991b1b; }
        .text-maroon-400 { color: #f87171; }
        .text-maroon-300 { color: #fca5a5; }
        .text-maroon-200 { color: #fecaca; }
        .bg-maroon-900 { background-color: #450a0a; }
        .bg-maroon-800 { background-color: #991b1b; }
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
        .shadow-maroon-100 { --tw-shadow-color: #fee2e2; --tw-shadow: var(--tw-shadow-colored); }
        .shadow-mustard-100 { --tw-shadow-color: #fef9c3; --tw-shadow: var(--tw-shadow-colored); }
      `}</style>
    </div>
  );
};

export default CartModal;
