import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/Users.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {

      const decoded = jwt.verify(token, jwtSecret);
        console.log(decoded)

        req.user = decoded;

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const isAdminMiddleware = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
      }
      next();
    } catch (error) {
      console.error('Error checking user role:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
