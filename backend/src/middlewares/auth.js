import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import userRepository from '../repositories/userRepository.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userRepository.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          roles: user.roles
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};