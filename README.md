# PG Admin - 100% Stabilized Admin Portal

This is a production-ready full-stack admin portal. It is fully integrated with **Supabase**, a **Node.js/Express** backend, and a **Vite/React** frontend.

## 🚀 Quick Start

1. **Backend Setup**:
   - `cd backend`
   - `npm install`
   - `cp .env.example .env` (Set your Supabase keys)
   - `npm start`

2. **Frontend Setup**:
   - `npm install`
   - `npm run dev`

---

## ✅ System Verification

### 1. Environment Check
Run the validation script to ensure all required backend keys are set:
```bash
./scripts/check-env.sh
```

### 2. E2E Testing (Playwright)
The system includes a comprehensive, credential-free UI test suite. To run it:
```bash
# Run all UI tests for logic/navigation/auth
npx playwright test e2e-tests/full-ui.spec.ts
```

---

## 🛠 Features Stable
- **Dashboard**: Live stats from Supabase.
- **PG Listings**: Full CRUD with image support.
- **Bookings**: Secure tenant management.
- **Users**: Admin-role based access control.
- **Payments**: Real-time revenue monitoring.