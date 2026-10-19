# E-Shop Backend — MERN Stack REST API

A secure, maintainable, production-ready Express.js & MongoDB backend designed specifically for seamless compatibility with the **E-Shop** React frontend.

---

## Table of Contents
1. [Architecture & Technology Stack](#technology-stack)
2. [Prerequisites & System Requirements](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup & Seeding](#database-setup--seeding)
6. [Administrator Account Configuration](#administrator-account)
7. [Running the Application](#running-the-application)
8. [API Documentation & Request Examples](#api-documentation)
9. [Authentication & Security Implementation](#authentication--security)
10. [Cart, Checkout & Inventory Consistency](#checkout--inventory)
11. [Testing & Verification](#testing--verification)
12. [Troubleshooting & FAQ](#troubleshooting)

---

## 1. Technology Stack

- **Runtime**: Node.js (v18+ / v20+ / v24+) with ES Modules (`"type": "module"`)
- **Web Framework**: Express.js 4.x
- **Database & ODM**: MongoDB with Mongoose 8.x
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly, Secure, SameSite cookies + Bearer token support
- **Password Security**: bcryptjs (salted password hashing)
- **Validation**: express-validator & centralized validation middleware
- **Security Headers**: Helmet
- **CORS**: Explicit origin whitelist with credentialed requests (`credentials: true`)
- **Rate Limiting**: express-rate-limit on sensitive auth endpoints
- **Testing**: Node.js native test runner (`node:test`) + supertest + mongodb-memory-server

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: version 18.0.0 or higher (`node -v`)
- **npm**: version 9.0.0 or higher (`npm -v`)
- **MongoDB**: either a local MongoDB Community Server instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster connection URI.

---

## 3. Installation & Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell, use `Copy-Item .env.example .env`)*

---

## 4. Environment Variables

Configure the following variables in `backend/.env`:

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port for Express server | `5000` |
| `NODE_ENV` | Environment (`development` / `production` / `test`) | `development` |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://127.0.0.1:27017/eshop` |
| `CLIENT_URL` | Exact frontend origin for CORS & Cookies | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `eshop_super_secret_jwt_key_2026_change_in_production` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `COOKIE_SECRET` | Secret for signed cookie parsing | `eshop_secure_cookie_secret_key_2026` |
| `ADMIN_NAME` | Initial administrator display name | `Admin` |
| `ADMIN_EMAIL` | Initial administrator login email | `admin@eshop.com` |
| `ADMIN_PASSWORD` | Initial administrator password | `adminpassword123` |

---

## 5. Database Setup & Seeding

The backend includes a seed script that populates the database with demo products, categories, the default customer account, and admin credentials.

To seed the database:
```bash
npm run seed
```

### What the Seed Script Performs:
- **Categories**: Creates all 5 categories (`Electronics`, `Fashion`, `Home & Living`, `Accessories`, `Beauty`).
- **Products**: Seeds full product catalog with variants, specifications, images, and inventory.
- **Customer Account**: Creates `alex.morgan@example.com` / `demopassword123`.
- **Admin Account**: Creates `admin@eshop.com` / `adminpassword123` (or values from `.env`).
- **Sample Order**: Recreates `ORD-782910` for customer account order history.
- **Sample Reviews**: Seeds verified reviews on featured products.
- **Idempotent**: Safe to re-run; will update or preserve existing records without duplicates.

---

## 6. Administrator Account

An administrator account can be created via `npm run seed` using the credentials in your `.env` file:
- **Email**: `admin@eshop.com` (or value of `ADMIN_EMAIL`)
- **Password**: `adminpassword123` (or value of `ADMIN_PASSWORD`)

> **Security Note**: Public registration (`POST /api/auth/register`) enforces `role: 'customer'` and rejects attempts to self-assign the `admin` role.

---

## 7. Running the Application

### Running the Backend

In development mode with auto-reload (Nodemon):
```bash
cd backend
npm run dev
```

In production mode:
```bash
cd backend
npm start
```
The backend starts on `http://localhost:5000`.

### Running the Frontend

In a separate terminal:
```bash
cd frontend
npm run dev
```
The frontend starts on `http://localhost:3000`.

---

## 8. API Documentation & Request Examples

### Health Check
- `GET /api/health` — Checks API server health and uptime.

### Authentication Endpoints (`/api/auth`)

#### 1. Register Customer
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Jordan Miller",
    "email": "jordan@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user": {
      "id": "67...",
      "name": "Jordan Miller",
      "email": "jordan@example.com",
      "role": "customer",
      "addresses": []
    },
    "token": "eyJhbGciOi..."
  }
  ```

#### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "alex.morgan@example.com",
    "password": "demopassword123"
  }
  ```

#### 3. Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>` (or HttpOnly cookie)

#### 4. Update Profile
- **Endpoint**: `PUT /api/auth/profile`
- **Request Body**: `{ "name": "Alex M.", "phone": "+1 (555) 000-1111" }`

#### 5. Add Address
- **Endpoint**: `POST /api/auth/addresses`
- **Request Body**:
  ```json
  {
    "fullName": "Alex Morgan",
    "addressLine1": "123 Main St",
    "apartment": "Apt 2B",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101",
    "country": "United States",
    "isDefault": true
  }
  ```

#### 6. Delete Address
- **Endpoint**: `DELETE /api/auth/addresses/:id`

---

### Product Endpoints (`/api/products`)

#### 1. List Products (Filtering, Search, Sorting & Pagination)
- **Endpoint**: `GET /api/products`
- **Query Parameters**:
  - `category`: Category slug (e.g., `electronics`, `fashion`)
  - `search`: Search query string
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `minRating`: Minimum rating (1.0 - 5.0)
  - `inStockOnly`: `true` to filter out-of-stock items
  - `sortBy`: `featured` | `price-asc` | `price-desc` | `rating` | `newest`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12)
- **Response**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": {
      "total": 32,
      "page": 1,
      "limit": 12,
      "totalPages": 3
    }
  }
  ```

#### 2. Get Product by ID
- **Endpoint**: `GET /api/products/:id` (Accepts string ID e.g. `prod-elec-1` or Mongo ObjectId)

#### 3. Featured Products
- **Endpoint**: `GET /api/products/featured?limit=4`

#### 4. Trending & New Arrivals
- **Endpoint**: `GET /api/products/trending?limit=4`

#### 5. Related Products
- **Endpoint**: `GET /api/products/related?category=Electronics&currentId=prod-elec-1&limit=4`

#### 6. Product Reviews
- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews` (Requires auth, verified purchaser check)

---

### Category Endpoints (`/api/categories`)
- `GET /api/categories` — Returns categories with dynamic item counts.
- `GET /api/categories/:slug` — Single category details.

---

### Cart Endpoints (`/api/cart`)
*Requires Authentication*
- `GET /api/cart` — Authoritative cart with verified live prices & stock.
- `POST /api/cart/items` — Add item `{ "productId": "prod-elec-1", "quantity": 1, "variant": { "name": "Matte Charcoal" } }`.
- `PATCH /api/cart/items/:itemId` — Update quantity `{ "quantity": 3 }`.
- `DELETE /api/cart/items/:itemId` — Remove item.
- `DELETE /api/cart` — Clear cart.
- `POST /api/cart/merge` — Merge guest items after customer signs in `{ "items": [ ... ] }`.

---

### Wishlist Endpoints (`/api/wishlist`)
*Requires Authentication*
- `GET /api/wishlist` — Retrieve customer wishlist.
- `POST /api/wishlist/items` — Add product `{ "productId": "prod-elec-1" }`.
- `DELETE /api/wishlist/items/:productId` — Remove product.
- `DELETE /api/wishlist` — Clear wishlist.

---

### Order Endpoints (`/api/orders`)

#### 1. Place Order
- **Endpoint**: `POST /api/orders`
- **Request Body**:
  ```json
  {
    "customer": {
      "fullName": "Alex Morgan",
      "email": "alex.morgan@example.com",
      "phone": "+1 (555) 392-8172"
    },
    "shippingAddress": {
      "fullName": "Alex Morgan",
      "addressLine1": "742 Evergreen Terrace",
      "apartment": "Apt 4B",
      "city": "Portland",
      "state": "OR",
      "postalCode": "97201",
      "country": "United States"
    },
    "shippingMethod": {
      "name": "Standard Insured Delivery",
      "price": 0
    },
    "paymentMethod": {
      "type": "card",
      "cardBrand": "Visa",
      "last4": "4242"
    },
    "items": [
      {
        "id": "prod-elec-1-Matte Charcoal",
        "product": { "id": "prod-elec-1" },
        "quantity": 1
      }
    ]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "id": "ORD-492019",
      "status": "Processing",
      "trackingNumber": "TRK-USPS-82910381",
      "estimatedDelivery": "Oct 22, 2026",
      "pricing": {
        "subtotal": 199.99,
        "discount": 0,
        "shipping": 0,
        "tax": 16.00,
        "total": 215.99
      }
    }
  }
  ```

#### 2. Get My Orders
- `GET /api/orders/my-orders` — Returns list of orders belonging to logged-in user.

#### 3. Get Order by ID
- `GET /api/orders/:id` — Details for specific order number or ID.

---

### Protected Admin Endpoints (`/api/admin`)
*Requires Admin Role*
- `GET /api/admin/stats` — Dashboard statistics (Revenue, Total Orders, Customers, Products, Recent Orders).
- `POST /api/admin/products` — Create new catalog product.
- `PUT /api/admin/products/:id` — Update existing product.
- `DELETE /api/admin/products/:id` — Soft deactivate product.
- `PATCH /api/admin/products/:id/stock` — Rapid stock level adjustment `{ "stockCount": 25 }`.
- `GET /api/admin/orders` — View and paginate all customer orders.
- `PATCH /api/admin/orders/:id/status` — Update order fulfillment state (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- `GET /api/admin/users` — List registered customer accounts.
- `POST /api/admin/categories` — Create category.

---

## 9. Authentication & Security

- **HttpOnly Cookies**: Prevents Cross-Site Scripting (XSS) attacks by keeping session tokens inaccessible to JavaScript `document.cookie`.
- **Bearer Token Support**: If cookies are blocked or cross-origin headers are preferred, the API simultaneously returns and honors `Authorization: Bearer <token>`.
- **CORS Protection**: Explicitly restricts origins to `http://localhost:3000` (configurable via `CLIENT_URL`) with `credentials: true`.
- **Rate Limiting**: Protects brute-force attacks on `/api/auth/login`, `/api/auth/register`, and `/api/auth/forgot-password`.
- **Password Hashes**: Uses `bcryptjs` with salt work factor of 10. Password fields are marked with `select: false` so hashes are never returned in queries or serialization.

---

## 10. Checkout & Inventory Consistency

1. **Server-Authoritative Pricing**: The server never trusts client-submitted prices or totals. Every item's unit price is resolved directly from MongoDB records.
2. **Atomic Inventory Decrements**: Inventory is decremented using atomic conditional queries:
   ```javascript
   Product.findOneAndUpdate(
     { _id: productId, stockCount: { $gte: requestedQuantity } },
     { $inc: { stockCount: -requestedQuantity } }
   );
   ```
   If inventory is insufficient during parallel checkout attempts, the operation rejects and rolls back any prior item deductions safely.
3. **Immutable Snapshots**: Product titles, images, categories, and purchased prices are snapshotted on the order record, ensuring historical order accuracy even if product prices or details change later.
4. **Promo Codes**: Validated on the server:
   - `WELCOME10`: 10% discount off subtotal.
   - `ESHOP20`: $20 off orders with subtotal >= $100.
   - `FREESHIP`: Free express/standard delivery.

---

## 11. Testing & Verification

Run the automated test suite:
```bash
npm test
```
The test suite validates:
- Password hashing and JWT generation/verification
- Server-authoritative pricing calculations and promo code rules
- Free shipping threshold and sales tax computations
- Registration and duplicate email prevention
- Access control and admin authorization protection

---

## 12. Troubleshooting & FAQ

### 1. `MongoDB connection failed`
- Make sure MongoDB is running locally (`mongod` or MongoDB Windows service).
- If using MongoDB Atlas, verify your connection URI in `backend/.env` and ensure your current IP address is whitelisted in Atlas Network Access.

### 2. `CORS error in browser console`
- Verify that `CLIENT_URL` in `backend/.env` matches your frontend origin (default: `http://localhost:3000`).

### 3. Frontend displays mock data instead of database items
- Check if the backend is running on `http://localhost:5000`. You can test it by visiting `http://localhost:5000/api/health`.
- If the backend is running and seeded, the frontend automatically fetches real MongoDB data. If the backend is offline, the frontend falls back gracefully to offline mode.
