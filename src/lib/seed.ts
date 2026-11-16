import { queryOne, run } from "./db";
import { hashPassword } from "./hash";
import { createStore } from "./stores";
import { createOrder, round2 } from "./orders";
import type { Language } from "./types";

/**
 * Database seeding.
 *
 * Creates the default admin, the five flagship brand stores and a realistic
 * set of sample orders so the dashboard is usable the moment the app boots.
 * Safe to run repeatedly — it only fills empty tables.
 */

export const DEFAULT_ADMIN = {
  username: "admin",
  password: "Aurex2026!",
  name: "Concierge Admin",
};

const SEED_STORES = [
  {
    slug: "trendyol",
    name: "Trendyol",
    name_ar: "تريندول",
    name_tr: "Trendyol",
    domain: "trendyol.com",
    url: "https://www.trendyol.com/",
    logo: "trendyol",
    accent: "#F27A1A",
    tagline: "Türkiye's largest marketplace — fashion, home and electronics.",
    tagline_ar: "أكبر سوق تركي — أزياء ومنزل وإلكترونيات.",
    tagline_tr: "Türkiye'nin en büyük pazar yeri — moda, ev ve elektronik.",
    sort_order: 1,
  },
  {
    slug: "shein",
    name: "Shein Turkey",
    name_ar: "شي إن تركيا",
    name_tr: "Shein Türkiye",
    domain: "shein.com",
    url: "https://www.shein.com.tr/",
    logo: "shein",
    accent: "#111111",
    tagline: "Fast-fashion trends with same-week order-by-link picks.",
    tagline_ar: "أحدث صيحات الأزياء السريعة مع خدمة الطلب عبر الرابط.",
    tagline_tr: "Hızlı moda trendleri, hafta içinde linkle sipariş seçenekleriyle.",
    sort_order: 2,
  },
  {
    slug: "zara",
    name: "Zara",
    name_ar: "زارا",
    name_tr: "Zara",
    domain: "zara.com",
    url: "https://www.zara.com/",
    logo: "zara",
    accent: "#1A1A1A",
    tagline: "European minimalism, premium fabrics and seasonal drops.",
    tagline_ar: "أناقة أوروبية بأقمشة فاخرة وتنزيلات موسمية.",
    tagline_tr: "Avrupa minimalizmi, premium kumaşlar ve sezonlü yeni ürünler.",
    sort_order: 3,
  },
  {
    slug: "aliexpress",
    name: "AliExpress",
    name_ar: "علي إكسبريس",
    name_tr: "AliExpress",
    domain: "aliexpress.com",
    url: "https://www.aliexpress.com/",
    logo: "aliexpress",
    accent: "#E62E04",
    tagline: "Global marketplace with gadgets, accessories and finds.",
    tagline_ar: "سوق عالمي للإلكترونيات والإكسسوارات والقطع المميزة.",
    tagline_tr: "Teknoloji, aksesuar ve keşifler için küresel pazar yeri.",
    sort_order: 4,
  },
  {
    slug: "lc-waikiki",
    name: "LC Waikiki",
    name_ar: "إل سي وايكيكي",
    name_tr: "LC Waikiki",
    domain: "lcwaikiki.com",
    url: "https://www.lcwaikiki.com/",
    logo: "lcwaikiki",
    accent: "#0099CC",
    tagline: "Affordable Turkish basics, denim and everyday essentials.",
    tagline_ar: "أساسيات تركية بأسعار مناسبة وجينز وملابس يومية.",
    tagline_tr: "Uygun fiyatlı Türk temel giyim, denim ve günlük ihtiyaçlar.",
    sort_order: 5,
  },
];

interface SampleOrder {
  url: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  name: string;
  phone: string;
  city: string;
  lang: Language;
  status:
    | "pending_quote"
    | "quoted"
    | "awaiting_payment"
    | "paid"
    | "shipped_turkey"
    | "arrived_syria"
    | "delivered";
  cost: number;
  shipping: number;
  fee: number;
  profit: number;
  daysAgo: number;
}

