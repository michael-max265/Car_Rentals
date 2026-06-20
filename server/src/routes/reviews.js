import express from 'express';
import { addReview, getCarReviews } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:carId', getCarReviews);
router.post('/', verifyToken, addReview);

export default router;
