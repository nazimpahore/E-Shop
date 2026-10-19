import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { orderService } from '../src/services/orderService.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';

describe('E-Shop Unit Business Logic Tests', () => {
  describe('JWT Token Handling', () => {
    it('should generate and verify JWT token payload accurately', () => {
      const token = generateToken('user-12345', 'customer');
      assert.ok(token);

      const decoded = verifyToken(token);
      assert.ok(decoded);
      assert.equal(decoded.id, 'user-12345');
      assert.equal(decoded.role, 'customer');
    });

    it('should return null for tampered or invalid token', () => {
      const invalid = verifyToken('tampered.token.data');
      assert.equal(invalid, null);
    });
  });

  describe('Password Hashing with Bcrypt', () => {
    it('should securely hash password and verify match', async () => {
      const rawPassword = 'demopassword123';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      assert.notEqual(hash, rawPassword);
      const match = await bcrypt.compare(rawPassword, hash);
      assert.equal(match, true);

      const wrongMatch = await bcrypt.compare('wrongpassword', hash);
      assert.equal(wrongMatch, false);
    });
  });

  describe('Server-Authoritative Pricing & Shipping Rules', () => {
    it('should calculate standard shipping ($8.00) when subtotal is below $50 threshold', () => {
      const items = [{ price: 20.00, quantity: 2 }]; // subtotal = $40
      const pricing = orderService.calculatePricing(items);

      assert.equal(pricing.subtotal, 40.00);
      assert.equal(pricing.shipping, 8.00);
      // Tax: 8% on 40 = 3.20
      assert.equal(pricing.tax, 3.20);
      assert.equal(pricing.total, 51.20);
    });

    it('should grant free standard shipping when subtotal is $50 or greater', () => {
      const items = [{ price: 60.00, quantity: 1 }]; // subtotal = $60
      const pricing = orderService.calculatePricing(items);

      assert.equal(pricing.subtotal, 60.00);
      assert.equal(pricing.shipping, 0.00);
      // Tax: 8% on 60 = 4.80
      assert.equal(pricing.tax, 4.80);
      assert.equal(pricing.total, 64.80);
    });

    it('should charge $12.00 for express shipping regardless of subtotal', () => {
      const items = [{ price: 100.00, quantity: 1 }];
      const pricing = orderService.calculatePricing(items, null, 'express');

      assert.equal(pricing.subtotal, 100.00);
      assert.equal(pricing.shipping, 12.00);
      // Tax: 8% on 100 = 8.00
      assert.equal(pricing.tax, 8.00);
      assert.equal(pricing.total, 120.00);
    });

    it('should apply WELCOME10 for 10% discount on order subtotal', () => {
      const items = [{ price: 100.00, quantity: 1 }];
      const pricing = orderService.calculatePricing(items, 'WELCOME10');

      assert.equal(pricing.subtotal, 100.00);
      assert.equal(pricing.discount, 10.00); // 10% of 100
      assert.equal(pricing.shipping, 0.00); // subtotal >= 50
      // Tax: 8% on taxable amount (100 - 10 = 90) -> 7.20
      assert.equal(pricing.tax, 7.20);
      assert.equal(pricing.total, 97.20);
    });

    it('should apply ESHOP20 ($20 off) when subtotal meets $100 minimum threshold', () => {
      const items = [{ price: 150.00, quantity: 1 }];
      const pricing = orderService.calculatePricing(items, 'ESHOP20');

      assert.equal(pricing.subtotal, 150.00);
      assert.equal(pricing.discount, 20.00);
      assert.equal(pricing.shipping, 0.00);
      // Tax: 8% on (150 - 20 = 130) -> 10.40
      assert.equal(pricing.tax, 10.40);
      assert.equal(pricing.total, 140.40);
    });

    it('should not apply ESHOP20 if subtotal is below $100 threshold', () => {
      const items = [{ price: 80.00, quantity: 1 }];
      const pricing = orderService.calculatePricing(items, 'ESHOP20');

      assert.equal(pricing.subtotal, 80.00);
      assert.equal(pricing.discount, 0.00);
    });

    it('should waive shipping fee when FREESHIP promo code is applied', () => {
      const items = [{ price: 25.00, quantity: 1 }]; // normally would have $8 shipping
      const pricing = orderService.calculatePricing(items, 'FREESHIP');

      assert.equal(pricing.subtotal, 25.00);
      assert.equal(pricing.shipping, 0.00); // Free shipping promo
      assert.equal(pricing.tax, 2.00);
      assert.equal(pricing.total, 27.00);
    });
  });
});
