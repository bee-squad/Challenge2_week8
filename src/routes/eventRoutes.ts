import express, { Router } from 'express'
import { protect } from '../controllers/authController'
import { getAllEvents } from '../controllers/eventController'

const router: Router = express.Router()

router.get('/', protect, getAllEvents)

export default router
