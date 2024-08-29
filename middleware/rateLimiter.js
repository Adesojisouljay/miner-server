import rateLimiter from 'express-rate-limit';

export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again later in 15 minutes' },
});
