import { TaskPriority } from '../types';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  LOW:    { label: 'Low',    className: 'bg-slate-100 text-slate-500'  },
  MEDIUM: { label: 'Medium', className: 'bg-amber-100 text-amber-700'  },
  HIGH:   { label: 'High',   className: 'bg-red-100   text-red-600'    },
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, className } = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label} Priority
    </span>
  );
}
