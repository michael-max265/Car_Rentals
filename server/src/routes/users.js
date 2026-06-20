import express from 'express';
import {
  createUser,
  getUser,
  updateUser,
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', verifyToken, getUser);
router.put('/:id', verifyToken, updateUser);

export default router;
