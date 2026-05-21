import { Router } from 'express';
import { getTasks, createTask, getTaskById, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getTasks);
router.post('/', protect, authorize('admin'), createTask);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('admin'), deleteTask);

export default router;
