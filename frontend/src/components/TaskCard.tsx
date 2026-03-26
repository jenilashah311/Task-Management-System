import { Task } from '../types';
import { Calendar, User2, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../contexts/AuthContext';

interface TaskCardProps {
  task:     Task;
  onEdit:   (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { user } = useAuth();

  const isAdmin    = user?.role === 'ADMIN';
  const isAssignee = task.assignedTo?.id === user?.id;

  // Admins can manage any task; members can only manage tasks assigned to them
  const canEdit   = isAdmin || isAssignee;
  const canDelete = isAdmin || isAssignee;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'DONE';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col gap-3">
      {/* Priority + action buttons */}
      <div className="flex items-start justify-between">
        <PriorityBadge priority={task.priority} />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => canEdit && onEdit(task)}
            title={canEdit ? 'Edit task' : 'You can only edit tasks assigned to you'}
            disabled={!canEdit}
            className={`p-1.5 rounded-lg transition-colors ${
              canEdit
                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => canDelete && onDelete(task.id)}
            title={canDelete ? 'Delete task' : 'You can only delete tasks assigned to you'}
            disabled={!canDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              canDelete
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Status badge */}
      <StatusBadge status={task.status} />

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User2 className="w-3 h-3 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500 truncate max-w-[100px]">
            {task.assignedTo?.name ?? 'Unassigned'}
          </span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}
