import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const authController = {
  /**
   * Register a new customer
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return sendError(res, 'An account with this email address already exists.', 400);
      }

      // Customer role is enforced; public registration cannot grant admin
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'customer'
      });

      const token = generateToken(user._id, user.role);
      setAuthCookie(res, token);

      const userJson = user.toJSON();

      return sendSuccess(
        res,
        {
          user: userJson,
          token
        },
        'Registration successful',
        201,
        // Match frontend's top-level user & token keys if destructured directly:
        { user: userJson, token }
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login with email and password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      if (user.status === 'suspended') {
        return sendError(res, 'This account has been suspended.', 403);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password.', 401);
      }

      const token = generateToken(user._id, user.role);
      setAuthCookie(res, token);

      const userJson = user.toJSON();

      return sendSuccess(
        res,
        {
          user: userJson,
          token
        },
        'Login successful',
        200,
        { user: userJson, token }
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout user and clear cookie
   */
  async logout(req, res) {
    clearAuthCookie(res);
    return sendSuccess(res, null, 'Logged out successfully');
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res) {
    return sendSuccess(res, { user: req.user.toJSON() }, 'Profile retrieved', 200, {
      user: req.user.toJSON()
    });
  },

  /**
   * Update profile details (name, phone, email)
   */
  async updateProfile(req, res, next) {
    try {
      const { name, phone } = req.body;
      const user = req.user;

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      await user.save();

      const userJson = user.toJSON();
      return sendSuccess(res, { user: userJson }, 'Profile updated successfully', 200, {
        user: userJson
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Add shipping address to profile
   */
  async addAddress(req, res, next) {
    try {
      const user = req.user;
      const {
        fullName,
        addressLine1,
        apartment,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault
      } = req.body;

      const shouldBeDefault = isDefault || user.addresses.length === 0;

      if (shouldBeDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }

      user.addresses.push({
        fullName,
        addressLine1,
        apartment: apartment || '',
        city,
        state,
        postalCode,
        country: country || '',
        phone: phone || '',
        isDefault: shouldBeDefault
      });

      await user.save();
      const userJson = user.toJSON();

      return sendSuccess(res, { user: userJson }, 'Address saved successfully', 200, {
        user: userJson
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update address in profile
   */
  async updateAddress(req, res, next) {
    try {
      const user = req.user;
      const addressId = req.params.id;
      const {
        fullName,
        addressLine1,
        apartment,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault
      } = req.body;

      const addressIndex = user.addresses.findIndex((a) => a.id === addressId);
      if (addressIndex === -1) {
        return sendError(res, 'Address not found', 404);
      }

      const shouldBeDefault = Boolean(isDefault);

      if (shouldBeDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }

      const target = user.addresses[addressIndex];
      user.addresses[addressIndex] = {
        id: addressId,
        fullName: fullName !== undefined ? fullName : target.fullName,
        addressLine1: addressLine1 !== undefined ? addressLine1 : target.addressLine1,
        apartment: apartment !== undefined ? apartment : target.apartment,
        city: city !== undefined ? city : target.city,
        state: state !== undefined ? state : target.state,
        postalCode: postalCode !== undefined ? postalCode : target.postalCode,
        country: country !== undefined ? country : target.country,
        phone: phone !== undefined ? phone : target.phone,
        isDefault: shouldBeDefault ? true : target.isDefault
      };

      if (!user.addresses.some((a) => a.isDefault) && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();
      const userJson = user.toJSON();

      return sendSuccess(res, { user: userJson }, 'Address updated successfully', 200, {
        user: userJson
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete address from profile
   */
  async deleteAddress(req, res, next) {
    try {
      const user = req.user;
      const addressId = req.params.id;

      user.addresses = user.addresses.filter((a) => a.id !== addressId);

      if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
        user.addresses[0].isDefault = true;
      }

      await user.save();
      const userJson = user.toJSON();

      return sendSuccess(res, { user: userJson }, 'Address removed successfully', 200, {
        user: userJson
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Request password reset token
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return success message to avoid user enumeration
      if (!user) {
        return sendSuccess(
          res,
          null,
          'If an account with that email exists, password reset instructions have been generated.'
        );
      }

      // Generate secure 32-byte hex token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      // In development mode, provide token in response for testing
      const isDev = process.env.NODE_ENV === 'development';
      return sendSuccess(
        res,
        isDev ? { devResetToken: resetToken } : null,
        'If an account with that email exists, password reset instructions have been generated.'
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return sendError(res, 'Password reset token is invalid or has expired.', 400);
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.');
    } catch (err) {
      next(err);
    }
  }
};
