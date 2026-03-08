
import React, { useState, useEffect } from 'react';
import { Geolocation } from '../types';
import { Home, Utensils, Bike } from 'lucide-react';

interface LiveTrackingMapProps {
  customerLocation: Geolocation;
  orderDistance: number;
  partnerLocation?: Geolocation;
}

const RESTAURANT_POS = { x: 15, y: 20 }; // %
const CUSTOMER_POS = { x: 85, y: 80 }; // %

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ customerLocation, orderDistance, partnerLocation }) => {
    const [partnerPos, setPartnerPos] = useState(RESTAURANT_POS);

    useEffect(() => {
        if (partnerLocation) {
            // Map real coordinates to our SVG grid (rough approximation for demo)
            // In a real app with Google Maps, this wouldn't be necessary
            const restaurantLat = 22.5726; // Example Kolkata coords
            const restaurantLng = 88.3639;
            
            // Calculate relative position based on customer and restaurant
            const latDiff = customerLocation.latitude - restaurantLat;
            const lngDiff = customerLocation.longitude - restaurantLng;
            
            const pLatDiff = partnerLocation.latitude - restaurantLat;
            const pLngDiff = partnerLocation.longitude - restaurantLng;
            
            const xProgress = lngDiff === 0 ? 0 : pLngDiff / lngDiff;
            const yProgress = latDiff === 0 ? 0 : pLatDiff / latDiff;
            
            const newX = RESTAURANT_POS.x + (CUSTOMER_POS.x - RESTAURANT_POS.x) * Math.max(0, Math.min(1, xProgress));
            const newY = RESTAURANT_POS.y + (CUSTOMER_POS.y - RESTAURANT_POS.y) * Math.max(0, Math.min(1, yProgress));
            
            setPartnerPos({ x: newX, y: newY });
            return;
        }

        const duration = 20000; // 20 seconds for the whole trip simulation
        const interval = 250; 
        const steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            
            const newX = RESTAURANT_POS.x + (CUSTOMER_POS.x - RESTAURANT_POS.x) * progress;
            const newY = RESTAURANT_POS.y + (CUSTOMER_POS.y - RESTAURANT_POS.y) * progress;
            setPartnerPos({ x: newX, y: newY });

            if (progress >= 1) {
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [orderDistance]);

    return (
        <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
            {/* Map Background SVG */}
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#f4f4f4" />
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Roads */}
                <path d="M 15% 0 V 20% H 40% V 60% H 85% V 100%" fill="none" stroke="#ffffff" strokeWidth="12" />
                <path d="M 15% 0 V 20% H 40% V 60% H 85% V 100%" fill="none" stroke="#d1d5db" strokeWidth="10" />

                <path d="M 0 50% H 40%" fill="none" stroke="#ffffff" strokeWidth="8" />
                <path d="M 0 50% H 40%" fill="none" stroke="#d1d5db" strokeWidth="6" />

                <path d="M 60% 0 V 60%" fill="none" stroke="#ffffff" strokeWidth="8" />
                <path d="M 60% 0 V 60%" fill="none" stroke="#d1d5db" strokeWidth="6" />
                
                {/* Green park area */}
                <rect x="42%" y="22%" width="16%" height="12%" fill="#c8e6c9" rx="8"/>
                
                {/* Buildings */}
                <rect x="2%" y="8%" width="10%" height="8%" fill="#e0e0e0" />
                <rect x="45%" y="65%" width="15%" height="10%" fill="#e0e0e0" />
                <rect x="70%" y="10%" width="10%" height="20%" fill="#e0e0e0" />

                {/* Dashed line for route */}
                <line 
                    x1={`${RESTAURANT_POS.x}%`} y1={`${RESTAURANT_POS.y}%`} 
                    x2={`${CUSTOMER_POS.x}%`} y2={`${CUSTOMER_POS.y}%`} 
                    stroke="#4f46e5" strokeWidth="3" strokeDasharray="6,6" 
                />
            </svg>
            
            {/* Restaurant Pin */}
            <div className="absolute flex flex-col items-center" style={{ left: `${RESTAURANT_POS.x}%`, top: `${RESTAURANT_POS.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg">
                    <Utensils size={20} />
                </div>
                <span className="text-xs font-semibold bg-white/70 px-1.5 py-0.5 rounded-md mt-1">Rannaghar</span>
            </div>

            {/* Customer Pin */}
             <div className="absolute flex flex-col items-center" style={{ left: `${CUSTOMER_POS.x}%`, top: `${CUSTOMER_POS.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Home size={20} />
                </div>
                <span className="text-xs font-semibold bg-white/70 px-1.5 py-0.5 rounded-md mt-1">You</span>
            </div>
            
            {/* Partner Pin (Animated) */}
            <div 
                className="absolute flex flex-col items-center transition-all duration-100 linear" 
                style={{ left: `${partnerPos.x}%`, top: `${partnerPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="bg-indigo-600 text-white p-2.5 rounded-full shadow-xl">
                    <Bike size={24} />
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingMap;