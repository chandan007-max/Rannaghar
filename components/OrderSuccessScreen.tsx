
import React, { useEffect, useMemo } from 'react';
import { useOrder } from '../context/OrderContext';
import { CheckCircle, Home, Eye, Clock } from 'lucide-react';

interface OrderSuccessScreenProps {
  orderId: string;
  onTrackOrder: (orderId: string) => void;
  onGoHome: () => void;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ orderId, onTrackOrder, onGoHome }) => {
  const { orders } = useOrder();
  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    const timer = setTimeout(() => {
      onTrackOrder(orderId);
    }, 10000); // Increased to 10 seconds for user to see details

    return () => clearTimeout(timer);
  }, [orderId, onTrackOrder]);
  
  const provisionalEstimate = useMemo(() => {
    if (!order) return { min: 0, max: 0 };
    const avgPrepTime = 15; // Average minutes
    const deliveryTime = (order.distance || 5) * 4;
    const total = avgPrepTime + deliveryTime;
    return {
        min: Math.round(total),
        max: Math.round(total + 10)
    };
  }, [order]);

  if (!order) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-full text-center p-4 bg-gray-50 animate-fade-in">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
      <p className="text-lg text-gray-500 mb-6">Your order has been sent to the kitchen.</p>
      
      <div className="bg-white rounded-xl shadow-sm border p-6 w-full max-w-sm text-left space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500">Order ID:</span>
          <span className="font-semibold text-gray-800">#{order.id.slice(-6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount:</span>
          <span className="font-semibold text-gray-800">₹{order.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment:</span>
          <span className={`font-semibold ${order.paymentMode === 'COD' ? 'text-red-600' : 'text-green-600'}`}>{order.paymentMode}</span>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 w-full max-w-sm text-left space-y-2 mb-8">
        <div className="flex items-center">
            <Clock size={20} className="text-amber-600 mr-3 flex-shrink-0" />
            <div>
                <p className="font-bold text-amber-800">Estimated Arrival Time</p>
                <p className="text-xl font-bold text-amber-700">{provisionalEstimate.min}-{provisionalEstimate.max} mins</p>
            </div>
        </div>
        <p className="text-xs text-amber-700">This is an initial estimate. You'll get a more accurate time once the restaurant confirms your order.</p>
    </div>

      <div className="w-full max-w-sm space-y-3">
        <button 
            onClick={() => onTrackOrder(orderId)}
            className="w-full flex justify-center items-center py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-md">
            <Eye size={20} className="mr-2"/> Track Order
        </button>
         <button 
            onClick={onGoHome}
            className="w-full flex justify-center items-center py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
            <Home size={20} className="mr-2"/> Go to Home
        </button>
      </div>

       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default OrderSuccessScreen;