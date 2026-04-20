---
name: MAPEX Website Project
description: Full e-commerce website for MAPEX paint store in Hermosillo, Sonora
type: project
---

MAPEX is a paint distribution company in Hermosillo, Sonora that is an official Sherwin Williams distributor. They also sell Boden brand products.

**Why:** The user needs a landing page + e-commerce platform to sell products for home delivery in Hermosillo.

**How to apply:** When working on this project, remember it serves Spanish-speaking customers in Mexico, uses MXN currency, and the brand colors are orange-red (#E8462A) and dark navy (#1C1C2E) from the logo.

## Tech Stack
- Next.js 16.2.4 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- Zustand (cart state)
- lucide-react v1.8 (note: no Facebook/Instagram icons - use Share2/MessageCircle)

## Project Location
`C:\Users\Diego\Desktop\MAPEX\MAPEX-WEBSITE`

## Business Info
- Location: Nayarit #116 Int. 2, esquina con Reyes, Hermosillo, Sonora
- Brands: Sherwin Williams (official distributor), Boden
- Delivery: All Hermosillo. Free shipping over $1,500 MXN
- Delivery fee: $80 MXN

## Key Files
- Migration: `supabase/migrations/001_initial_schema.sql`
- Setup guide: `SETUP.md`
- Cart store: `store/cart.ts`
- Supabase client: `lib/supabase/client.ts` and `lib/supabase/server.ts`
- Admin panel: `app/admin/` (requires role='admin' in profiles table)
- Proxy (middleware): `proxy.ts` (Note: Next.js 16 uses "proxy" not "middleware")

## Database Tables
profiles, brands, categories, products, product_variants, product_images, addresses, cart_items, orders, order_items

## Important Notes
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`
- Catalogs are served as static PDFs from `/public/`
- All images have placeholder containers with descriptions of what goes there
- Phone/email/WhatsApp numbers are placeholders - user needs to update them
