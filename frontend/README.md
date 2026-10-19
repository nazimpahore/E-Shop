# E-Shop — Modern E-Commerce Web Application

A modern, high-performance, and responsive e-commerce storefront built with **React (JavaScript / JSX)** and **Tailwind CSS**.

## ✨ Features

- **Storefront & Catalog**:
  - Hero showcase with featured collections and promotional announcements.
  - Category browse (Electronics, Fashion, Home & Living, Accessories, Beauty).
  - Advanced search, live category filters, price ranges, star ratings, and sorting (price, newest, ratings).
  - Responsive product cards with image error fallbacks, discount badges, and quick-add actions.
- **Product Details**:
  - Multi-image gallery with interactive preview thumbnails.
  - Variant selectors (colors, sizes) with live stock indicator.
  - Tabbed information (Overview, Detailed Specifications, Shipping & Returns, Customer Reviews).
  - Related product recommendations carousel/grid.
- **Shopping Cart & Checkout Flow**:
  - Real-time cart drawer and dedicated cart page with quantity increment/decrement.
  - Promo code support (e.g. `WELCOME10` for 10% off).
  - Dynamic subtotal, tax calculation, and free shipping threshold ($50+).
  - Complete multi-step checkout form with address validation and instant order placement.
- **Customer Account & Wishlist**:
  - Saved wishlist with instant toggle and "Move to Cart" action.
  - Order history tracking with status stages (Processing, Shipped, Delivered) and tracking numbers.
  - Profile management and address book management.
  - Authentication flow (Sign in, Registration, Forgot Password) with prefilled demo buttons.
- **Global Feedback**:
  - Responsive toast notification system for instant feedback on user actions.

## 🛠️ Tech Stack

- **Framework**: React 19 (JavaScript JSX)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Build Tool**: Vite 8 (ESM, pure JavaScript configuration)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```text
E-Shop/
├── index.html                 # HTML Entry point
├── vite.config.js             # Vite configuration (Pure JavaScript)
├── package.json               # Project scripts & dependencies
└── src/
    ├── main.jsx               # Application mount point
    ├── App.jsx                # Router & root layout
    ├── index.css              # Global styles & Tailwind imports
    ├── components/
    │   ├── common/            # Breadcrumbs, ProductCard, ProductGrid, RatingStars, EmptyState
    │   └── layout/            # Navbar, Footer
    ├── context/               # AuthContext, CartContext, WishlistContext, ToastContext
    ├── data/                  # Realistic catalog mock products & categories
    ├── pages/                 # Home, Shop, ProductDetail, Cart, Checkout, Account, etc.
    └── services/              # API abstraction service layer
```
