import rateLimiter from 'express-rate-limit';
import User from '../models/Users.js';
import messages from '../variables/messages.js';
import { ActivitiesEmail } from '../utils/nodemailer.js';

export const loginRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again after 1 hour' },


  handler: async (req, res, options) => {
      const { identifier } = req.body;
      
      try {
          const user = await User.findOne({
              $or: [{ email: identifier }, { username: identifier }],
            });
            
            console.log(user)
      if (!user) {
        return res.status(429).json({ success: false, message: 'User not found' });
      }

      const emailContent = messages.failedLoginAttemptsEmail(user.username);
      ActivitiesEmail(user.email, messages.failedLoginAttemptsSubject, emailContent);      
      console.log("Suspension email sent to", user.email);

    } catch (error) {
      console.error("Error finding user or sending email:", error);
      res.status(500).json({ success: false, message: 'An error occurred' });
    }
  },
});

export const logIpAddress = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Request IP Address: ${ip}`);
    next();
  };
