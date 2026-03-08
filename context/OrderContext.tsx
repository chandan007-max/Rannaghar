
import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Order, DeliveryPartner, OrderStatus } from '../types';
import { useDeliveryPartner } from './DeliveryPartnerContext';
import { useSettings } from './SettingsContext';
import { useMenu } from './MenuContext';
import { RESTAURANT_LOCATION } from '../constants';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'otp' | 'statusTimestamps' | 'isNew'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrder: (orderId: string, prepMinutes: number) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  markOrderReady: (orderId: string) => void;
  assignPartner: (orderId: string, partner: DeliveryPartner, earning: number) => void;
  acceptAssignment: (orderId: string) => void;
  partnerReached: (orderId: string) => void;
  handoverOrder: (orderId: string) => void;
  pickupOrder: (orderId: string) => { success: boolean; errorMsg?: string };
  startDelivery: (orderId: string) => void;
  completeDelivery: (orderId: string, otp: string) => { success: boolean; errorMsg?: string };
  requestReturn: (orderId: string, reason: string) => void;
  approveReturn: (orderId: string) => void;
  rejectReturn: (orderId: string) => void;
  completeReturn: (orderId: string, otp: string) => { success: boolean; errorMsg?: string };
  reassignOrder: (orderId: string) => void;
  autoAssignOrder: (orderId: string) => void;
  declineOrder: (orderId: string, partnerId: string, reason?: string) => void;
  markOrderPreparing: (orderId: string) => void;
  toggleHold: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useLocalStorage<Order[]>('rannaghar_orders', []);
  const { settings } = useSettings();
  const { allPartners, setAllPartners, recordDeliveryCompletion, recordDeliveryReturn } = useDeliveryPartner();
  const { deductStock } = useMenu();

  const calculatePriorityScore = useCallback((partner: DeliveryPartner, order: Order, currentOrders: Order[]) => {
    let score = 0;

    // 1. Distance to Pickup (Weight: 40%)
    const distance = partner.currentLocation 
        ? getDistance(RESTAURANT_LOCATION.latitude, RESTAURANT_LOCATION.longitude, partner.currentLocation.latitude, partner.currentLocation.longitude)
        : 999;
    
    if (distance <= 1) score += 40;
    else if (distance <= 2) score += 30;
    else if (distance <= 3) score += 20;
    else if (distance <= 5) score += 10;

    // 2. Delivery Partner Availability (Weight: 20%)
    const isBusy = currentOrders.some(o => o.partnerId === partner.id && !['DELIVERED', 'CANCELLED', 'RETURNED_TO_RESTAURANT'].includes(o.status));
    if (isBusy) {
        score += 0;
    } else {
        const now = Date.now();
        const lastFinished = partner.lastOrderFinishedAt ? new Date(partner.lastOrderFinishedAt).getTime() : 0;
        const minsSinceLast = (now - lastFinished) / 60000;
        
        if (minsSinceLast <= 10 && lastFinished > 0) score += 15; // Recently finished
        else score += 20; // Free
    }

    // 3. Order Size (Weight: 15%)
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount <= 2) score += 5;
    else if (itemCount <= 5) score += 10;
    else score += 15;

    // 4. Delivery Urgency (Weight: 15%)
    const readyTime = order.statusTimestamps.FOOD_READY ? new Date(order.statusTimestamps.FOOD_READY).getTime() : new Date(order.date).getTime();
    const waitingMins = (Date.now() - readyTime) / 60000;
    if (waitingMins <= 5) score += 5;
    else if (waitingMins <= 10) score += 10;
    else score += 15;

    // 5. Delivery Partner Rating (Weight: 10%)
    const rating = partner.rating || 0;
    if (rating >= 4.8) score += 10;
    else if (rating >= 4.5) score += 7;
    else if (rating >= 4.0) score += 5;
    else score += 2;

    // 6. Idle Time Boost (+5)
    const lastAssigned = partner.lastOrderAssignedAt ? new Date(partner.lastOrderAssignedAt).getTime() : 0;
    const idleMins = (Date.now() - Math.max(lastAssigned, new Date(partner.createdAt || 0).getTime())) / 60000;
    if (idleMins > 30) score += 5;

    return Math.min(100, score);
  }, []);

  const updatePartnerLastAssigned = useCallback((partnerId: string) => {
    const phone = Object.values(allPartners).find(p => p.id === partnerId)?.phone;
    if (phone) {
        setAllPartners(prev => ({
            ...prev,
            [phone]: { ...prev[phone], lastOrderAssignedAt: new Date().toISOString() }
        }));
    }
  }, [allPartners, setAllPartners]);

  // Simulated background worker for auto-rejection and auto-archive
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setOrders(prev => prev.map(o => {
            // Auto-cancel NEW orders
            if (o.status === 'NEW' && o.autoCancelAt && now > new Date(o.autoCancelAt).getTime()) {
                return { ...o, status: 'CANCELLED', statusTimestamps: { ...o.statusTimestamps, CANCELLED: new Date().toISOString() }, archiveAt: new Date(now + 300000).toISOString() };
            }
            // Auto-archive DELIVERED/CANCELLED/RETURNED orders
            if (!o.isArchived && o.archiveAt && now > new Date(o.archiveAt).getTime()) {
                return { ...o, isArchived: true };
            }
            return o;
        }));
    }, 10000);
    return () => clearInterval(interval);
  }, [setOrders]);

  const addOrder = (newOrderData: Omit<Order, 'id' | 'date' | 'status' | 'otp' | 'statusTimestamps' | 'isNew'>): Order => {
    const newOrder: Order = { 
      ...newOrderData, 
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
      date: new Date().toISOString(), 
      status: 'NEW', 
      otpAttempts: 0,
      statusTimestamps: { NEW: new Date().toISOString() }, 
      isNew: true, 
      escalationCount: 0, 
      isEscalated: false, 
      declinedPartnerIds: [],
      autoCancelAt: new Date(Date.now() + 240000).toISOString() // 4 min rule
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        
        // Strict State Machine: Only move forward (simplified for simulator but follows requested flow)
        const statusOrder: OrderStatus[] = [
            'NEW', 'ACCEPTED', 'PREPARING', 'FOOD_READY', 'ASSIGNED', 
            'PARTNER_ASSIGNED', 'PARTNER_REACHED', 'HANDOVER_CONFIRMED', 
            'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'
        ];
        
        const currentIndex = statusOrder.indexOf(o.status);
        const nextIndex = statusOrder.indexOf(status);
        
        // Allow CANCELLED from almost anywhere before delivery
        if (status === 'CANCELLED' && o.status !== 'DELIVERED') {
            return { 
                ...o, 
                status, 
                archiveAt: new Date(Date.now() + 300000).toISOString(),
                statusTimestamps: { ...o.statusTimestamps, [status]: new Date().toISOString() } 
            };
        }

        // Enforce forward movement
        if (nextIndex <= currentIndex && status !== 'CANCELLED') return o;

        const patch: Partial<Order> = {
            status,
            statusTimestamps: { ...o.statusTimestamps, [status]: new Date().toISOString() }
        };

        if (status === 'DELIVERED') {
            patch.archiveAt = new Date(Date.now() + 300000).toISOString();
        }

        return { ...o, ...patch };
    }));
  }, [setOrders]);

  const calculateTravelTime = (distanceKm: number): number => {
      const baseTime = distanceKm * 3; // 20km/h average speed
      const trafficDelay = Math.floor(Math.random() * 5); // 0-4 mins traffic
      const graceBuffer = 3;
      return Math.ceil(baseTime + trafficDelay + graceBuffer);
  };

  const autoAssignOrder = useCallback((orderId: string) => {
    setOrders(prevOrders => {
      const order = prevOrders.find(o => o.id === orderId);
      if (!order || (order.status !== 'FOOD_READY' && order.status !== 'ASSIGNED')) return prevOrders;

      const eligible = Object.values(allPartners).filter(p => 
        p.isOnline && 
        !p.isSuspended && 
        p.onboardingStatus === 'active' && 
        (order.paymentMode === 'Online' || p.codCollected < (settings.maxCodLimit || 3000)) &&
        !(order.declinedPartnerIds || []).includes(p.id)
      );
      
      if (eligible.length === 0) return prevOrders;

      const scored = eligible.map(p => {
          const score = calculatePriorityScore(p, order, prevOrders);
          return { p, score };
      }).sort((a, b) => b.score - a.score);

      const best = scored[0].p;
      const earning = settings.partnerEarningModel === 'percentage' 
        ? (order.deliveryCharge || 0) * (settings.partnerEarningValue / 100) 
        : (settings.partnerEarningValue || 0);

      updatePartnerLastAssigned(best.id);

      const pickupDistance = Number((Math.random() * 3 + 1).toFixed(1));
      const pickupTravelTime = calculateTravelTime(pickupDistance);
      const deliveryTravelTime = calculateTravelTime(order.distance || 5);
      const now = new Date();

      return prevOrders.map(o => {
        if (o.id !== orderId) return o;
        
        const estimatedPickupTime = new Date(now.getTime() + pickupTravelTime * 60000);
        const preparationEndTime = o.preparationEndTime ? new Date(o.preparationEndTime) : now;
        const prepMinutesLeft = Math.max(0, (preparationEndTime.getTime() - now.getTime()) / 60000);

        return {
          ...o, 
          status: 'ASSIGNED', 
          partnerId: best.id, 
          partnerDetails: { 
              name: best.name, 
              profilePhoto: best.profilePhoto, 
              vehicleNumber: best.vehicleNumber, 
              rating: best.rating, 
              phone: best.phone 
          }, 
          deliveryEarning: earning, 
          assignmentStartTime: now.toISOString(),
          assignmentExpiry: new Date(now.getTime() + 180000).toISOString(), // 3 min rule
          pickupDistance,
          estimatedPickupTime: estimatedPickupTime.toISOString(),
          estimatedDeliveryTime: new Date(now.getTime() + (prepMinutesLeft + pickupTravelTime + deliveryTravelTime) * 60000).toISOString(),
          statusTimestamps: { ...o.statusTimestamps, ASSIGNED: now.toISOString() }
        };
      });
    });
  }, [allPartners, settings, setOrders, calculatePriorityScore, updatePartnerLastAssigned]);

  const acceptAssignment = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'PARTNER_ASSIGNED');
  }, [updateOrderStatus]);

  const partnerReached = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'PARTNER_REACHED');
  }, [updateOrderStatus]);

  const declineOrder = useCallback((orderId: string, partnerId: string, reason?: string) => {
    setOrders(prev => {
        const orderIndex = prev.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return prev;
        
        const updatedOrders = [...prev];
        const o = updatedOrders[orderIndex];
        const declined = [...(o.declinedPartnerIds || []), partnerId];
        const declinedReasons = reason ? [...(o.declinedReasons || []), { partnerId, reason }] : o.declinedReasons;
        
        updatedOrders[orderIndex] = { 
            ...o, 
            status: 'FOOD_READY',
            partnerId: undefined,
            partnerDetails: undefined,
            declinedPartnerIds: declined,
            declinedReasons,
            assignmentStartTime: undefined,
            assignmentExpiry: undefined
        };
        
        // Trigger auto-assign after state update completes
        setTimeout(() => autoAssignOrder(orderId), 500);
        return updatedOrders;
    });
  }, [autoAssignOrder, setOrders]);

  const acceptOrder = useCallback((orderId: string, prepMinutes: number) => {
    const now = new Date();
    setOrders(prev => prev.map(o => {
        if (o.id !== orderId || o.status !== 'NEW') return o;
        
        // INVENTORY: Deduct stock on acceptance
        o.items.forEach(item => {
            deductStock(item.id, item.quantity, item.selectedVariantId);
        });

        const estimatedPickupDistance = 2.5; // Average 2.5km for partner to reach restaurant
        const pickupTravelTime = calculateTravelTime(estimatedPickupDistance);
        const deliveryTravelTime = calculateTravelTime(o.distance || 5);
        
        const preparationEndTime = new Date(now.getTime() + prepMinutes * 60000);

        return { 
          ...o, 
          status: 'PREPARING', 
          estimatedPreparationMinutes: prepMinutes,
          preparationStartTime: now.toISOString(), 
          preparationEndTime: preparationEndTime.toISOString(), 
          estimatedDeliveryTime: new Date(now.getTime() + (prepMinutes + pickupTravelTime + deliveryTravelTime) * 60000).toISOString(),
          statusTimestamps: { 
              ...o.statusTimestamps, 
              ACCEPTED: now.toISOString(),
              PREPARING: now.toISOString()
          },
          isNew: false,
          autoCancelAt: undefined // Kill the cancel timer
        }
    }));
  }, [setOrders, deductStock]);

  const markOrderPreparing = useCallback((orderId: string) => {
    const now = new Date();
    setOrders(prev => prev.map(o => {
        if (o.id !== orderId || o.status !== 'ACCEPTED') return o;
        
        const prepMinutes = o.estimatedPreparationMinutes || 25;
        const estimatedPickupDistance = 2.5;
        const pickupTravelTime = calculateTravelTime(estimatedPickupDistance);
        const deliveryTravelTime = calculateTravelTime(o.distance || 5);
        
        return { 
          ...o, 
          status: 'PREPARING', 
          preparationStartTime: now.toISOString(), 
          preparationEndTime: new Date(now.getTime() + prepMinutes * 60000).toISOString(), 
          estimatedDeliveryTime: new Date(now.getTime() + (prepMinutes + pickupTravelTime + deliveryTravelTime) * 60000).toISOString(),
          statusTimestamps: { 
              ...o.statusTimestamps, 
              PREPARING: now.toISOString() 
          }
        }
    }));
  }, [setOrders]);

  const toggleHold = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        return { ...o, isHeld: !o.isHeld };
    }));
  }, [setOrders]);

  const rejectOrder = useCallback((orderId: string, reason: string) => {
    setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        if (o.status === 'DELIVERED') return o; // Cannot cancel after delivery
        
        const needsReturn = ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status);
        const returnOtp = needsReturn ? String(Math.floor(1000 + Math.random() * 9000)) : undefined;

        return { 
            ...o, 
            status: 'CANCELLED', 
            deliveryOtp: undefined,
            returnOtp: returnOtp,
            isNew: false,
            autoCancelAt: undefined,
            archiveAt: needsReturn ? undefined : new Date(Date.now() + 300000).toISOString(),
            statusTimestamps: { ...o.statusTimestamps, CANCELLED: new Date().toISOString() },
            returnDetails: { returnCharge: 0, reason } 
        };
    }));
  }, [setOrders]);

  const markOrderReady = useCallback((orderId: string) => {
    setOrders(prevOrders => {
      const order = prevOrders.find(o => o.id === orderId);
      if (!order || !['ACCEPTED', 'PREPARING'].includes(order.status)) return prevOrders; 

      const eligible = Object.values(allPartners).filter(p => 
        p.isOnline && 
        !p.isSuspended && 
        p.onboardingStatus === 'active' && 
        (order.paymentMode === 'Online' || p.codCollected < (settings.maxCodLimit || 3000)) &&
        !(order.declinedPartnerIds || []).includes(p.id)
      );

      const now = new Date();
      let assignmentPatch: Partial<Order> = {};
      
      if (eligible.length > 0) {
        const scored = eligible.map(p => {
          const score = calculatePriorityScore(p, order, prevOrders);
          return { p, score };
        }).sort((a, b) => b.score - a.score);

        const best = scored[0].p;
        const earning = settings.partnerEarningModel === 'percentage' 
            ? (order.deliveryCharge || 0) * (settings.partnerEarningValue / 100) 
            : (settings.partnerEarningValue || 0);

        updatePartnerLastAssigned(best.id);

        const pickupDistance = Number((Math.random() * 3 + 1).toFixed(1));
        const pickupTravelTime = calculateTravelTime(pickupDistance);
        const deliveryTravelTime = calculateTravelTime(order.distance || 5);

        assignmentPatch = {
            status: 'ASSIGNED',
            partnerId: best.id,
            partnerDetails: { 
                name: best.name, 
                profilePhoto: best.profilePhoto, 
                vehicleNumber: best.vehicleNumber, 
                rating: best.rating, 
                phone: best.phone 
            },
            deliveryEarning: earning,
            assignmentStartTime: now.toISOString(),
            assignmentExpiry: new Date(now.getTime() + 180000).toISOString(), // 3 min rule
            pickupDistance,
            estimatedPickupTime: new Date(now.getTime() + pickupTravelTime * 60000).toISOString(),
            estimatedDeliveryTime: new Date(now.getTime() + (pickupTravelTime + deliveryTravelTime) * 60000).toISOString(),
            statusTimestamps: { 
                ...(order.statusTimestamps || {}), 
                FOOD_READY: now.toISOString(),
                ASSIGNED: now.toISOString() 
            }
        };
      } else {
        // No riders found, just mark as FOOD_READY
        const deliveryTravelTime = calculateTravelTime(order.distance || 5);
        const estimatedPickupTime = 5; // Assume 5 mins for a rider to arrive once assigned
        
        assignmentPatch = {
            status: 'FOOD_READY',
            estimatedDeliveryTime: new Date(now.getTime() + (estimatedPickupTime + deliveryTravelTime) * 60000).toISOString(),
            statusTimestamps: { 
                ...(order.statusTimestamps || {}), 
                FOOD_READY: now.toISOString() 
            }
        };
      }

      return prevOrders.map(o => o.id === orderId ? { ...o, ...assignmentPatch } : o);
    });
  }, [allPartners, settings, setOrders]);

  const assignPartner = useCallback((orderId: string, partner: DeliveryPartner, earning: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      const now = new Date();
      const pickupDistance = Number((Math.random() * 3 + 1).toFixed(1));
      const pickupTravelTime = calculateTravelTime(pickupDistance);
      const deliveryTravelTime = calculateTravelTime(o.distance || 5);

      const estimatedPickupTime = new Date(now.getTime() + pickupTravelTime * 60000);
      const preparationEndTime = o.preparationEndTime ? new Date(o.preparationEndTime) : now;
      const prepMinutesLeft = Math.max(0, (preparationEndTime.getTime() - now.getTime()) / 60000);

      return {
        ...o,
        status: 'ASSIGNED',
        partnerId: partner.id,
        partnerDetails: { 
            name: partner.name, 
            profilePhoto: partner.profilePhoto, 
            vehicleNumber: partner.vehicleNumber, 
            rating: partner.rating, 
            phone: partner.phone 
        },
        deliveryEarning: earning,
        assignmentStartTime: now.toISOString(),
        assignmentExpiry: new Date(now.getTime() + 240000).toISOString(),
        pickupDistance,
        estimatedPickupTime: estimatedPickupTime.toISOString(),
        estimatedDeliveryTime: new Date(now.getTime() + (prepMinutesLeft + pickupTravelTime + deliveryTravelTime) * 60000).toISOString(),
        statusTimestamps: { ...(o.statusTimestamps || {}), ASSIGNED: now.toISOString() }
      };
    }));
  }, [setOrders]);

  const handoverOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'HANDOVER_CONFIRMED' as OrderStatus, 
        statusTimestamps: { ...o.statusTimestamps, 'HANDOVER_CONFIRMED': new Date().toISOString() } 
    } : o));
  }, [setOrders]);
  
  const pickupOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, errorMsg: "Order not found" };
    
    // Validation: Order must be READY (or HANDOVER_CONFIRMED) and Partner must be REACHED
    if (order.status !== 'HANDOVER_CONFIRMED' && order.status !== 'PARTNER_REACHED') {
        return { success: false, errorMsg: "Order is not ready for pickup or you haven't reached the restaurant." };
    }

    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date();
    const deliveryTravelTime = calculateTravelTime(order.distance || 5);

    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'OUT_FOR_DELIVERY' as OrderStatus, 
        deliveryOtp: deliveryOtp,
        otpGeneratedAt: now.toISOString(),
        otpAttempts: 0,
        estimatedDeliveryTime: new Date(now.getTime() + deliveryTravelTime * 60000).toISOString(),
        statusTimestamps: { 
            ...o.statusTimestamps, 
            'PICKED_UP': now.toISOString(),
            'OUT_FOR_DELIVERY': now.toISOString()
        } 
    } : o));
    
    return { success: true };
  }, [orders, setOrders]);

  const startDelivery = useCallback((orderId: string) => updateOrderStatus(orderId, 'OUT_FOR_DELIVERY'), [updateOrderStatus]);

  const completeDelivery = useCallback((orderId: string, otp: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, errorMsg: "Order not found" };
    
    if (order.otpAttempts && order.otpAttempts >= 3) {
        return { success: false, errorMsg: "Delivery Locked: Too many incorrect attempts. Contact Admin." };
    }

    // Expiry check (60 mins)
    if (order.otpGeneratedAt) {
        const generatedAt = new Date(order.otpGeneratedAt).getTime();
        const now = Date.now();
        if (now - generatedAt > 60 * 60000) {
            return { success: false, errorMsg: "OTP Expired. Please contact support or request reattempt." };
        }
    }

    if (order.deliveryOtp !== otp) {
        const newAttempts = (order.otpAttempts || 0) + 1;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, otpAttempts: newAttempts } : o));
        
        if (newAttempts >= 3) {
            return { success: false, errorMsg: "Delivery Locked: 3 incorrect attempts. Admin has been alerted." };
        }
        return { success: false, errorMsg: `Incorrect OTP. ${3 - newAttempts} attempts remaining.` };
    }

    setOrders(prev => prev.map(o => { 
      if (o.id === orderId) {
        const updatedOrder = { 
          ...o, 
          status: 'DELIVERED' as OrderStatus, 
          archiveAt: new Date(Date.now() + 300000).toISOString(),
          statusTimestamps: { ...(o.statusTimestamps || {}), DELIVERED: new Date().toISOString() } 
        };
        recordDeliveryCompletion(updatedOrder);
        return updatedOrder;
      }
      return o;
    }));
    
    return { success: true };
  }, [orders, setOrders, recordDeliveryCompletion]);

  const requestReturn = useCallback((orderId: string, reason: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'RETURN_REQUESTED', 
        returnDetails: { returnCharge: 0, reason },
        statusTimestamps: { ...(o.statusTimestamps || {}), 'RETURN_REQUESTED': new Date().toISOString() } 
    } : o));
  }, [setOrders]);

  const approveReturn = useCallback((orderId: string) => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'RETURN_APPROVED', 
        returnOtp: otp,
        returnDetails: { ...(o.returnDetails || { returnCharge: 0, reason: 'Unknown' }), approvedByAdmin: true },
        statusTimestamps: { ...(o.statusTimestamps || {}), 'RETURN_APPROVED': new Date().toISOString() } 
    } : o));
  }, [setOrders]);

  const rejectReturn = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'OUT_FOR_DELIVERY', 
        returnDetails: undefined,
        statusTimestamps: { ...(o.statusTimestamps || {}), 'OUT_FOR_DELIVERY': new Date().toISOString() } 
    } : o));
  }, [setOrders]);

  const completeReturn = useCallback((orderId: string, otp: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, errorMsg: "Order not found" };
    if (order.returnOtp !== otp) return { success: false, errorMsg: "Incorrect Return OTP. Please check with the partner." };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { 
          ...o, 
          status: 'RETURNED_TO_RESTAURANT' as OrderStatus, 
          archiveAt: new Date(Date.now() + 300000).toISOString(),
          returnDetails: { ...(o.returnDetails || { returnCharge: 0, reason: 'Unknown' }), returnCharge: (o.deliveryEarning || 0) * 0.5 },
          statusTimestamps: { ...(o.statusTimestamps || {}), 'RETURNED_TO_RESTAURANT': new Date().toISOString() } 
        };
        recordDeliveryReturn(updatedOrder);
        return updatedOrder;
      }
      return o;
    }));
    
    return { success: true };
  }, [orders, setOrders, recordDeliveryReturn]);

  const reassignOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: 'FOOD_READY', 
        partnerId: undefined, 
        partnerDetails: undefined,
        deliveryOtp: undefined,
        returnOtp: undefined,
        otpAttempts: 0,
        assignmentStartTime: undefined,
        assignmentExpiry: undefined
    } : o));
    setTimeout(() => autoAssignOrder(orderId), 500);
  }, [autoAssignOrder, setOrders]);

  return (
    <OrderContext.Provider value={{ 
      orders, addOrder, updateOrderStatus, acceptOrder, rejectOrder,
      markOrderReady, assignPartner, acceptAssignment, partnerReached, 
      handoverOrder, pickupOrder, startDelivery, completeDelivery, 
      requestReturn, approveReturn, rejectReturn, completeReturn, reassignOrder, 
      autoAssignOrder, declineOrder, markOrderPreparing, toggleHold
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
