import express, { Router } from 'express';
import {
  signUp,
  getAllUsers,
  signIn,
  deleteUser,
  updateUser,
  updatePassword
} from '../controllers/userController';
import { protect } from '../controllers/authController';

const router: Router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.delete('/', protect, deleteUser);
router.patch('/', protect, updateUser);
router.patch('/updatePassword', protect, updatePassword);

// Test Auth Middleware (protect)
router.get('/', protect, getAllUsers);

export default router;
