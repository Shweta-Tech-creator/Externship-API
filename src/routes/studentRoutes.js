import express from 'express';
import { getFavorites, toggleFavorite } from '../controllers/studentController.js';

const router = express.Router();

router.get('/:studentId/favorites', getFavorites);
router.post('/:studentId/favorites', toggleFavorite);

export default router;
