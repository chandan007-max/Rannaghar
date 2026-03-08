
import type { MenuItem, AdminSettings, Category, Subcategory } from './types';

export const RESTAURANT_NAME = "Rannaghar";
export const WHATSAPP_NUMBER = "+917001128520"; 

export const RESTAURANT_LOCATION = { latitude: 21.6253, longitude: 87.5255 };

export const INITIAL_CATEGORIES: Category[] = [
    { id: 'cat-bengali', name: 'Bengali Special', isActive: true, displayOrder: 1 },
    { id: 'cat-chinese', name: 'Chinese', isActive: true, displayOrder: 2 },
    { id: 'cat-snacks', name: 'Snacks & Starters', isActive: true, displayOrder: 3 },
    { id: 'cat-desserts', name: 'Desserts', isActive: true, displayOrder: 4 },
];

export const INITIAL_SUBCATEGORIES: Subcategory[] = [
    { id: 'sub-fish', categoryId: 'cat-bengali', name: 'Fish Items', isActive: true },
    { id: 'sub-mutton', categoryId: 'cat-bengali', name: 'Mutton & Chicken', isActive: true },
    { id: 'sub-noodles', categoryId: 'cat-chinese', name: 'Noodles & Rice', isActive: true },
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 1,
    name: "Shorshe Ilish",
    description: "Hilsa fish cooked in a pungent mustard gravy. A Bengali classic.",
    basePrice: 450,
    image: "https://picsum.photos/seed/ilish/600/400",
    categoryId: "cat-bengali",
    subcategoryId: "sub-fish",
    variants: [
        { id: 'v1-1', name: 'Standard Portions', price: 0, isAvailable: true, stock: 25 }
    ],
    reviews: [
      { customerName: "Anik D.", rating: 5, comment: "Absolutely authentic taste! Just like my mother makes it.", date: "2024-07-15T10:00:00Z" },
    ],
    isAvailable: true,
    foodType: 'Non-Veg',
    stock: 25
  },
  {
    id: 2,
    name: "Kosha Mangsho",
    description: "Slow-cooked mutton curry with rich spices and a thick gravy.",
    basePrice: 0,
    image: "https://picsum.photos/seed/mutton/600/400",
    categoryId: "cat-bengali",
    subcategoryId: "sub-mutton",
    variants: [
        { id: 'v2-1', name: 'Half (2 Pcs)', price: 280, isAvailable: true, stock: 15 },
        { id: 'v2-2', name: 'Full (4 Pcs)', price: 550, isAvailable: true, stock: 10 }
    ],
    reviews: [],
    isAvailable: true,
    foodType: 'Non-Veg',
    stock: 25
  },
  {
    id: 3,
    name: "Kolkata Biryani",
    description: "Aromatic rice dish with meat, potatoes, and a blend of spices.",
    basePrice: 350,
    image: "https://picsum.photos/seed/biryani/600/400",
    categoryId: "cat-bengali",
    subcategoryId: "sub-mutton",
    variants: [],
    reviews: [],
    isAvailable: true,
    foodType: 'Non-Veg',
    stock: 40
  },
  {
    id: 4,
    name: "Dum Biryani",
    description: "Hyderabadi style slow-cooked basmati rice with marinated meat and exotic spices.",
    basePrice: 0,
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=600&auto=format&fit=crop",
    categoryId: "cat-bengali",
    subcategoryId: "sub-mutton",
    variants: [
        { id: 'v4-1', name: 'Half Plate', price: 180, isAvailable: true, stock: 30 },
        { id: 'v4-2', name: 'Full Plate', price: 320, isAvailable: true, stock: 20 }
    ],
    reviews: [],
    isAvailable: true,
    foodType: 'Non-Veg',
    stock: 50
  },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  packagingCharge: 20,
  discountPercent: 10,
  isAppOnline: true,
  restaurantMode: 'Open',
  deliveryBaseCharge: 30,
  deliveryPerKmRate: 5,
  partnerEarningModel: 'fixed',
  partnerEarningValue: 40, 
  maximumRadius: 8,
  maxCodLimit: 3000,
  platformCommissionPercent: 0, 
  autoAssignEnabled: true,
  orderTimeoutMinutes: 4,
  assignmentTimeoutMinutes: 4,
  deliveryZones: [
    { id: 'zone-1', name: 'Local (0-2km)', radiusKm: 2, charge: 30, minOrderValue: 200 },
    { id: 'zone-2', name: 'Mid Range (2-5km)', radiusKm: 5, charge: 50, minOrderValue: 400 },
    { id: 'zone-3', name: 'Extended (5-8km)', radiusKm: 8, charge: 80, minOrderValue: 600 }
  ],
  restaurantProfile: {
    name: 'Rannaghar',
    address: '123, Bengali Street, Kolkata',
    phone: '+917001128520',
    fssai: '12345678901234'
  },
  billSetup: {
    headerText: 'Welcome to Rannaghar',
    footerText: 'Thank you for ordering with us!',
    showGst: false,
    showFssai: true
  }
};
