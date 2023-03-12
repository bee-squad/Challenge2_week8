import express, { Router } from 'express';
import {
  signUp,
  getAllUsers,
  signIn,
  deleteUser
} from '../controllers/userController';
import { protect } from '../controllers/authController';

const router: Router = express.Router();

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.delete('/', protect, deleteUser);

// Test Auth Middleware (protect)
router.get('/', protect, getAllUsers);

export default router;
