import express from 'express';
import {
  createBooking,
  getBookings,
  cancelBooking,
  getBookingsByCarId,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getBookings);
router.get('/car/:carId', getBookingsByCarId); // public — only returns date ranges
router.put('/:id/cancel', verifyToken, cancelBooking);
router.put('/:id/status', verifyToken, updateBookingStatus);

export default router;
