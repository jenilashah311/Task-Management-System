import { prisma } from '../lib/prisma';
import { TaskFilters, PaginationParams, TaskStatus, TaskPriority } from '../types';
import { createError } from '../middleware/errorHandler';

// Shared select so every task response looks the same and never includes the password hash.
const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy:  { select: { id: true, name: true, email: true } },
};

export async function getTasks(filters: TaskFilters, pagination: PaginationParams) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(filters.status      && { status: filters.status }),
    ...(filters.assignedToId && { assignedToId: filters.assignedToId }),
    ...(filters.search && {
      OR: [
        { title:       { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    }),
  };

  // Count and fetch run together so pagination doesn't cost an extra round trip.
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({ where, select: TASK_SELECT, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findFirst({ where: { id, deletedAt: null }, select: TASK_SELECT });
  if (!task) throw createError('Task not found.', 404);
  return task;
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
  createdById: string;
}) {
  if (data.assignedToId) {
    const assignee = await prisma.user.findFirst({ where: { id: data.assignedToId, deletedAt: null } });
    if (!assignee) throw createError('Assigned user not found.', 400);
  }

  return prisma.task.create({
    data: {
      title:       data.title,
      description: data.description,
      status:      data.status   || 'TODO',
      priority:    data.priority || 'MEDIUM',
      dueDate:     data.dueDate  ? new Date(data.dueDate) : null,
      assignedToId: data.assignedToId || null,
      createdById:  data.createdById,
    },
    select: TASK_SELECT,
  });
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    assignedToId?: string | null;
  },
  requestingUser: { id: string; role: string }
) {
  const existing = await prisma.task.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw createError('Task not found.', 404);

  // Members can only edit tasks assigned to them
  if (requestingUser.role !== 'ADMIN' && existing.assignedToId !== requestingUser.id) {
    throw createError('You can only edit tasks assigned to you.', 403);
  }

  if (data.assignedToId) {
    const assignee = await prisma.user.findFirst({ where: { id: data.assignedToId, deletedAt: null } });
    if (!assignee) throw createError('Assigned user not found.', 400);
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...(data.title       !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status      !== undefined && { status: data.status }),
      ...(data.priority    !== undefined && { priority: data.priority }),
      ...(data.dueDate     !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
    select: TASK_SELECT,
  });
}

export async function deleteTask(id: string, requestingUser: { id: string; role: string }) {
  const task = await prisma.task.findFirst({ where: { id, deletedAt: null } });
  if (!task) throw createError('Task not found.', 404);

  // Members can only delete tasks assigned to them
  if (requestingUser.role !== 'ADMIN' && task.assignedToId !== requestingUser.id) {
    throw createError('You can only delete tasks assigned to you.', 403);
  }

  // Soft delete — keeps the record around in case it needs to be restored later.
  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
}
