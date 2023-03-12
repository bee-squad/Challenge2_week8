import express, { Router } from 'express';
import { protect } from '../controllers/authController';
import { getAllEvents, createEvent, getEventById } from '../controllers/eventController';

const router: Router = express.Router();

router.post('/', protect, createEvent);
router.get('/', protect, getAllEvents);
router.get('/:id', protect, getEventById);

export default router;
