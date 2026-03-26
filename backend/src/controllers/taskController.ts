import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as taskService from '../services/taskService';
import { AuthenticatedRequest } from '../types';

export async function getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Clamp pagination values to sensible ranges so clients can't request 10,000 items per page
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const result = await taskService.getTasks(
      {
        status:       req.query.status       as any,
        assignedToId: req.query.assignedToId as string,
        search:       req.query.search       as string,
      },
      { page, limit }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }
    const task = await taskService.createTask({ ...req.body, createdById: req.user!.id });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }
    const task = await taskService.updateTask(req.params.id, req.body, req.user!);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.params.id, req.user!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
