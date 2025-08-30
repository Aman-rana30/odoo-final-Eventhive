import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import userRepository from '../repositories/userRepository.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No authorization token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('🔑 Token decoded:', { id: decoded.id, email: decoded.email, roles: decoded.roles });
    
    const user = await userRepository.findById(decoded.id);
    
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive:', { userId: decoded.id, userFound: !!user, isActive: user?.isActive });
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
    
    console.log('✅ User authenticated:', { id: req.user.id, email: req.user.email, roles: req.user.roles });
    next();
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorization check for roles:', roles);
    console.log('👤 User roles:', req.user?.roles);
    
    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));
    console.log('✅ Has required role:', hasRole);
    
    if (!hasRole) {
      console.log('❌ User does not have required roles');
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    console.log('✅ Authorization passed');
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