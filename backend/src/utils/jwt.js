import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eshop_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a user payload
 */
export const generateToken = (userId, role = 'customer') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Cookie Configuration for Auth Token
 */
export const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

/**
 * Set auth cookie on Express response
 */
export const setAuthCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

/**
 * Clear auth cookie
 */
export const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0
  });
};
