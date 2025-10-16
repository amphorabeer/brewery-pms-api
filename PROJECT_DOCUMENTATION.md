# 📋 Brewery PMS - Project Documentation & Checklist

**Date:** October 16, 2025  
**Project:** Brewery Production Management System (Full-Stack SaaS)  
**Version:** 0.1.0 (Phase 1 - In Progress)

---

## 🎯 Project Overview

**Brewery PMS** არის multi-tenant SaaS აპლიკაცია brewery-ების production, inventory, sales და logistics management-სთვის.

### Tech Stack:
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Deployment:** 
  - Frontend: Vercel
  - Backend: Railway
  - Database: Railway Postgres

---

## 🔗 URLs & Access

### Production:
- **Frontend:** https://brewery-pms-frontend.vercel.app
- **Backend API:** https://brewery-pms-api-production.up.railway.app
- **Database:** Railway PostgreSQL (viaduct.proxy.rlwy.net:52248)

### Test Credentials:
- Email: `newuser@brewery.com`
- Password: `Password123!`

### GitHub Repositories:
- Frontend: https://github.com/amphorabeer/brewery-pms-frontend
- Backend: https://github.com/amphorabeer/brewery-pms-api

---

## 📦 Database Schema (Prisma)

### ✅ Existing Tables (24 total):

1. **organizations** - Multi-tenant organizations
2. **users** - User accounts with roles
3. **refresh_tokens** - JWT refresh tokens
4. **plans** - Subscription plans
5. **subscriptions** - Organization subscriptions
6. **invoices** - Billing invoices
7. **payments** - Payment records
8. **locations** - Brewery locations
9. **products** - General products catalog
10. **inventory_items** - Stock tracking
11. **recipes** - Beer recipes
12. **recipe_items** - Recipe ingredients (old system)
13. **batches** - Brewing batches
14. **batch_status_history** - Batch status tracking
15. **fermentation_logs** - Fermentation data
16. **kegs** - Keg tracking
17. **rooms** - Hotel/accommodation rooms
18. **guests** - Guest profiles
19. **reservations** - Room reservations
20. **folio_items** - Billing items
21. **housekeeping_tasks** - Housekeeping management
22. **audit_logs** - System audit trail
23. **ingredients** - ⚠️ **NEW** - Brewing ingredients catalog
24. **recipe_ingredients** - ⚠️ **NEW** - Recipe-ingredient relationships

### ⚠️ CURRENT ISSUE:
**Tables `ingredients` and `recipe_ingredients` არ არის შექმნილი Railway database-ში!**

Migration SQL: `prisma/migrations/20251016_add_ingredients/migration.sql`

---

## ✅ What's WORKING (Deployed & Tested)

### Backend API (Railway):
- ✅ Authentication (register/login/logout)
- ✅ JWT token management
- ✅ Multi-tenancy (organization isolation)
- ✅ CORS configured for localhost + production
- ✅ Recipes CRUD (`/recipes`)
- ✅ Batches CRUD (`/batches`)
- ✅ Locations CRUD (`/locations`)
- ✅ Ingredients endpoints (`/ingredients`) - ⚠️ **Tables not created yet!**

### Frontend (Vercel):
- ✅ Login/Register pages
- ✅ Dashboard with statistics
- ✅ Recipes list & create
- ✅ Batches list & create
- ✅ Locations management
- ✅ Ingredients UI (list/create/edit pages) - ⚠️ **Backend fails due to missing tables**
- ✅ Responsive design
- ✅ Protected routes

### Database:
- ✅ All migrations up to `20251016_init` applied
- ⚠️ Migration `20251016_add_ingredients` NOT applied

---

## 🚧 Current Status - Phase 1 (In Progress)

### ✅ Completed:
1. Infrastructure setup (Vercel + Railway)
2. Authentication system
3. Basic Production Module:
   - Recipes (basic CRUD)
   - Batches (CRUD + status tracking)
   - Locations
4. Ingredients module code written
5. Frontend Ingredients UI pages created

### ⚠️ BLOCKED:
**Ingredients API fails with 500 error:**
```
The table `public.ingredients` does not exist in the current database.
```

**Solution:** Run migration SQL in Railway Postgres

---

## 🔧 Immediate Next Steps

### 1. Fix Ingredients Tables (URGENT):

**Install Railway CLI:**
```bash
brew install railway
railway login
cd ~/brewery-pms-api
railway link
railway connect postgres
```

