// Response Utility - Standardized API responses
// All services will return responses in the same format

import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Send success response
 * @example sendSuccess(res, { user: userData }, 'User created successfully')
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @example sendError(res, 'User not found', 404)
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @example sendPaginated(res, blogs, 100, 1, 10)
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response => {
  const response: PaginatedResponse<T> = {
    data,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit)
  };
  return res.status(200).json({
    success: true,
    ...response
  });
};
