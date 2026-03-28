import { useState } from 'react';
import { Plus, ClipboardList, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useUsers } from '../hooks/useUsers';
import { Task, TaskFilters, TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Layout from '../components/Layout';
import { User2, Calendar } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export default function TasksPage() {
  const { user } = useAuth();
  const [filters,       setFilters]       = useState<TaskFilters>({ page: 1, limit: 10 });
  const [editingTask,   setEditingTask]   = useState<Task | null>(null);
  const [showForm,      setShowForm]      = useState(false);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [viewMode,      setViewMode]      = useState<ViewMode>('grid');

  const isAdmin = user?.role === 'ADMIN';
  const canEditTask   = (task: Task) => isAdmin || task.createdBy?.id === user?.id || task.assignedTo?.id === user?.id;
  const canDeleteTask = (_task: Task) => isAdmin;

  const { data, isLoading, isError } = useTasks(filters);
  const { data: users = [] }         = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleFilterChange = (updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleSubmitTask = async (data: any) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, payload: data });
    } else {
      await createTask.mutateAsync(data);
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await deleteTask.mutateAsync(deletingId);
    setDeletingId(null);
  };

  const total = data?.pagination.total ?? 0;

  const sidebarFilters = (
    <>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 pb-1">
        Filters
      </p>
      <select
        value={filters.status || ''}
        onChange={(e) => handleFilterChange({ status: (e.target.value as TaskStatus) || undefined })}
        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      <select
        value={filters.assignedToId || ''}
        onChange={(e) => handleFilterChange({ assignedToId: e.target.value || undefined })}
        className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Members</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
      {(filters.status || filters.assignedToId) && (
        <button
          onClick={() => handleFilterChange({ status: undefined, assignedToId: undefined })}
          className="w-full px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-left"
        >
          Clear filters
        </button>
      )}
    </>
  );

  return (
    <Layout sidebarExtra={sidebarFilters}>
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isLoading ? 'Loading…' : `${total} task${total !== 1 ? 's' : ''} total`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange({ search: e.target.value || undefined })}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Content area */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-red-500">
            <p className="font-medium">Failed to load tasks.</p>
            <p className="text-sm mt-1 text-red-400">Please refresh the page and try again.</p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">No tasks found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters, or{' '}
              <button onClick={handleOpenCreate} className="text-blue-600 hover:underline">
                create a new task
              </button>
              .
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.data.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleOpenEdit} onDelete={setDeletingId} />
            ))}
          </div>
        ) : (
          /* List view — works better for tables on larger screens */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Assigned to</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <User2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {task.assignedTo?.name ?? 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => canEditTask(task) && handleOpenEdit(task)}
                          disabled={!canEditTask(task)}
                          title={canEditTask(task) ? 'Edit task' : 'You can only edit tasks you created or are assigned to'}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                            canEditTask(task)
                              ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => canDeleteTask(task) && setDeletingId(task.id)}
                          disabled={!canDeleteTask(task)}
                          title={canDeleteTask(task) ? 'Delete task' : 'Only admins can delete tasks'}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                            canDeleteTask(task)
                              ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={handleSubmitTask}
          onClose={handleCloseForm}
          isSubmitting={createTask.isPending || updateTask.isPending}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
        isLoading={deleteTask.isPending}
        variant="danger"
      />
    </div>
    </Layout>
  );
}
