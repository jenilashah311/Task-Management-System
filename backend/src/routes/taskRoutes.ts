import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/taskController';

const router = Router();

// Every task route requires a valid JWT — no exceptions
router.use(authenticate as any);

const VALID_STATUSES   = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

router.get('/',    taskController.getTasks  as any);
router.get('/:id', taskController.getTask   as any);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
    body('description').optional().isString(),
    body('status').optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    body('priority').optional().isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
    body('assignedToId').optional({ nullable: true }).isString(),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date.'),
  ],
  taskController.createTask as any
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().isString(),
    body('status').optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    body('priority').optional().isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
    body('assignedToId').optional({ nullable: true }),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date.'),
  ],
  taskController.updateTask as any
);

router.delete('/:id', taskController.deleteTask as any);

export default router;
