import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/authController';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

export default router;
