export type VehicleImageSlot = {
  label: string;
  url: string;
};

export type PublicVehicle = {
  id: string;
  name: string;
  brand?: string;
  model_name?: string;
  category?: string;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  seats?: number;
  doors?: number;
  luggage_capacity?: string | number;
  daily_rate?: number;
  weekly_rate?: number | null;
  monthly_rate?: number | null;
  hourly_rate?: number | null;
  deposit_amount?: number | null;
  insurance_cost?: number | null;
  driver_fee?: number | null;
  late_return_fee?: number | null;
  airport_pickup_fee?: number | null;
  extra_charges?: number | null;
  discount_rate?: number | null;
  mileage?: number;
  mileage_limit_per_day?: number | null;
  status?: string;
  condition?: string;
  features?: string[];
  comfort_features?: string[];
  safety_features?: string[];
  image_url?: string | null;
  gallery_images?: string[];
  image_slots?: VehicleImageSlot[];
  horsepower?: string | number;
  fuel_consumption?: string;
  engine_size?: string;
  branch_id?: string | null;
  branch_display?: string | null;
  fuel_policy?: string;
  cancellation_policy?: string;
  smoking_policy?: string;
  pets_policy?: string;
  cross_border_policy?: string;
  min_driver_age?: number;
  license_requirements?: string;
  international_license_policy?: string;
  id_requirements?: string;
  air_conditioning?: boolean;
  gps_enabled?: boolean;
  bluetooth_usb?: boolean;
  android_auto_carplay?: boolean;
  backup_camera?: boolean;
  parking_sensors?: boolean;
  cruise_control?: boolean;
  heated_seats?: boolean;
  leather_seats?: boolean;
  sunroof?: boolean;
  child_seat_support?: boolean;
  wifi_available?: boolean;
  abs_brakes?: boolean;
  airbags?: boolean;
  stability_control?: boolean;
  lane_assist?: boolean;
  emergency_braking?: boolean;
  tire_pressure_monitoring?: boolean;
  security_alarm?: boolean;
  verified_vehicle?: boolean;
  tracking_system?: boolean;
  payment_methods?: string[];
  created_at?: string;
  updated_at?: string;
};

export type PublicBranch = {
  id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  is_pickup?: boolean;
  is_return?: boolean;
  lat?: number | null;
  lng?: number | null;
};

export type PublicTestimonial = {
  id?: string;
  name: string;
  testimonial: string;
  rating: number;
  display_order?: number;
  profile_image_url?: string | null;
};

export type PublicBlogPost = {
  id?: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  cover_image_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PublicServiceCard = {
  id?: string;
  title: string;
  body: string;
};

export type PublicDestination = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  duration: string;
  highlights: string[];
  price_amount: number;
  price_amount_max?: number | null;
  price_currency: string;
  price_suffix: string;
  cover_image_url?: string | null;
  video_url?: string | null;
  display_order: number;
};

export type PublicDestinationBookingPayload = {
  destination_id: string;
  travel_date: string;
  party_size: number;
  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  notes?: string;
};

export type PublicDestinationBookingResult = {
  id: string;
  status: string;
  total_amount: number;
  travel_date: string;
  party_size: number;
  destination_id: string;
  destination_title: string;
};

export type PublicTeamMember = {
  full_name: string;
  role?: string;
  bio?: string;
  photo_url?: string | null;
};

export type PublicBranding = {
  company_name?: string;
  logo_url?: string | null;
  updated_at?: string | null;
  currency?: string;
  footer_tagline?: string;
  footer_description?: string;
  footer_credit_line?: string | null;
  business_hours_text?: string | null;
  company?: {
    phone?: string;
    email?: string;
    description?: string;
    website_url?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state_region?: string;
    postal_code?: string;
    country?: string;
  };
  social_links?: Record<string, string>;
};

export type PublicBookingPayload = {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_branch_id?: string | null;
  return_branch_id?: string | null;
  return_same: boolean;
  guest_full_name: string;
  guest_email: string;
  guest_phone: string;
  notes?: string | null;
};

export type PublicBookingResult = {
  id: string;
  status: string;
  rental_days: number;
  total_amount: number;
  daily_rate: number;
  pickup_date: string;
  return_date: string;
  vehicle_id: string;
  customer_id?: string;
};

export type MyBookingBase = {
  id: string;
  status: string;
  payment_status?: string;
  total_amount?: number;
  notes?: string;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  created_at?: string;
  updated_at?: string;
  editable: boolean;
};

export type MyVehicleBooking = MyBookingBase & {
  kind: "vehicle";
  pickup_date?: string;
  return_date?: string;
  pickup_location?: string;
  return_location?: string;
  pickup_branch_id?: string | null;
  return_branch_id?: string | null;
  return_same?: boolean;
  rental_days?: number;
  daily_rate?: number;
  vehicle_id?: string;
  vehicle_name?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_category?: string | null;
};

export type MyDestinationBooking = MyBookingBase & {
  kind: "destination";
  destination_id?: string;
  destination_title?: string;
  destination_slug?: string | null;
  travel_date?: string;
  party_size?: number;
  price_snapshot?: number;
  price_currency?: string;
  price_suffix?: string;
};

export type MyBooking = MyVehicleBooking | MyDestinationBooking;

export type MyVehicleBookingUpdatePayload = {
  pickup_date?: string;
  return_date?: string;
  pickup_branch_id?: string | null;
  return_branch_id?: string | null;
  return_same?: boolean;
  notes?: string;
  guest_full_name?: string;
  guest_phone?: string;
  status?: "cancelled";
};

export type MyDestinationBookingUpdatePayload = {
  travel_date?: string;
  party_size?: number;
  notes?: string;
  guest_full_name?: string;
  guest_phone?: string;
  status?: "cancelled";
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
