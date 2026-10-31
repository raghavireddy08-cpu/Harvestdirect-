/**
 * HarvestDirect - Core Type Definitions
 */

export type UserRole = 'buyer' | 'farmer' | 'admin';

export type BuyerType = 'household' | 'restaurant' | 'retailer' | 'wholesaler';

export interface FarmerProfile {
  id: string;
  name: string;
  farmName: string;
  location: string;
  region: string;
  distanceKm: number;
  farmingPractices: string[];
  bio: string;
  phone: string;
  email: string;
  pickupAddress: string;
  pickupHours: string;
  supportsDelivery: boolean;
  deliveryTerms: string;
  rating: number;
  reviewsCount: number;
  joinedYear: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface BuyerProfile {
  id: string;
  name: string;
  type: BuyerType;
  businessName?: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  preferredFulfillment: 'pickup' | 'delivery';
  isActive: boolean;
  isVerified: boolean;
  registeredDate: string;
}

export type ProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Herbs & Microgreens'
  | 'Dairy & Eggs'
  | 'Pantry & Honey'
  | 'Grains & Roots';

export type FulfillmentOption = 'pickup' | 'delivery' | 'both';

export interface ProductListing {
  id: string;
  farmerId: string;
  farmName: string;
  farmLocation: string;
  name: string; // Simplified everyday name e.g. "Carrots", "Tomatoes", "Potatoes", "Spinach"
  varietyDetails?: string;
  category: ProductCategory;
  description: string;
  photoUrl: string;
  unit: string; // e.g. "kg", "bunch", "crate (10 kg)", "dozen", "jar (500g)"
  price: number; // in Indian Rupees (₹)
  availableQuantity: number;
  harvestDate: string; // YYYY-MM-DD
  availabilityWindow: string;
  fulfillment: FulfillmentOption;
  deliveryFee: number; // in Indian Rupees (₹)
  isOrganic: boolean;
  status: 'active' | 'paused' | 'flagged' | 'removed';
  moderationReason?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number; // in ₹
  quantity: number;
  subtotal: number; // in ₹
  farmerId: string;
  farmName: string;
  fulfillment: 'pickup' | 'delivery';
}

export type OrderStatus = 'requested' | 'accepted' | 'ready' | 'completed' | 'cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: BuyerType;
  buyerBusinessName?: string;
  buyerContact: {
    email: string;
    phone: string;
    deliveryAddress: string;
  };
  farmerId: string;
  farmName: string;
  farmerPickupAddress: string;
  items: OrderItem[];
  subtotal: number; // in ₹
  deliveryFee: number; // in ₹
  total: number; // in ₹
  fulfillmentType: 'pickup' | 'delivery';
  paymentMethod: 'cash_on_pickup' | 'simulated_card' | 'invoice_on_delivery';
  paymentStatus: 'paid_simulated' | 'pending_on_pickup' | 'invoiced';
  status: OrderStatus;
  statusTimeline: OrderTimelineEvent[];
  buyerNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: ProductListing;
  quantity: number;
  fulfillmentChoice: 'pickup' | 'delivery';
}

export interface TestResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  details: string;
  executedAt: string;
}

export interface UnifiedUserRecord {
  id: string;
  role: 'buyer' | 'farmer';
  name: string;
  secondaryInfo: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  isVerified: boolean;
  registeredDate: string;
  ordersCount: number;
}