**Run Migration SQL:**
```sql
-- In psql console (railway=#)
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "supplier" TEXT,
    "cost_per_unit" DECIMAL(10,2),
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "stock" DECIMAL(10,3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "timing" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_org_id_fkey" 
FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" 
FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" 
FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### 2. Test Ingredients Module:
- Create ingredient via UI
- View ingredients list
- Edit ingredient
- Delete ingredient

### 3. Continue Phase 1:
- Recipe ingredients management (add ingredients to recipes)
- ABV/IBU calculators
- Brew sheet PDF generation

---

## 📋 Full Feature Checklist

### Phase 1: Production Module (30% Complete)

#### 1.1 Recipe Manager (50% ✅)
- ✅ Basic CRUD
- ⚠️ Ingredients catalog (blocked - tables missing)
- ❌ Recipe ingredients management
- ❌ ABV calculator
- ❌ IBU calculator
- ❌ Recipe versioning
- ❌ Brew sheet PDF

#### 1.2 Batch Management (40% ✅)
- ✅ Basic CRUD
- ✅ Status tracking
- ✅ Fermentation logs (database)
- ❌ Batch calendar
- ❌ Timeline visualization
- ❌ Temperature graphs
- ❌ Auto inventory deduction
- ❌ Yield reports

#### 1.3 Tank Management (0% ❌)
- ❌ Tank database & CRUD
- ❌ Tank status tracking
- ❌ Tank assignment
- ❌ Cleaning logs
- ❌ Utilization reports

#### 1.4 QC/Quality Control (0% ❌)
- ❌ Test types
- ❌ Parameters & results
- ❌ QC logs per batch
- ❌ Reports

#### 1.5 Packaging (0% ❌)
- ❌ Package types
- ❌ Operations
- ❌ SKU generation
- ❌ Barcodes

---

### Phase 2: Inventory & Purchasing (0% Complete)
- ❌ Stock movements
- ❌ Purchase orders
- ❌ Suppliers
- ❌ Multi-warehouse
- ❌ Stock alerts

---

### Phase 3: Sales & CRM (0% Complete)
- ❌ Customers
- ❌ Sales orders
- ❌ Invoicing
- ❌ CRM tools
- ❌ Trade portal

---

### Phase 4: Delivery & Logistics (0% Complete)
- ❌ Route planning
- ❌ Driver app
- ❌ Tracking

---

### Phase 5: Loyalty Program (0% Complete)
- ❌ Points system
- ❌ Tiers
- ❌ Vouchers

---

### Phase 6: Advanced Reporting (10% Complete)
- ✅ Basic dashboard
- ❌ Operational reports
- ❌ Exports (CSV/PDF)

---

### Phase 7: System & Admin (40% Complete)
- ✅ Multi-tenancy
- ✅ User roles (basic)
- ✅ Audit logs (schema)
- ❌ RBAC (granular permissions)
- ❌ Tenant branding
- ❌ API keys & webhooks

---

## 🏗️ Architecture

### Frontend Structure:
```
src/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # Protected pages
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   ├── batches/
│   │   ├── locations/
│   │   └── ingredients/ # ← NEW
│   └── layout.tsx
├── components/
│   └── ui/              # shadcn components
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   ├── useBatches.ts
│   └── useIngredients.ts # ← NEW
└── lib/
```

### Backend Structure:
```
src/
├── auth/               # JWT authentication
├── prisma/             # Prisma service
├── recipes/            # Recipes module
├── batches/            # Batches module
├── locations/          # Locations module
├── ingredients/        # ← NEW - Ingredients module
├── app.module.ts
└── main.ts
```

---

## 🔑 Environment Variables

### Backend (.env):
```env
DATABASE_URL="postgresql://postgres:fgaFGqZooMiKZFTUJIbTahdncWmHxvzK@viaduct.proxy.rlwy.net:52248/railway"
FRONTEND_URL="http://localhost:3000,http://localhost:3001,https://brewery-pms-frontend.vercel.app"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NODE_ENV="development"
PORT=3000
```

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://brewery-pms-api-production.up.railway.app
```

---

## 🚀 Local Development

### Backend:
```bash
cd ~/brewery-pms-api
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### Frontend:
```bash
cd ~/brewery-pms-frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## 📝 Known Issues

1. **⚠️ CRITICAL:** Ingredients tables not created in production database
   - **Impact:** `/ingredients` API returns 500 error
   - **Fix:** Run migration SQL via Railway CLI

2. ✅ Recipe "New" page shows "Loading recipe..." error (FIXED)
3. ✅ Password hash issue with manually created test user (FIXED)
4. ✅ CORS errors on localhost (FIXED)

---

## 🎯 Project Goals (Full Scope)

Complete ERP system for breweries with:
- Production management
- Inventory & purchasing
- Sales & CRM
- Delivery & logistics
- Loyalty programs
- Advanced reporting
- Multi-tenant SaaS

**Current Progress:** ~15% Complete

---

## 📞 Support & Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

---

## 👥 Development Info

**Developer:** nikolozzedginidze  
**MacBook:** ZazaMac (macOS Catalina)  
**Local Paths:**
- Backend: `~/brewery-pms-api`
- Frontend: `~/brewery-pms-frontend`

---

## 🔥 FOR NEW CHAT SESSION

**Quick Context:** Working on Brewery PMS (Production Management System). Frontend deployed on Vercel, Backend on Railway. Currently implementing Ingredients module - code is written and deployed but database tables are missing in production.

**Immediate Task:** Install Railway CLI (`brew install railway`) and execute migration SQL to create missing `ingredients` and `recipe_ingredients` tables.

**Status:** Phase 1 (Production Module) - 30% complete, blocked by missing database tables.

---

**Last Updated:** October 16, 2025, 11:50 PM  
**Next Session:** Fix ingredients tables → Continue Phase 1 development
