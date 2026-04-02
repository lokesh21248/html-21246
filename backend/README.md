# PG Admin — Node.js/Express Backend

Production-ready REST API backend built with **Express + Supabase**.

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js               # Validated env vars (fails fast if missing)
│   │   └── supabase.js          # Supabase admin + public clients
│   ├── middleware/
│   │   ├── auth.js              # Supabase JWT verification → req.user
│   │   ├── adminRole.js         # app_metadata.role === 'admin' guard
│   │   ├── rateLimiter.js       # 100 req/min per IP
│   │   └── errorHandler.js      # Global error handler + AppError class
│   ├── modules/
│   │   ├── listings/            # pg_listings CRUD
│   │   ├── bookings/            # Booking management
│   │   ├── users/               # User profiles
│   │   ├── payments/            # Payment records
│   │   └── dashboard/           # Admin stats aggregation
│   ├── utils/
│   │   ├── apiResponse.js       # sendSuccess / sendError helpers
│   │   └── asyncHandler.js      # Wraps async controllers
│   └── app.js                   # Express app (no server.listen)
├── server.js                    # Entry point
├── .env.example                 # Copy to .env
└── package.json
```

## Quick Start

### 1. Set up environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Install and run

```bash
npm install
npm run dev   # Development (nodemon)
npm start     # Production
```

Server starts at **http://localhost:3001**

---

## API Endpoints

### Health
```
GET /health
```

### Listings (pg_listings)
```
GET    /api/v1/listings           # List all (public, paginated)
GET    /api/v1/listings/:id       # Get single listing
POST   /api/v1/listings           # Create [Admin]
PUT    /api/v1/listings/:id       # Update [Admin]
DELETE /api/v1/listings/:id       # Delete [Admin]
```

### Bookings
```
GET    /api/v1/bookings           # List (admin=all, user=own) [Auth]
GET    /api/v1/bookings/:id       # Get single [Auth]
POST   /api/v1/bookings           # Create booking [Auth]
PATCH  /api/v1/bookings/:id/status # Update status [Admin]
DELETE /api/v1/bookings/:id       # Cancel [Auth]
```

### Users
```
GET    /api/v1/users              # List all [Admin]
GET    /api/v1/users/me           # Own profile [Auth]
GET    /api/v1/users/:id          # Get by ID [Auth]
PUT    /api/v1/users/:id          # Update profile [Auth, own only]
GET    /api/v1/users/:id/stats    # Booking/spending stats [Auth]
```

### Payments
```
GET    /api/v1/payments           # List (admin=all, user=own) [Auth]
GET    /api/v1/payments/revenue   # Revenue breakdown [Admin]
GET    /api/v1/payments/:id       # Get single [Auth]
POST   /api/v1/payments           # Create record [Auth]
PATCH  /api/v1/payments/:id/status # Update status [Admin]
```

### Dashboard (Admin only)
```
GET    /api/v1/dashboard/stats            # Totals: listings, bookings, users, revenue
GET    /api/v1/dashboard/recent-bookings  # Latest N bookings
GET    /api/v1/dashboard/revenue          # Monthly revenue chart data
```

---

## Authentication

All protected routes require:
```
Authorization: Bearer <supabase-jwt-token>
```

Get the token from the Supabase client on the frontend:
```js
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;
```

---

## Admin Role Setup

To grant admin access to a user, run this in **Supabase SQL Editor**:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
WHERE id = 'your-user-uuid-here';
```

---

## Response Format

All responses follow this shape:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

---

## 🧪 Testing

### API Integration Tests (Jest)
Run the backend unit and integration tests:
```bash
npm test
```

### Database Migrations
To update or reset the database:
1. Open the [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor**.
3. Run the contents of `migrate.sql` (located in the backend root).
