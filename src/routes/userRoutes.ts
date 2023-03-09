import express, { Router } from 'express';
import { signUp } from '../controllers/userController';

const router: Router = express.Router();

router.post('/signUp', signUp);

export default router;
