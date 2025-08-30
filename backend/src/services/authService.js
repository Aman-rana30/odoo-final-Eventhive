import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import userRepository from '../repositories/userRepository.js';

class AuthService {
  async registerUser({ name, email, phone, password, roles = ['Attendee'] }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const existingPhone = await userRepository.findByPhone(phone);
    if (existingPhone) {
      throw new Error('User already exists with this phone number');
    }

    // Create user
    const userData = {
      name,
      email,
      phone,
      passwordHash: password, // Will be hashed in pre-save hook
      roles
    };

    const user = await userRepository.create(userData);
    
    // Generate referral code
    user.referralCode = user.generateReferralCode();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);
    
    // Update refresh token
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async loginUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);
    
    // Update refresh token
    await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      const user = await userRepository.findById(decoded.id);
      
      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);
      
      // Update refresh token
      await userRepository.updateRefreshToken(user._id, tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logoutUser(refreshToken) {
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
        await userRepository.clearRefreshToken(decoded.id);
      } catch (error) {
        // Token invalid, but that's fine for logout
      }
    }
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId, updateData) {
    const user = await userRepository.update(userId, updateData);
    return this.sanitizeUser(user);
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRE }
    );

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const { passwordHash, refreshToken, ...sanitized } = user.toObject();
    return sanitized;
  }
}

export default new AuthService();