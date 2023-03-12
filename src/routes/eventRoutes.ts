import express, { Router } from 'express';
import { protect } from '../controllers/authController';
import { getAllEvents, createEvent, deleteEventByWeekday} from '../controllers/eventController';

const router: Router = express.Router();

router.post('/', protect, createEvent);

router.get('/', protect, getAllEvents);

router.delete('/:weekday', protect, deleteEventByWeekday);

export default router;
