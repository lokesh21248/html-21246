/**
 * Shared TypeScript interfaces matching backend API response shapes.
 * Keep in sync with Supabase pg_listings, bookings, profiles, payments tables.
 */

export interface PGListing {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  reception_phone: string;
  capacity: number;
  occupied: number;
  room_types: RoomType[];
  gender: "Male Only" | "Female Only" | "Co-living";
  property_type: "PG" | "Hotel";
  one_day_stay: boolean;
  has_gym: boolean;
  has_ac: boolean;
  has_non_ac: boolean;
  has_gaming_space: boolean;
  gaming_space_area?: number;
  has_parking: boolean;
  parking_capacity?: number;
  food_menu?: FoodMenu;
  status: "Active" | "Inactive";
  image_url?: string;
  created_at: string;
}

export interface RoomType {
  variant: "Single" | "2-Share" | "3-Share" | "4-Share" | "5-Share";
  price_ac: number;
  price_non_ac: number;
  available: number;
}

export interface FoodMenu {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  menu_details: string;
}

export interface Booking {
  id: string;
  user_id: string;
  listing_id: number;
  check_in: string;
  check_out: string;
  duration: string;
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  pg_listings?: Pick<PGListing, "id" | "name" | "location">;
  profiles?: Pick<UserProfile, "id" | "full_name" | "phone">;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  bookings?: Pick<Booking, "id" | "status">;
  profiles?: Pick<UserProfile, "id" | "full_name">;
}

export interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
}
