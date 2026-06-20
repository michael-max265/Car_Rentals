import express from 'express';
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} from '../controllers/carController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCars);
router.get('/:id', getCarById);
router.post('/', verifyToken, createCar);
router.put('/:id', verifyToken, updateCar);
router.delete('/:id', verifyToken, deleteCar);

export default router;
