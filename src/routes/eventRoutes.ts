import express, { Router } from 'express';
import { protect } from '../controllers/authController';
import {
  getEvents,
  createEvent,
  deleteEvents
} from '../controllers/eventController';

const router: Router = express.Router();

router
  .route('/')
  .get(protect, getEvents)
  .post(protect, createEvent)
  .delete(protect, deleteEvents);

export default router;
