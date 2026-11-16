# AUREX Global

**أوريكس (AUREX) — Personal shopper & order-by-link concierge from Turkey to Syria**

A production-ready luxury e-commerce platform where customers in Syria paste a product
link from Trendyol, Shein Turkey, Zara, AliExpress or LC Waikiki and receive one
all-inclusive price (product + Adwhit Lojistik shipping + service fee). Paid orders are
consolidated into a weekly **Thursday shipment batch** from Turkey.

| | |
|---|---|
| English | AUREX Global |
| العربية | أورِكس (AUREX) — RTL, default |
| Türkçe | AUREX Global |

---

## Quick start

```bash
npm install
npm run seed     # creates data/aurex.db + demo stores, orders and admin
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

> **Requires Node 22+** — the data layer uses the built-in `node:sqlite` driver, so there
> are no native build steps and no external database to provision.

### Demo admin credentials

| | |
|---|---|
| URL | `http://localhost:3000/admin` |
| Username | `admin` |
| Password | `Aurex2026!` |

> Change these before deploying: they live in the `admins` table (passwords are stored
> as salted `scrypt` hashes, never in plain text).

### npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build and server |
| `npm run seed` | Creates the schema and seeds demo data (idempotent) |
| `npm run db:reset` | Truncates every table and re-seeds (safe while the server runs) |
| `npm run lint` | ESLint |

---

## Feature overview

### Customer site

- **Live Thursday countdown** in the announcement bar — recomputed every second against
  the next cutoff (Thursday 14:00 Turkish time), so every customer sees the same deadline.
- **Famous stores directory** — five clickable brand cards (Trendyol, Shein Turkey, Zara,
  AliExpress, LC Waikiki) that open the official store in a new tab. Brand marks are
  rendered as inline SVG, so no logo ever 404s.
- **Order-by-link form** with an **auto-preview engine**: paste a URL and the backend
  scrapes `og:image` / `og:title` / `og:description` so the customer can visually confirm
  the item before requesting a quote. Blocked retailers degrade to a manual-title field
  instead of an error.
- **Fields** — product URL, size, colour, quantity, full name, WhatsApp number, Syrian
  city, delivery address and notes. Full client + server validation.
- **Order tracking** by order ID *or* WhatsApp number, with a seven-step status timeline:
  Pending quote → Quoted → Awaiting payment → Paid & added to Thursday batch →
  Shipped from Turkey → Arrived in Syria → Delivered.

### Admin control panel (`/admin`)

- **Secure login** — `scrypt`-hashed passwords, server-side sessions in SQLite, `httpOnly`
  cookie, 12-hour expiry. Every admin page and API route is guarded.
- **Quote queue** — every incoming request with customer details, a one-click
  **"Open store page"** link, product/adwhit-shipping/service-fee/net-profit inputs and an
  **auto-calculated final price**. One click **saves the quote and opens a pre-filled
  `wa.me` link** containing the final price, order ID and payment instructions — written
  in the customer's own language.
- **Thursday batch & profit manager** — groups paid orders into the active batch, shows
  **Total Revenue / Total Costs / Total Net Profit / Margin**, and bulk-updates the whole
  batch ("Shipped from Turkey", "Arrived in Syria", "Delivered") in one click.
- **Stores manager** — add, edit, toggle visibility of, or delete brand stores, with
  per-language names and taglines.

---

## Architecture

```
aurex-global/
├── data/aurex.db              # SQLite database (auto-created + seeded)
├── scripts/
│   ├── seed.ts                # npm run seed
│   └── reset.ts               # npm run db:reset
└── src/
    ├── app/
    │   ├── layout.tsx         # root: fonts, html lang/dir, i18n provider
    │   ├── (site)/            # customer routes — /, /track
    │   ├── admin/
    │   │   ├── login/         # public login page
    │   │   └── (panel)/       # guarded admin area — /admin, /admin/quotes, ...
    │   └── api/               # route handlers
    ├── components/            # UI (customer + admin/)
    ├── i18n/
    │   ├── dictionaries/      # ar.ts · en.ts · tr.ts
    │   ├── I18nProvider.tsx   # client context + switcher logic
    │   └── server.ts          # cookie → language resolution
    └── lib/
        ├── db.ts              # node:sqlite connection, schema, settings
        ├── orders.ts          # order persistence + pricing maths
        ├── batch.ts           # Thursday cutoff / batch codes
        ├── og.ts              # Open Graph scraper (SSRF-guarded)
        ├── whatsapp.ts        # wa.me quote builder
        ├── auth.ts / hash.ts  # sessions + scrypt hashing
        └── stores.ts          # store CRUD
```

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 with a custom luxury token theme |
| Database | SQLite via Node's built-in `node:sqlite` |
| Fonts | Cairo (Arabic RTL), Inter (body), Playfair Display (display) |
| Validation | Hand-rolled, mirrored on client and server |

