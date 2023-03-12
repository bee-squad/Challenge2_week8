import express, { Router } from 'express';
import { protect } from '../controllers/authController';
import { getAllEvents, createEvent, deleteEventByWeekday } from '../controllers/eventController';

const router: Router = express.Router();

router
  .route('/')
  .get(protect, getAllEvents)
  .post(protect, createEvent)
  .delete(protect, deleteEventByWeekday);

export default router;
