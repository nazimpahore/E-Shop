import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from '../src/config/db.js';
import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';
import { User } from '../src/models/User.js';
import { Order } from '../src/models/Order.js';
import { Review } from '../src/models/Review.js';
import { Cart } from '../src/models/Cart.js';
import { Wishlist } from '../src/models/Wishlist.js';
import { CATEGORIES, PRODUCTS } from '../src/utils/seedData.js';

const cleanAndSeed = async () => {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  const conn = await connectDB();

  if (!conn) {
    console.error('[Seed Error] Could not establish MongoDB connection.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Purging all old demo accounts and demo data...');
    // 1. Remove all customer demo accounts, orders, reviews, carts, wishlists
    const deletedUsers = await User.deleteMany({ role: 'customer' });
    const deletedOrders = await Order.deleteMany({});
    const deletedReviews = await Review.deleteMany({});
    const deletedCarts = await Cart.deleteMany({});
    const deletedWishlists = await Wishlist.deleteMany({});
    console.log(`[Seed] Removed ${deletedUsers.deletedCount} demo customer accounts.`);
    console.log(`[Seed] Removed ${deletedOrders.deletedCount} demo orders.`);
    console.log(`[Seed] Removed ${deletedReviews.deletedCount} demo reviews.`);

    // 2. Remove old products and categories
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('[Seed] Cleared existing product catalog and categories.');

    // 3. Seed Fresh Categories
    console.log(`[Seed] Seeding ${CATEGORIES.length} fresh categories...`);
    for (const cat of CATEGORIES) {
      await Category.create({
        id: cat.id || cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        itemCount: cat.itemCount || 0,
        isActive: true
      });
    }
    console.log('[Seed] Categories seeded successfully.');

    // 4. Seed Fresh Products
    console.log(`[Seed] Seeding ${PRODUCTS.length} brand-new products...`);
    for (const prod of PRODUCTS) {
      await Product.create({
        ...prod,
        inStock: prod.stockCount > 0,
        isActive: true
      });
    }
    console.log('[Seed] New products seeded successfully.');

    // 5. Ensure Admin Account Exists (configured via .env)
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eshop.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const adminName = process.env.ADMIN_NAME || 'Admin';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log(`[Seed] Admin account ready: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Admin account verified: ${adminEmail}`);
    }

    console.log('=====================================================');
    console.log('✅ ALL DEMO DATA PURGED & NEW PRODUCTS SEEDED CLEANLY');
    console.log('=====================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to clean and seed database:', err);
    process.exit(1);
  }
};

cleanAndSeed();
