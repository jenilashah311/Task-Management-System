import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.use(authenticate as any);

router.get('/me', userController.getMe    as any);
router.get('/',   userController.getUsers as any);

export default router;
