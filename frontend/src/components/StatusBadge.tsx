import { TaskStatus } from '../types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO:        { label: 'To Do',       className: 'bg-slate-100 text-slate-600' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700'  },
  DONE:        { label: 'Done',        className: 'bg-green-100 text-green-700' },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
