# ResellHub PH — Online Selling & Reseller Management System

A frontend-only reseller management app built with **React + TypeScript + Tailwind CSS**.
Fully deployable to **Netlify**. Data is stored in the browser (localStorage) so there is no
backend to set up — perfect for demos and small operations.

---

## ✨ Features

### Role-based pricing (privacy by design)
| Role | Sees |
|---|---|
| Admin | Regular price, default reseller price, *and* each reseller's custom price |
| Reseller | Only **their own** price (custom or default) |
| Customer | Only the regular retail price |

### Admin
- **Dashboard** — active products, resellers, pending orders, total sales, 7-day sales chart, top reseller, best-selling product, recent orders
- **Product management** — add/edit/hide/delete products with image, description, category, size/color variant, availability, regular price and default reseller price
- **Custom price per reseller** — set a unique price for any product/reseller pair (e.g. Ana ₱480, Maria ₱490, Jane ₱475 while default reseller price stays ₱499)
- **Reseller accounts** — create, edit, enable/disable resellers
- **Orders** — view, confirm, process, complete, or reject (with reason) orders
- **Sales report** — revenue, retail value, reseller profit, best sellers, order breakdown

### Reseller
- **Private catalog** — browse products priced at *their* wholesale rate
- **Cart & checkout** — add items, set quantities, add notes, submit order
- **My Orders** — track status (pending → confirmed → processing → completed/rejected)
- **Profit calculator** — enter your own selling price and instantly see per-item profit and margin %

### Customer
- Public shop with retail prices, search, and category filters

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Production build
```bash
npm run build        # type-checks + builds to dist/
npm run preview      # serve the build locally
```

---

## ☁️ Deploy to Netlify

**Option A — Netlify Drop (easiest)**
1. Run `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist/` folder onto the page

**Option B — Connect a git repo**
Add one of these build settings (the repo already includes `netlify.toml`, and
`public/_redirects` handles SPA routing):
- Build command: `npm run build`
- Publish directory: `dist`

That's it — deep links like `/admin` work thanks to the SPA redirect rule.

---

## 🔑 Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@resellhub.ph` | `admin123` |
| Reseller (Ana) | `ana@reseller.ph` | `reseller123` |
| Reseller (Maria) | `maria@reseller.ph` | `reseller123` |
| Reseller (Jane) | `jane@reseller.ph` | `reseller123` |
| Customer | `customer@example.com` | `customer123` |

The login page has one-click demo buttons. Use **Reset demo data** on the login page (or
clear site localStorage) to restore the sample products/resellers/orders anytime.

> Heads up: because there is no backend, each browser is its own "shop". Data persists
> on that device, which is fine for demos and small internal use. To go multi-user with a
> shared database later, swap the zustand store for Supabase or a small API.

---

## 🧱 Tech stack
- Vite 5 · React 18 · TypeScript (strict)
- Tailwind CSS 3 · React Router 6
- Zustand with `persist` middleware (localStorage)
- Peso (₱) formatting via `Intl` — no currency library needed