
export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  location: Geolocation;
}

export interface User {
  name: string;
  phone: string;
  addresses: Address[];
  primaryAddressId: string;
}

export interface Review {
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO date string
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    displayOrder: number;
}

export interface Subcategory {
    id: string;
    categoryId: string;
    name: string;
    isActive: boolean;
}

export interface ItemVariant {
    id: string;
    name: string; 
    price: number;
    isAvailable: boolean;
    stock?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  categoryId: string;
  subcategoryId?: string;
  variants: ItemVariant[];
  reviews: Review[];
  isAvailable: boolean;
  foodType: 'Veg' | 'Non-Veg' | 'Egg';
  packagingCharge?: number;
  stock?: number;
  rating?: number;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
}

export interface CartItem extends MenuItem {
  cartId?: string;
  quantity: number;
  selectedVariantId?: string;
  selectedAddons?: Addon[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  radiusKm: number;
  charge: number;
  minOrderValue: number;
}

export type RestaurantMode = 'Open' | 'Busy' | 'Closed';

export interface PrinterConfig {
  id: string;
  name: string;
  type: 'USB' | 'Bluetooth' | 'Network';
  paperWidth: '58mm' | '80mm';
  isConnected: boolean;
  autoPrintKOT: boolean;
  autoPrintBill: boolean;
  kotCopies: number;
  invoiceCopies: number;
}

export interface TimeSlot {
  open: string; // HH:mm
  close: string; // HH:mm
}

export interface DayTiming {
  day: string;
  slots: TimeSlot[];
  isOpen: boolean;
}

export interface RestaurantTiming {
  [key: string]: DayTiming;
}

export interface RestaurantProfile {
  name: string;
  address: string;
  phone: string;
  gstin?: string;
  fssai?: string;
  logo?: string;
}

export interface BillSetup {
  headerText?: string;
  footerText?: string;
  showGst: boolean;
  showFssai: boolean;
}

export interface AdminSettings {
  packagingCharge: number;
  discountPercent: number;
  isAppOnline: boolean;
  restaurantMode: RestaurantMode;
  deliveryBaseCharge: number;
  deliveryPerKmRate: number;
  partnerEarningModel: 'fixed' | 'percentage';
  partnerEarningValue: number;
  maximumRadius: number; 
  maxCodLimit: number;
  platformCommissionPercent: number;
  deliveryZones: DeliveryZone[];
  autoAssignEnabled: boolean;
  orderTimeoutMinutes: number;
  assignmentTimeoutMinutes: number;
  printerConfig?: PrinterConfig;
  timing?: RestaurantTiming;
  restaurantProfile?: RestaurantProfile;
  billSetup?: BillSetup;
}

export type OrderStatus = 
  | 'NEW' 
  | 'ACCEPTED' 
  | 'PREPARING' 
  | 'FOOD_READY' 
  | 'ASSIGNED' 
  | 'PARTNER_ASSIGNED'
  | 'PARTNER_REACHED'
  | 'HANDOVER_CONFIRMED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNED_TO_RESTAURANT'
  | 'CANCELLED';

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subTotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Address;
  distance?: number;
  paymentMode: 'COD' | 'Online';
  deliveryOtp?: string;
  pickupOtp?: string; // Kept for backward compatibility if needed, but not used anymore
  returnOtp?: string;
  otpGeneratedAt?: string;
  otpAttempts?: number;
  partnerId?: string;
  partnerDetails?: Partial<Pick<DeliveryPartner, 'name' | 'profilePhoto' | 'vehicleNumber' | 'rating' | 'phone'>>;
  declinedPartnerIds?: string[];
  declinedReasons?: { partnerId: string; reason: string }[];
  deliveryEarning?: number;
  restaurant_margin?: number;
  statusTimestamps: Partial<Record<OrderStatus, string>>;
  isNew?: boolean;
  isEscalated?: boolean;
  escalationCount?: number;
  assignmentStartTime?: string;
  preparationStartTime?: string;
  preparationEndTime?: string;
  estimatedPreparationMinutes?: number;
  estimatedArrivalTime?: string;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  pickupDistance?: number;
  deliveryDistance?: number;
  returnDetails?: { returnCharge: number; reason: string; approvedByAdmin?: boolean };
  assignmentExpiry?: string;
  autoCancelAt?: string;
  archiveAt?: string;
  isArchived?: boolean;
  instructions?: string;
  isHeld?: boolean;
}

export type SettlementType = 'COD_DEPOSIT' | 'EARNING_PAYOUT' | 'WEEKLY_SETTLEMENT';
export type SettlementStatus = 'Pending' | 'AwaitingOTP' | 'Completed' | 'Failed' | 'Pending Approval' | 'Paid' | 'On Hold' | 'Unsettled' | 'Rejected';

export interface CODLedgerEntry {
    id: string;
    orderId: string;
    amount: number;
    date: string;
    status: 'Unsettled' | 'Settled';
    settlementId?: string;
}

export interface WeeklyStatement {
    id: string;
    partnerId: string;
    periodStart: string;
    periodEnd: string;
    grossEarnings: number;
    totalDeliveries: number;
    returnCharges: number;
    incentives: number;
    penalties: number;
    commission: number;
    codDeducted: number;
    netPayable: number;
    negativeCarryForward: number;
    status: SettlementStatus;
    processedAt: string;
}

export interface Settlement {
    id: string;
    partnerId: string;
    type: SettlementType;
    date: string;
    amount: number;
    method: 'UPI' | 'Bank' | 'Cash';
    status: SettlementStatus;
    otp?: string;
    otpExpiry?: string;
    paidAt?: string;
    transactionId?: string;
    rejectionReason?: string;
    weeklyData?: Partial<WeeklyStatement>;
}

export type OnboardingStatus = 
    | 'pending_docs'
    | 'under_review'
    | 'active'
    | 'rejected'
    | 'suspended'
    | 'blocked';

export interface Penalty {
    id: string;
    amount: number;
    reason: string;
    date: string;
    isSettled: boolean;
}

export interface Incentive {
    id: string;
    amount: number;
    reason: string;
    date: string;
    isSettled: boolean;
}

export interface DeliveryPartner {
    id: string;
    phone: string;
    name: string;
    dob?: string;
    address: string;
    city?: string;
    profilePhoto: string;
    emergencyContact: string;
    vehicleNumber: string;
    vehicleType?: 'Bike' | 'Scooter';
    documents: {
        governmentIdType?: 'Aadhaar' | 'Voter ID';
        governmentIdNumber?: string;
        governmentIdFront?: string;
        governmentIdBack?: string;
        licenseNumber?: string;
        licenseExpiry?: string;
        licenseFront?: string;
        licenseBack?: string;
        rcDocument?: string;
        insuranceCertificate?: string;
        // Legacy fields for compatibility
        aadhaar?: string;
        license?: string;
    };
    paymentDetails: {
        type: 'upi' | 'bank';
        accountHolderName?: string;
        bankName?: string;
        accountNumber?: string;
        ifsc?: string;
        upiId?: string;
    };
    policyAgreed: boolean;
    onboardingStatus: OnboardingStatus;
    rejectionReason?: string;
    isOnline: boolean;
    codCollected: number;
    negativeWalletBalance: number;
    pendingEarnings: number;
    lifetimeEarnings: number;
    rating: number;
    codLedger: CODLedgerEntry[];
    settlementHistory: Settlement[];
    penalties: Penalty[];
    incentives: Incentive[];
    isSuspended: boolean;
    currentLocation?: Geolocation;
    lastOrderFinishedAt?: string;
    lastOrderAssignedAt?: string;
    createdAt?: string;
}
