'use client'

import type { Task } from '@/services/task.service'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onToggle?: (taskId: string) => void
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const isCompleted = task.status === 'completed'

  return (
    <article className="group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 bg-gray-900 hover:bg-gray-800/80 border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20">

      {/* Status badge + toggle */}
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onToggle?.(task.id)}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-teal-500 border-teal-500 shadow-sm shadow-teal-500/40'
              : 'border-gray-600 hover:border-teal-400'
          }`}
        >
          {isCompleted && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Status pill */}
        <span
          className={`ml-auto flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
            isCompleted
              ? 'text-teal-400 bg-teal-500/10 border-teal-500/20'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          }`}
        >
          {task.status}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`text-sm font-semibold leading-snug transition-colors ${
          isCompleted ? 'line-through text-gray-500' : 'text-gray-100'
        }`}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800 mt-auto">
        <time className="text-xs text-gray-600" dateTime={task.createdAt}>
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </time>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(task)}
            title="Edit task"
            className="p-1.5 rounded-lg text-gray-500 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            title="Delete task"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
