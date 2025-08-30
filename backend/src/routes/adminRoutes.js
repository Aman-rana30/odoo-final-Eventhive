import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import adminService from '../services/adminService.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', authenticate, authorize('Admin'), async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// User management
router.get('/users', authenticate, authorize('Admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await adminService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Update user role
router.patch('/users/:id/role', authenticate, authorize('Admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    
    const user = await adminService.updateUserRole(id, roles);
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

export default router;