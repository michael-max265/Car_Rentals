// server/src/routes/admin.js
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getStats, listUsers, updateUser, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes are protected
router.use(verifyToken);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
