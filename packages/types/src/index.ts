// ─── USER ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatarUrl?: string
  role: 'customer' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
}

// ─── PLANT / PRODUCT ─────────────────────────────────────────────────────────

export type PlantDifficulty = 'beginner' | 'intermediate' | 'expert'
export type PlantCategory =
  | 'indoor'
  | 'outdoor'
  | 'succulent'
  | 'tropical'
  | 'herb'
  | 'flowering'
  | 'fern'
  | 'air_purifying'
  | 'bonsai'

export interface PlantCareSchedule {
  wateringIntervalDays: number
  fertiliserIntervalDays: number
  pruningIntervalDays?: number
  repottingIntervalMonths?: number
}

export interface CareGuideSection {
  id: string
  title: string
  icon: string
  body: string
  order: number
}

export interface Plant {
  id: string
  name: string
  scientificName: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  thumbnailUrl: string
  categories: PlantCategory[]
  difficulty: PlantDifficulty
  tags: string[]
  careSchedule: PlantCareSchedule
  careGuide: CareGuideSection[]
  careMetrics: {
    watering: string
    sunlight: string
    humidity: string
    temperature: string
  }
  isBestseller: boolean
  isNewArrival: boolean
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

// ─── SUPPLY / ACCESSORY ──────────────────────────────────────────────────────

export type SupplyCategory = 'pots' | 'soil' | 'fertiliser' | 'tools' | 'accessories'

export interface Supply {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  images: string[]
  thumbnailUrl: string
  category: SupplyCategory
  badges: string[]
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export type Product = Plant | Supply

// ─── CART ────────────────────────────────────────────────────────────────────

export type CartItemType = 'plant' | 'supply'

export interface CartItem {
  id: string
  productId: string
  productType: CartItemType
  name: string
  price: number
  thumbnailUrl: string
  quantity: number
  slug: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  itemCount: number
}

// ─── ORDER ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Address {
  id?: string
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export interface OrderItem {
  id: string
  productId: string
  productType: CartItemType
  name: string
  price: number
  quantity: number
  thumbnailUrl: string
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  shippingAddress: Address
  subtotal: number
  shipping: number
  total: number
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── MY GARDEN / REMINDERS ───────────────────────────────────────────────────

export type ReminderType = 'watering' | 'fertilising' | 'pruning' | 'repotting' | 'seasonal'
export type ReminderStatus = 'pending' | 'done' | 'snoozed' | 'skipped'

export interface GardenPlant {
  id: string
  userId: string
  plantId: string
  plant: Pick<Plant, 'id' | 'name' | 'scientificName' | 'thumbnailUrl' | 'careSchedule'>
  nickname?: string
  acquiredAt: string
  healthScore: number
  notes?: string
  createdAt: string
}

export interface Reminder {
  id: string
  userId: string
  gardenPlantId: string
  gardenPlant: GardenPlant
  type: ReminderType
  title: string
  body: string
  dueAt: string
  status: ReminderStatus
  snoozedUntil?: string
  completedAt?: string
  createdAt: string
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  productId: string
  productType: CartItemType
  rating: number
  title: string
  body: string
  images?: string[]
  isVerifiedPurchase: boolean
  createdAt: string
}

// ─── API RESPONSES ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  success: false
  error: string
  code?: string
  statusCode: number
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────

export interface PushToken {
  id: string
  userId: string
  token: string
  platform: 'ios' | 'android' | 'web'
  createdAt: string
}

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
  imageUrl?: string
}

// ─── FILTERS & QUERIES ────────────────────────────────────────────────────────

export interface PlantFilters {
  category?: PlantCategory
  difficulty?: PlantDifficulty
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestseller'
  page?: number
  limit?: number
}

export interface SupplyFilters {
  category?: SupplyCategory
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}
