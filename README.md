# 🛍️ E-Shop — Modern Full-Stack MERN E-Commerce Platform

A production-grade, responsive e-commerce web application built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js / Express**, and **MongoDB**.

---

## ✨ Features

- **Storefront & Catalog**: Browse products with live search, filters (category, price range, ratings, in-stock), and sorting.
- **Product Detail**: Multi-image galleries, specifications, stock indicators, and customer reviews.
- **Cart & Checkout**: Real-time subtotal calculation, promo codes, tax estimation, shipping options, and multiple payment methods (Card, PayPal, COD).
- **Address & Profile Management**: Add, edit, and delete multiple shipping addresses with custom Country and State/Province fields.
- **Authentication**: Secure JWT-based authentication, user profile management, and password reset flows.
- **Order Management & Tracking**: Real-time order placement, order status updates, and tracking numbers.
- **Unified Dev Experience**: Run both frontend and backend concurrently with a single command or double-click script.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7
- **Backend**: Node.js, Express, MongoDB / Mongoose, JWT, bcryptjs, Helmet, Express Rate Limit
- **Tooling**: Concurrently, Nodemon

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas free cluster)

### 2. Environment Setup

Create `.env` inside `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret_key
```

Create `.env` inside `frontend/`:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

### 3. Install Dependencies
From the root folder:
```bash
npm run install:all
```

### 4. Run Both Servers (Frontend + Backend)

#### Option A: Command Line
```bash
npm run dev
```

#### Option B: Windows Double-Click
Double-click `run-dev.bat` or `run-dev-split.bat`.

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs both backend & frontend concurrently in one terminal |
| `npm run dev:backend` | Runs backend only with nodemon |
| `npm run dev:frontend` | Runs frontend only with Vite |
| `npm run install:all` | Installs dependencies for root, backend, and frontend |
| `npm run build:frontend` | Creates optimized production build of the frontend |
| `npm run seed` | Seeds database with initial sample products and admin |

---

## 📄 License
ISC License