const SAMPLE_ORDERS: SampleOrder[] = [
  {
    url: "https://www.trendyol.com/kaftan-yaka-kağıdı-1000-beyaz-klasik-erkek-kaftan/xyz-987654",
    title: "Classic Men's Kaftan — Alabaster White",
    size: "L",
    color: "White",
    quantity: 1,
    name: "Ahmad Al-Khalil",
    phone: "+963 912 345 678",
    city: "aleppo",
    lang: "ar",
    status: "pending_quote",
    cost: 74.9,
    shipping: 8.5,
    fee: 8.99,
    profit: 12,
    daysAgo: 0,
  },
  {
    url: "https://www.shein.com/tr/pantalons/pocket-wide-leg-pants-p-1234567.html",
    title: "Wide-Leg Trousers with Side Pockets",
    size: "M",
    color: "Ivory",
    quantity: 2,
    name: "Nour Al-Khalil",
    phone: "+963 933 210 456",
    city: "damascus",
    lang: "ar",
    status: "quoted",
    cost: 32.5,
    shipping: 8.5,
    fee: 3.9,
    profit: 8,
    daysAgo: 1,
  },
  {
    url: "https://www.zara.com/tr/en/women/clothing/dresses/linen-dress-p-12345678.html",
    title: "Linen Midi Dress with Shirred Waist",
    size: "S",
    color: "Sand",
    quantity: 1,
    name: "Maya Haddad",
    phone: "+963 944 887 221",
    city: "latakia",
    lang: "ar",
    status: "awaiting_payment",
    cost: 59.95,
    shipping: 9.25,
    fee: 7.19,
    profit: 10,
    daysAgo: 2,
  },
  {
    url: "https://www.aliexpress.com/item/100500-xyz-true-wireless-headphones.html",
    title: "True Wireless Headphones with Active Noise Cancelling",
    size: "—",
    color: "Black",
    quantity: 1,
    name: "Karim Mansour",
    phone: "+90 555 321 4477",
    city: "homs",
    lang: "tr",
    status: "paid",
    cost: 46.8,
    shipping: 11,
    fee: 5.62,
    profit: 9,
    daysAgo: 3,
  },
  {
    url: "https://www.lcwaikiki.com/en-tr/pantolon/denim-pantolon-erkek-AK2468",
    title: "Slim Fit Stretch Denim Jeans",
    size: "32",
    color: "Indigo",
    quantity: 1,
    name: "Yousef Al-Sayed",
    phone: "+963 955 112 330",
    city: "al-bab",
    lang: "ar",
    status: "paid",
    cost: 39.99,
    shipping: 8.5,
    fee: 4.8,
    profit: 7.5,
    daysAgo: 3,
  },
  {
    url: "https://www.trendyol.com/kadin-deri-canta-orta-boy-deri-askapli-canta/abc-112233",
    title: "Leather Shoulder Bag — Mid Season",
    size: "—",
    color: "Cognac",
    quantity: 1,
    name: "Rana Bou Ali",
    phone: "+963 961 774 008",
    city: "idlib",
    lang: "ar",
    status: "shipped_turkey",
    cost: 118.4,
    shipping: 12.5,
    fee: 14.21,
    profit: 20,
    daysAgo: 6,
  },
  {
    url: "https://www.shein.com/tr/c sweatshirt/oversize-graphic-sweatshirt-p-7654321.html",
    title: "Oversize Graphic Sweatshirt",
    size: "XL",
    color: "Heather Grey",
    quantity: 1,
    name: "Salma Nasser",
    phone: "+963 992 665 140",
    city: "tartus",
    lang: "ar",
    status: "arrived_syria",
    cost: 27.3,
    shipping: 8.5,
    fee: 3.28,
    profit: 6,
    daysAgo: 9,
  },
  {
    url: "https://www.zara.com/tr/en/men/jackets/padded-lightweight-jacket-p-87654321.html",
    title: "Lightweight Padded Bomber Jacket",
    size: "M",
    color: "Olive",
    quantity: 1,
    name: "Omar Al-Daher",
    phone: "+90 532 118 9032",
    city: "deir-ez-zor",
    lang: "tr",
    status: "delivered",
    cost: 89.99,
    shipping: 10,
    fee: 10.8,
    profit: 16,
    daysAgo: 14,
  },
  {
    url: "https://www.aliexpress.com/item/325680-xyz-led-sunrise-alarm-clock.html",
    title: "Sunrise LED Alarm Clock with Wireless Charging",
    size: "—",
    color: "White",
    quantity: 2,
    name: "Hiba Fares",
    phone: "+963 944 112 998",
    city: "raqqa",
    lang: "ar",
    status: "pending_quote",
    cost: 21.45,
    shipping: 8.5,
    fee: 2.57,
    profit: 5,
    daysAgo: 0,
  },
  {
    url: "https://www.lcwaikiki.com/en-tr/kiyak/erkek-ceket-blazer/AB1357",
    title: "Single-Breasted Blazer Jacket",
    size: "40",
    color: "Navy",
    quantity: 1,
    name: "Tarek Suleiman",
    phone: "+963 933 447 220",
    city: "hasakah",
    lang: "ar",
    status: "quoted",
    cost: 64.5,
    shipping: 8.5,
    fee: 7.74,
    profit: 11,
    daysAgo: 1,
  },
];

