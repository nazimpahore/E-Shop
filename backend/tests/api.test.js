import { describe, it, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';

let mongoServer;

describe('E-Shop Complete Backend Test Suite', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_for_automated_testing_123';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('1. Authentication & Security Flow', () => {
    it('should register a new customer successfully and return token and user object', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'password123'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, 'sarah@example.com');
      assert.equal(res.body.user.role, 'customer');
      assert.equal(res.body.user.password, undefined); // password must never be returned!
      assert.ok(res.body.token);

      // Verify cookie is set
      const cookies = res.headers['set-cookie'];
      assert.ok(cookies && cookies.some((c) => c.includes('token=')));
    });

    it('should prevent public registration from assigning admin role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Bob',
          email: 'bob@example.com',
          password: 'password123',
          role: 'admin' // Attempt privilege escalation
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, 'customer'); // Must be customer!
    });

    it('should reject registration with duplicate email address', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Sarah',
          email: 'sarah@example.com',
          password: 'password456'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should log in an existing customer with valid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          password: 'demopassword123'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.morgan@example.com',
          password: 'demopassword123'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.name, 'Alex Morgan');
      assert.ok(res.body.token);
    });

    it('should reject login with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          password: 'demopassword123'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex.morgan@example.com',
          password: 'wrongpassword'
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  describe('2. Products & Categories Catalog Flow', () => {
    beforeEach(async () => {
      await Category.create([
        { id: 'electronics', name: 'Electronics', slug: 'electronics' },
        { id: 'fashion', name: 'Fashion', slug: 'fashion' }
      ]);

      await Product.create([
        {
          id: 'prod-elec-1',
          name: 'AcousticPro Wireless Headphones',
          category: 'Electronics',
          categorySlug: 'electronics',
          price: 199.99,
          stockCount: 15,
          inStock: true,
          rating: 4.8,
          isFeatured: true,
          isTrending: true,
          images: ['https://example.com/headphone.jpg'],
          shortDescription: 'Studio sound with ANC',
          description: 'Long description of AcousticPro'
        },
        {
          id: 'prod-fash-1',
          name: 'Organic Cotton Crewneck T-Shirt',
          category: 'Fashion',
          categorySlug: 'fashion',
          price: 38.00,
          stockCount: 20,
          inStock: true,
          rating: 4.5,
          isFeatured: false,
          isNew: true,
          images: ['https://example.com/tshirt.jpg'],
          shortDescription: '100% GOTS organic cotton'
        }
      ]);
    });

    it('should list all products with pagination and category metadata', async () => {
      const res = await request(app).get('/api/products');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 2);
      assert.equal(res.body.pagination.total, 2);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/products?category=electronics');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].id, 'prod-elec-1');
    });

    it('should search products by text query', async () => {
      const res = await request(app).get('/api/products?search=Cotton');
      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].id, 'prod-fash-1');
    });

    it('should retrieve a single product by custom string ID matching frontend', async () => {
      const res = await request(app).get('/api/products/prod-elec-1');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'prod-elec-1');
      assert.equal(res.body.data.price, 199.99);
    });

    it('should retrieve categories with accurate live item count', async () => {
      const res = await request(app).get('/api/categories');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 2);
      const elecCat = res.body.data.find((c) => c.slug === 'electronics');
      assert.equal(elecCat.itemCount, 1);
    });
  });

  describe('3. Cart & Wishlist API Flow', () => {
    let customerToken;
    let customerId;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      customerToken = reg.body.token;
      customerId = reg.body.user.id;

      await Product.create({
        id: 'prod-cart-1',
        name: 'Smart Watch',
        category: 'Electronics',
        categorySlug: 'electronics',
        price: 149.00,
        stockCount: 5,
        inStock: true
      });
    });

    it('should add item to user cart and verify live pricing', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 'prod-cart-1',
          quantity: 2
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.items.length, 1);
      assert.equal(res.body.data.items[0].quantity, 2);
      assert.equal(res.body.data.subtotal, 298.00);
    });

    it('should reject adding more quantity than available stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 'prod-cart-1',
          quantity: 10 // stockCount is 5
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should toggle and manage user wishlist', async () => {
      // Add to wishlist
      const addRes = await request(app)
        .post('/api/wishlist/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: 'prod-cart-1' });

      assert.equal(addRes.status, 200);
      assert.equal(addRes.body.data.length, 1);
      assert.equal(addRes.body.data[0].id, 'prod-cart-1');

      // Remove from wishlist
      const remRes = await request(app)
        .delete('/api/wishlist/items/prod-cart-1')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(remRes.status, 200);
      assert.equal(remRes.body.data.length, 0);
    });
  });

  describe('4. Order Placement & Inventory Concurrency Flow', () => {
    let customerToken;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123'
        });
      customerToken = reg.body.token;

      await Product.create({
        id: 'prod-order-1',
        name: 'Minimalist Mechanical Keyboard',
        category: 'Electronics',
        categorySlug: 'electronics',
        price: 100.00,
        stockCount: 3,
        inStock: true
      });
    });

    it('should calculate server-authoritative totals and atomically decrement stock upon checkout', async () => {
      const orderPayload = {
        customer: {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 555 123 4567'
        },
        shippingAddress: {
          fullName: 'Jane Smith',
          addressLine1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States'
        },
        shippingMethod: {
          name: 'Standard Insured Delivery',
          price: 0
        },
        paymentMethod: {
          type: 'cod'
        },
        items: [
          {
            id: 'prod-order-1-standard',
            product: { id: 'prod-order-1' },
            quantity: 2
          }
        ]
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderPayload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id.startsWith('ORD-'));
      assert.equal(res.body.data.pricing.subtotal, 200.00);
      // Subtotal >= 50 qualifies for free shipping
      assert.equal(res.body.data.pricing.shipping, 0);
      // 8% tax on 200 = 16
      assert.equal(res.body.data.pricing.tax, 16.00);
      assert.equal(res.body.data.pricing.total, 216.00);

      // Verify stock was reduced from 3 to 1
      const productInDb = await Product.findOne({ id: 'prod-order-1' });
      assert.equal(productInDb.stockCount, 1);
      assert.equal(productInDb.inStock, true);
    });

    it('should prevent overselling when requested quantity exceeds remaining inventory', async () => {
      const orderPayload = {
        customer: {
          fullName: 'Jane Smith',
          email: 'jane@example.com'
        },
        shippingAddress: {
          fullName: 'Jane Smith',
          addressLine1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105'
        },
        items: [
          {
            id: 'prod-order-1-standard',
            product: { id: 'prod-order-1' },
            quantity: 5 // Stock is only 3
          }
        ]
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderPayload);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Insufficient stock/);
    });
  });

  describe('5. Access Control & Admin API Protection', () => {
    let customerToken;
    let adminToken;

    beforeEach(async () => {
      // Customer
      const custRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Regular Customer',
          email: 'customer@example.com',
          password: 'password123'
        });
      customerToken = custRes.body.token;

      // Admin directly created in DB
      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'adminpassword123'
        });
      adminToken = loginRes.body.token;
    });

    it('should forbid customer from accessing admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('should allow admin to access dashboard stats and manage stock', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.hasOwnProperty('totalProducts'));
      assert.ok(res.body.data.hasOwnProperty('totalRevenue'));
    });
  });
});
