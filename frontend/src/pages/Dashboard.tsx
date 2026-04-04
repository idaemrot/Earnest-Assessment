import { useState } from 'react'
import Navbar from '../components/Navbar'
import TaskCard, { type Task, type TaskStatus } from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

// ─── Static demo data (replace with API calls when backend is connected) ──────
const DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: 'Set up database schema',
    description: 'Create Prisma models for User and Task with proper relations.',
    status: 'completed',
    userId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement JWT authentication',
    description: 'Add access and refresh token flow to the API.',
    status: 'completed',
    userId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Build task CRUD endpoints',
    description: 'GET, POST, PATCH, DELETE with ownership checks and Zod validation.',
    status: 'completed',
    userId: 'u1',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Connect frontend to API',
    description: 'Wire up React pages to the Express backend using fetch or axios.',
    status: 'pending',
    userId: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Add pagination to task list',
    status: 'pending',
    userId: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

type FilterStatus = 'all' | TaskStatus

export default function Dashboard() {
  const [tasks, setTasks]             = useState<Task[]>(DEMO_TASKS)
  const [filter, setFilter]           = useState<FilterStatus>('all')
  const [search, setSearch]           = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total     = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const pending   = tasks.filter(t => t.status === 'pending').length

  // ── Filtered view ──────────────────────────────────────────────────────────
  const visible = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const handleSubmit = (data: { title: string; description: string; status: TaskStatus }) => {
    if (editingTask) {
      // Edit existing
      setTasks(prev =>
        prev.map(t =>
          t.id === editingTask.id
            ? { ...t, ...data, updatedAt: new Date().toISOString() }
            : t
        )
      )
    } else {
      // Create new
      const newTask: Task = {
        id: String(Date.now()),
        userId: 'u1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
        description: data.description || undefined,
      }
      setTasks(prev => [newTask, ...prev])
    }
    handleCloseModal()
  }

  const handleToggle = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'pending' ? 'completed' : 'pending',
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )
  }

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar username="demo@taskflow.dev" onLogout={() => {}} />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">My Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">Stay on top of what matters.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',     value: total,     color: 'text-gray-100',   bg: 'bg-gray-800/60',    border: 'border-gray-700' },
            { label: 'Pending',   value: pending,   color: 'text-amber-400',  bg: 'bg-amber-500/5',    border: 'border-amber-500/20' },
            { label: 'Completed', value: completed, color: 'text-teal-400',   bg: 'bg-teal-500/5',     border: 'border-teal-500/20' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {(['all', 'pending', 'completed'] as FilterStatus[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-gray-700 text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-sm text-gray-300 placeholder-gray-600 bg-gray-900 border border-gray-800 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Task grid */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">No tasks found</p>
            <p className="text-xs text-gray-600 mt-1">
              {search ? 'Try a different search term' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        task={editingTask}
      />
    </div>
  )
}
