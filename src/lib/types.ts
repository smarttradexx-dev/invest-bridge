/**
 * Domain types shared by the API routes, admin panel and customer UI.
 */

export const ORDER_STATUSES = [
  "pending_quote",
  "quoted",
  "awaiting_payment",
  "paid",
  "shipped_turkey",
  "arrived_syria",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The happy-path progression shown on the customer tracking timeline. */
export const TRACKING_FLOW: OrderStatus[] = [
  "pending_quote",
  "quoted",
  "awaiting_payment",
  "paid",
  "shipped_turkey",
  "arrived_syria",
  "delivered",
];

export type Language = "ar" | "en" | "tr";

export interface Store {
  id: number;
  slug: string;
  name: string;
  name_ar: string | null;
  name_tr: string | null;
  domain: string;
  url: string;
  logo: string;
  accent: string;
  tagline: string;
  tagline_ar: string | null;
  tagline_tr: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_code: string;
  product_url: string;
  store_slug: string | null;
  product_title: string | null;
  product_image: string | null;
  product_price: number | null;
  size: string | null;
  color: string | null;
  quantity: number;
  customer_name: string;
  phone: string;
  city: string;
  address: string | null;
  notes: string | null;
  lang: Language;
  status: OrderStatus;
  product_cost: number | null;
  shipping_cost: number | null;
  service_fee: number | null;
  net_profit: number | null;
  final_price: number | null;
  batch_id: number | null;
  quote_sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: number;
  code: string;
  ship_date: string;
  cutoff_at: string;
  status: "open" | "closed" | "shipped" | "arrived" | "delivered";
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Settings {
  service_fee_percent: number;
  default_shipping_cost: number;
  cutoff_hour_utc: number;
  contact_whatsapp: string;
  contact_email: string;
}

/** Syrian delivery coverage (Adwhit Lojistik routes). */
export const SYRIAN_CITIES = [
  { code: "aleppo", en: "Aleppo", ar: "حلب", tr: "Halep" },
  { code: "al-bab", en: "Al-Bab", ar: "الباب", tr: "Elbab" },
  { code: "damascus", en: "Damascus", ar: "دمشق", tr: "Şam" },
  { code: "homs", en: "Homs", ar: "حمص", tr: "Humus" },
  { code: "latakia", en: "Latakia", ar: "اللاذقية", tr: "Latakia" },
  { code: "idlib", en: "Idlib", ar: "إدلب", tr: "İdlib" },
  { code: "tartus", en: "Tartus", ar: "طرطوس", tr: "Tartus" },
  { code: "deir-ez-zor", en: "Deir ez-Zor", ar: "دير الزور", tr: "Deir ez-Zor" },
  { code: "raqqa", en: "Raqqa", ar: "الرقة", tr: "Raqqa" },
  { code: "hasakah", en: "Al-Hasakah", ar: "الحسكة", tr: "Hasekâ" },
  { code: "daraa", en: "Daraa", ar: "درعا", tr: "Daraa" },
  { code: "suqra", en: "Suqra", ar: "السويداء", tr: "Süveyda" },
] as const;

export type CityCode = (typeof SYRIAN_CITIES)[number]["code"];
