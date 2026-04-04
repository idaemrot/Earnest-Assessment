'use client'

import { useEffect, useRef, useState } from 'react'
import type { Task, TaskStatus } from '@/services/task.service'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; status: TaskStatus }) => void
  task?: Task | null          // if provided → edit mode; null/undefined → create mode
  isLoading?: boolean
}

const STATUSES: TaskStatus[] = ['pending', 'completed']

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
}: TaskModalProps) {
  const isEditing = Boolean(task)

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus]           = useState<TaskStatus>('pending')
  const [errors, setErrors]           = useState<{ title?: string }>({})

  const titleRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Sync form when task prop changes (edit mode) or modal opens (create mode)
  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? '')
      setDescription(task?.description ?? '')
      setStatus(task?.status ?? 'pending')
      setErrors({})
      // Focus title on next tick
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [isOpen, task])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isLoading, onClose])

  // Trap body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const validate = () => {
    const errs: { title?: string } = {}
    if (!title.trim()) errs.title = 'Title is required'
    else if (title.trim().length > 255) errs.title = 'Title must be 255 characters or fewer'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !isLoading) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 animate-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <h2 id="modal-title" className="text-base font-semibold text-gray-100">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">

            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-xs font-medium text-gray-400 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="task-title"
                ref={titleRef}
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                placeholder="What needs to be done?"
                maxLength={255}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800 border transition-colors outline-none focus:ring-2 focus:ring-teal-500/40 ${
                  errors.title
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-gray-700 focus:border-teal-500/60'
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-desc" className="block text-xs font-medium text-gray-400 mb-1.5">
                Description <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <textarea
                id="task-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                maxLength={2000}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800 border border-gray-700 focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/40 transition-colors outline-none resize-none"
              />
            </div>

            {/* Status (edit mode only) */}
            {isEditing && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                        status === s
                          ? s === 'completed'
                            ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