export interface SeedResult {
  seeded: boolean;
  admin: boolean;
  stores: number;
  orders: number;
  message: string;
}

export function seedIfEmpty(): SeedResult {
  const ordersBefore =
    queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM orders")?.count ?? 0;

  let adminCreated = false;
  const adminExists = queryOne("SELECT 1 AS hit FROM admins LIMIT 1");
  if (!adminExists) {
    const { hash, salt } = hashPassword(DEFAULT_ADMIN.password);
    run(
      "INSERT INTO admins (username, password_hash, salt, name, role) VALUES (?,?,?,?,'admin')",
      DEFAULT_ADMIN.username,
      hash,
      salt,
      DEFAULT_ADMIN.name,
    );
    adminCreated = true;
  }

  let storesCreated = 0;
  for (const store of SEED_STORES) {
    const exists = queryOne("SELECT 1 AS hit FROM stores WHERE slug = ?", store.slug);
    if (exists) continue;
    createStore(store);
    storesCreated += 1;
  }

  let ordersCreated = 0;
  if (ordersBefore === 0) {
    // The demo batch must exist before any order can reference it.
    run(
      "INSERT OR IGNORE INTO batches (code, ship_date, cutoff_at, status) VALUES (?,?,?,?)",
      "AURX-2026-W47",
      "2026-11-19",
      "2026-11-19T11:00:00.000Z",
      "shipped",
    );
    const seedBatchId =
      queryOne<{ id: number }>("SELECT id FROM batches WHERE code = ?", "AURX-2026-W47")?.id ??
      null;

    for (const sample of SAMPLE_ORDERS) {
      const createdAt = new Date(
        Date.now() - sample.daysAgo * 86_400_000 - Math.random() * 7_200_000,
      ).toISOString();

      const order = createOrder({
        productUrl: sample.url,
        productTitle: sample.title,
        productImage: null,
        productPrice: sample.cost,
        storeSlug: null,
        size: sample.size === "—" ? null : sample.size,
        color: sample.color,
        quantity: sample.quantity,
        customerName: sample.name,
        phone: sample.phone,
        city: sample.city,
        address: null,
        notes: null,
        language: sample.lang,
      });

      const finalPrice = round2(
        sample.cost + sample.shipping + sample.fee + sample.profit,
      );

      run(
        `UPDATE orders SET
            product_cost = ?, shipping_cost = ?, service_fee = ?, net_profit = ?, final_price = ?,
            status = ?, batch_id = ?, quote_sent_at = ?, paid_at = ?, created_at = ?, updated_at = ?
          WHERE id = ?`,
        sample.cost,
        sample.shipping,
        sample.fee,
        sample.profit,
        finalPrice,
        sample.status,
        ["paid", "shipped_turkey", "arrived_syria", "delivered"].includes(sample.status)
          ? seedBatchId
          : null,
        sample.status === "pending_quote" ? null : createdAt,
        ["paid", "shipped_turkey", "arrived_syria", "delivered"].includes(sample.status)
          ? createdAt
          : null,
        createdAt,
        createdAt,
        order.id,
      );
      ordersCreated += 1;
    }
  }

  const seeded = adminCreated || storesCreated > 0 || ordersCreated > 0;
  return {
    seeded,
    admin: adminCreated,
    stores: storesCreated,
    orders: ordersCreated,
    message: seeded
      ? `Seeded ${storesCreated} stores and ${ordersCreated} orders (admin ${adminCreated ? "created" : "exists"}).`
      : "Database already seeded.",
  };
}
