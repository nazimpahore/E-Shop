import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Protect routes: requires valid JWT in cookie or Authorization header
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please sign in.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Invalid or expired session. Please sign in again.', 401);
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'Account no longer exists.', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Authentication failed.', 500);
  }
};

/**
 * Optional authentication: attaches user if token is present, does not reject if missing
 */
export const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await User.findById(decoded.id);
        if (user && user.status !== 'suspended') {
          req.user = user;
        }
      } catch (err) {
        // ignore
      }
    }
  }

  next();
};

/**
 * Authorize specific roles (e.g., 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Administrator privileges required.', 403);
    }

    next();
  };
};
