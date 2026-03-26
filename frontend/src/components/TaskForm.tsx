import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Task, User } from '../types';
import LoadingSpinner from './LoadingSpinner';

const taskSchema = z.object({
  title:        z.string().trim().min(1, 'Title is required').max(200, 'Title is too long (200 chars max)'),
  description:  z.string().optional(),
  status:       z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority:     z.enum(['LOW', 'MEDIUM', 'HIGH']),
  assignedToId: z.string().optional(),
  dueDate:      z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task:        Task | null;
  users:       User[];
  onSubmit:    (data: Omit<TaskFormData, 'assignedToId' | 'dueDate'> & { assignedToId: string | null; dueDate: string | null }) => Promise<void>;
  onClose:     () => void;
  isSubmitting: boolean;
}

export default function TaskForm({ task, users, onSubmit, onClose, isSubmitting }: TaskFormProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title:        '',
      description:  '',
      status:       'TODO',
      priority:     'MEDIUM',
      assignedToId: '',
      dueDate:      '',
    },
  });

  // When editing, populate the form with the task's current values
  useEffect(() => {
    if (task) {
      reset({
        title:        task.title,
        description:  task.description || '',
        status:       task.status,
        priority:     task.priority,
        assignedToId: task.assignedTo?.id || '',
        dueDate:      task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit({
      ...data,
      assignedToId: data.assignedToId || null,
      dueDate:      data.dueDate      || null,
    });
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="What needs to be done?"
              className={fieldClass(!!errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              placeholder="Add more context or acceptance criteria…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select {...register('status')} className={fieldClass(false)}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select {...register('priority')} className={fieldClass(false)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to</label>
            <select {...register('assignedToId')} className={fieldClass(false)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
            <input
              {...register('dueDate')}
              type="date"
              className={fieldClass(false)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
            >
              {isSubmitting && <LoadingSpinner size="sm" color="white" />}
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