---

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/fetch-meta?url=` | Extract `og:image` / `og:title` from a product page |
| `POST` | `/api/orders` | Create an order-by-link request |
| `GET` | `/api/orders?reference=` | Look up orders by order ID or WhatsApp number |
| `POST` | `/api/admin/login` | Sign in (`{username,password}`) or `{action:"logout"}` |
| `GET` | `/api/admin/quotes?status=` | List quote-queue orders |
| `PATCH` | `/api/admin/quotes/:id` | Update pricing and/or status |
| `POST` | `/api/admin/quotes/:id/send` | Build the localized WhatsApp quote link |
| `GET` | `/api/admin/batches` | Current batch summary, history, unassigned orders |
| `POST` | `/api/admin/batches` | Assign paid orders to the current batch |
| `PATCH` | `/api/admin/batches/:id` | Bulk-update every order in a batch |
| `GET`/`POST` | `/api/admin/stores` | List / create stores |
| `PATCH`/`DELETE` | `/api/admin/stores/:id` | Edit, toggle or remove a store |
| `GET` | `/api/admin/stats` | Dashboard snapshot |

### Open Graph endpoint

`GET /api/fetch-meta?url=https://www.example.com/product`

```json
{
  "ok": true,
  "error": null,
  "data": {
    "title": "Nike. Just Do It",
    "image": "https://…/hero.jpg",
    "siteName": "Nike",
    "price": null,
    "description": "…",
    "url": "https://www.nike.com/"
  }
}
```

The scraper is **SSRF-guarded**: only `http(s)` is accepted, and loopback, link-local,
private and CGNAT ranges are rejected before the request is made (the host is also
resolved and checked). Responses are size-capped and time-boxed to 9 seconds. When a
retailer blocks the request the endpoint still returns `200` with `ok:false`, so the UI
shows a graceful placeholder.

---

## Database schema

| Table | Purpose |
|---|---|
| `stores` | Brand directory — name (en/ar/tr), domain, URL, logo, accent colour, visibility |
| `orders` | Requests, product meta, customer details, pricing, status, batch link |
| `batches` | Weekly Thursday shipments — code (`AURX-2026-W47`), ship date, cutoff, status |
| `admins` | Admin accounts — username, scrypt hash, salt, role |
| `sessions` | Server-side sessions with expiry |
| `settings` | Service-fee %, default shipping, cutoff hour, contact details |

### Pricing model

```
final price = product cost + Adwhit shipping + service fee + net profit
```

The admin enters the four inputs; the final price is derived automatically and is what
the customer is quoted and what the WhatsApp message contains. Batch financials are then
derived from the same fields, so revenue, cost and profit always reconcile.

---

## Configuration

Settings live in the `settings` table (seeded with sensible defaults):

| Key | Default | Meaning |
|---|---|---|
| `service_fee_percent` | `12` | Suggested service fee, % of product cost |
| `default_shipping_cost` | `8.50` | Adwhit Lojistik shipping per order |
| `cutoff_hour_utc` | `11` | Cutoff hour in UTC (11:00 UTC = 14:00 Turkey) |
| `contact_whatsapp` | `905000000000` | Public WhatsApp number |
| `contact_email` | `concierge@aurex.global` | Public e-mail |

Environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `AUREX_DB_PATH` | `./data/aurex.db` | Absolute path to the SQLite file |
| `PORT` | `3000` | Server port |

---

## Internationalisation

Three dictionaries live in `src/i18n/dictionaries/` — `en.ts` is the **source of truth**
and `ar.ts` / `tr.ts` are checked against it with `satisfies typeof en`, so a missing or
renamed key is a **compile error**, not a runtime `undefined`.

- The active language is stored in the `aurex_lang` cookie.
- The root layout reads that cookie and renders `<html lang dir>` — Arabic is the default
  and RTL; English and Turkish are LTR.
- Switching the language updates the client context instantly and calls
  `router.refresh()` so server-rendered copy stays in sync.
- Layout uses CSS logical properties (`ms-`, `pe-`, `start-`, `end-`) so the whole UI
  mirrors correctly in RTL without a separate stylesheet.

**Adding a language:** add the code to `languages` in `src/i18n/types.ts`, create
`dictionaries/<code>.ts` with `satisfies typeof en`, and register it in
`src/i18n/index.ts`.

---

## Security notes

- Passwords are hashed with `scrypt` and a per-user random salt; comparisons are
  timing-safe.
- Sessions are server-side (SQLite), delivered via an `httpOnly`, `SameSite=Lax` cookie
  that is `Secure` in production.
- The Open Graph endpoint blocks requests to private/internal addresses (SSRF).
- All admin API routes re-verify the session server-side — the UI guard is cosmetic.
- Store URLs and product links are validated as `http(s)` before being persisted.

---

## Deployment

The app needs a Node.js runtime (it is not a static export — it has API routes and a
SQLite file). Any Node host works:

```bash
npm ci --omit=dev && npm run build && npm start
```

Mount `data/` on a persistent volume so orders survive restarts, and run
`npm run seed` once to create the schema and the first admin.

---

© 2026 AUREX Global — personal shopping with care, crafted for Syrian customers.
