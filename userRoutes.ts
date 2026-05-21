import { Router } from 'express';
import { getUsers, getUserById, updateProfile, updateUserById } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getUsers);
router.put('/profile', protect, updateProfile);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('admin'), updateUserById);

export default router;
