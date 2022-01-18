import express from 'express';
const router = express.Router();
import MainController from '../Controllers/MainController';
router.route('/').get(MainController)

export default router;
