import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

/**
 * Validates request schema and returns formatted 400 errors if invalid
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(res, errorList[0].message, 400, errorList);
  }
  next();
};
