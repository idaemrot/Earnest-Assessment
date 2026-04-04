import { useState, useEffect, useCallback, useRef } from 'react'
import { isAxiosError } from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getTasks, createTask, updateTask, deleteTask, toggleTask,
  type Task, type TaskStatus, type GetTasksParams,
} from '../services/task.service'
import Navbar    from '../components/Navbar'
import TaskCard  from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterStatus = 'all' | TaskStatus
type SortKey      = 'newest' | 'oldest' | 'az' | 'status'
type ViewMode     = 'grid' | 'list'

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'All tasks'  },
  { value: 'pending',   label: 'Pending'    },
  { value: 'completed', label: 'Completed'  },
]
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az',     label: 'A → Z'        },
  { value: 'status', label: 'By status'    },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function Dropdown<T extends string>({
  value, onChange, options, icon,
}: {
  value: T; onChange: (v: T) => void
  options: { value: T; label: string }[]
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)!
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm text-gray-300 bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors whitespace-nowrap"
      >
        {icon}<span>{selected.label}</span>
        <svg className={`h-3.5 w-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
          {options.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${opt.value === value ? 'text-teal-400 bg-teal-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
            >
              {opt.label}
              {opt.value === value && <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-gray-600"><span>Progress</span><span>{pct}%</span></div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TaskRow({ task, onEdit, onDelete, onToggle }: { task: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void; onToggle: (id: string) => void }) {
  const done = task.status === 'completed'
  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 bg-gray-900 hover:bg-gray-800/70 border-b border-gray-800/80 last:border-0 transition-colors">
      <button onClick={() => onToggle(task.id)} style={{ width: 18, height: 18 }}
        className={`flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-teal-500 border-teal-500 shadow-sm shadow-teal-500/30' : 'border-gray-600 hover:border-teal-400'}`}
      >
        {done && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${done ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.title}</p>
        {task.description && <p className="text-xs text-gray-600 truncate mt-0.5">{task.description}</p>}
      </div>
      <span className={`flex-shrink-0 hidden sm:inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${done ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>{task.status}</span>
      <time className="flex-shrink-0 hidden md:block text-xs text-gray-600 w-24 text-right" dateTime={task.createdAt}>
        {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </time>
      <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-gray-500 hover:text-teal-400 hover:bg-teal-500/10 transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-800">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-800/80 last:border-0">
            <div className="h-4 w-4 rounded-full bg-gray-800 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 bg-gray-800 rounded animate-pulse" />
              <div className="h-2.5 w-1/3 bg-gray-800/60 rounded animate-pulse" />
            </div>
            <div className="h-5 w-20 bg-gray-800 rounded-full animate-pulse hidden sm:block" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3">
          <div className="flex justify-between"><div className="h-4 w-4 rounded-full bg-gray-800 animate-pulse" /><div className="h-5 w-20 bg-gray-800 rounded-full animate-pulse" /></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-800/60 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-800/60 rounded animate-pulse" />
          <div className="pt-2 border-t border-gray-800"><div className="h-3 w-24 bg-gray-800/60 rounded animate-pulse" /></div>
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout }  = useAuth()
  const navigate            = useNavigate()
  const toast               = useToast()

  const [tasks, setTasks]             = useState<Task[]>([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActLoad]   = useState(false)
  const [error, setError]             = useState('')
  const [filter, setFilter]           = useState<FilterStatus>('all')
  const [sort, setSort]               = useState<SortKey>('newest')
  const [search, setSearch]           = useState('')
  const [view, setView]               = useState<ViewMode>('grid')
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const LIMIT = 12

  // ── Fetch tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async (params: GetTasksParams) => {
    setLoading(true)
    setError('')
    try {
      const result = await getTasks(params)
      setTasks(result.tasks)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        navigate('/login', { replace: true })
      } else {
        setError('Failed to load tasks. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // Re-fetch when filter / search / page / sort changes
  // Debounce search to avoid firing on every keystroke
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const params: GetTasksParams = {
        page,
        limit: LIMIT,
        ...(filter !== 'all' && { status: filter }),
        ...(search.trim() && { search: search.trim() }),
      }
      fetchTasks(params)
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [filter, search, page, fetchTasks])

  // Client-side sort (API already handles pagination/filter)
  const sorted = [...tasks].sort((a, b) => {
    switch (sort) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'az':     return a.title.localeCompare(b.title)
      case 'status': return a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1
      default:       return 0
    }
  })

  const completed = tasks.filter(t => t.status === 'completed').length
  const pending   = tasks.filter(t => t.status === 'pending').length

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => { setEditingTask(null); setModalOpen(true) }
  const openEdit   = (task: Task) => { setEditingTask(task); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingTask(null) }

  const handleSubmit = async ({
    title, description, status,
  }: { title: string; description: string; status: TaskStatus }) => {
    setActLoad(true)
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, {
          title,
          description: description || null,
          status,
        })
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
        toast.success('Task updated successfully')
      } else {
        const created = await createTask({ title, description: description || undefined })
        setTasks(prev => [created, ...prev])
        setTotal(n => n + 1)
        toast.success('Task created!')
      }
      closeModal()
    } catch {
      toast.error(editingTask ? 'Failed to update task.' : 'Failed to create task.')
    } finally {
      setActLoad(false)
    }
  }

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    const nextStatus = task?.status === 'pending' ? 'completed' : 'pending'
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: nextStatus } : t
    ))
    try {
      const updated = await toggleTask(id)
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      toast.success(
        updated.status === 'completed' ? '✓ Task completed!' : 'Task marked as pending'
      )
    } catch {
      // Roll back optimistic update on failure
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: task?.status ?? 'pending' } : t
      ))
      toast.error('Failed to update task status.')
    }
  }

  const handleDelete = async (id: string) => {
    const snapshot = tasks
    setTasks(prev => prev.filter(t => t.id !== id))
    setTotal(n => n - 1)
    try {
      await deleteTask(id)
      toast.success('Task deleted')
    } catch {
      setTasks(snapshot) // roll back
      setTotal(n => n + 1)
      toast.error('Failed to delete task.')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.info('You have been signed out')
    navigate('/login', { replace: true })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar username={user?.name ?? 'User'} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading…' : `${completed} of ${total} tasks completed`}
            </p>
          </div>
          <button onClick={openCreate} id="add-task-btn"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition-all active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {([
            { label: 'Total', value: total, accent: 'text-gray-100', ring: 'border-gray-700', bg: 'bg-gray-800/50', fv: 'all' as FilterStatus },
            { label: 'Pending', value: pending, accent: 'text-amber-400', ring: 'border-amber-500/25', bg: 'bg-amber-500/5', fv: 'pending' as FilterStatus },
            { label: 'Completed', value: completed, accent: 'text-teal-400', ring: 'border-teal-500/25', bg: 'bg-teal-500/5', fv: 'completed' as FilterStatus },
          ]).map(({ label, value, accent, ring, bg, fv }) => (
            <button key={label} onClick={() => { setFilter(fv); setPage(1) }}
              className={`${bg} border ${ring} rounded-2xl p-4 sm:p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none ${filter === fv ? 'ring-2 ring-teal-500/30' : ''}`}
            >
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              {loading
                ? <div className="h-8 w-12 mt-1 bg-gray-700/60 rounded animate-pulse" />
                : <p className={`text-2xl sm:text-3xl font-bold mt-1 ${accent}`}>{value}</p>
              }
              {label === 'Total' && !loading && <ProgressBar value={completed} max={total} />}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input id="task-search" type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tasks…"
              className="w-full pl-10 pr-10 py-2 rounded-xl text-sm text-gray-300 placeholder-gray-600 bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Dropdown value={filter} onChange={(v) => { setFilter(v); setPage(1) }} options={FILTER_OPTIONS}
              icon={<svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
            />
            <Dropdown value={sort} onChange={setSort} options={SORT_OPTIONS}
              icon={<svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12m-9 5h6" /></svg>}
            />
            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-0.5">
              {(['grid', 'list'] as ViewMode[]).map(m => (
                <button key={m} onClick={() => setView(m)} title={`${m} view`}
                  className={`p-1.5 rounded-lg transition-all ${view === m ? 'bg-gray-700 text-gray-200 shadow-sm' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  {m === 'grid'
                    ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results info */}
        {(search || filter !== 'all') && !loading && (
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {total} {total === 1 ? 'task' : 'tasks'}
              {search && <> matching "<span className="text-gray-400">{search}</span>"</>}
              {filter !== 'all' && <> · <span className="capitalize">{filter}</span></>}
            </span>
            <button onClick={() => { setSearch(''); setFilter('all'); setPage(1) }} className="text-teal-500 hover:text-teal-400 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span>{error}</span>
            <button onClick={() => fetchTasks({ page, limit: LIMIT, ...(filter !== 'all' && { status: filter }), ...(search && { search }) })} className="ml-auto text-xs underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <Skeleton view={view} />
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center mb-5">
              <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {search ? 'No matching tasks' : filter !== 'all' ? `No ${filter} tasks` : 'No tasks yet'}
            </p>
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              {search ? `No tasks match "${search}".` : filter !== 'all' ? `You have no ${filter} tasks.` : 'Create your first task to get started.'}
            </p>
            {!search && filter === 'all' && (
              <button onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-sm font-medium border border-teal-500/25 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Create a task
              </button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(task => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-800">
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-gray-900/60 border-b border-gray-800 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="w-4 flex-shrink-0" />
              <div className="flex-1">Task</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-24 text-right">Created</div>
              <div className="w-16" />
            </div>
            {sorted.map(task => (
              <TaskRow key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >← Prev</button>
            <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >Next →</button>
          </div>
        )}
      </main>

      <TaskModal isOpen={modalOpen} onClose={closeModal} onSubmit={handleSubmit} task={editingTask} isLoading={actionLoading} />
    </div>
  )
}
