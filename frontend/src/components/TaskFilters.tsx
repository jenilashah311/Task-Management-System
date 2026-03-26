import { Search, X } from 'lucide-react';
import { TaskFilters, TaskStatus, User } from '../types';

interface TaskFiltersBarProps {
  filters:  TaskFilters;
  users:    User[];
  onChange: (updates: Partial<TaskFilters>) => void;
}

const STATUSES: { value: TaskStatus | ''; label: string }[] = [
  { value: '',            label: 'All Statuses'  },
  { value: 'TODO',        label: 'To Do'         },
  { value: 'IN_PROGRESS', label: 'In Progress'   },
  { value: 'DONE',        label: 'Done'          },
];

export default function TaskFiltersBar({ filters, users, onChange }: TaskFiltersBarProps) {
  const hasActiveFilters = !!(filters.status || filters.assignedToId || filters.search);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ status: (e.target.value as TaskStatus) || undefined })}
        className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Assignee filter */}
      <select
        value={filters.assignedToId || ''}
        onChange={(e) => onChange({ assignedToId: e.target.value || undefined })}
        className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
      >
        <option value="">All Members</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      {/* Clear button — only show when at least one filter is active */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ status: undefined, assignedToId: undefined, search: undefined })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
