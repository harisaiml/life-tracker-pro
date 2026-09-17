'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Task } from '@/lib/supabase'
import {
  Plus, Trash2, CheckCircle, Circle, Calendar, X, ArrowLeft, Zap,
  Target, Filter, Loader2
} from 'lucide-react'

const TASK_CATEGORIES = [
  { value: 'work', label: 'Work', icon: '💼', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'personal', label: 'Personal', icon: '🏠', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'health', label: 'Health', icon: '❤️', color: 'bg-red-500/20 text-red-400' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'bg-green-500/20 text-green-400' },
  { value: 'study', label: 'Study', icon: '📚', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'fitness', label: 'Fitness', icon: '💪', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-indigo-500/20 text-indigo-400' },
  { value: 'social', label: 'Social', icon: '🤝', color: 'bg-teal-500/20 text-teal-400' },
]

const TASK_PRESETS = [
  { title: 'Team standup meeting', category: 'work', priority: 'medium' },
  { title: 'Review project proposal', category: 'work', priority: 'high' },
  { title: 'Grocery shopping', category: 'shopping', priority: 'medium' },
  { title: 'Morning yoga session', category: 'fitness', priority: 'low' },
  { title: 'Call mom', category: 'family', priority: 'low' },
  { title: 'Read 30 pages', category: 'study', priority: 'medium' },
  { title: 'Pay utility bills', category: 'finance', priority: 'high' },
  { title: 'Schedule dentist appointment', category: 'health', priority: 'low' },
]

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    due_date: '',
  })

  useEffect(() => {
    if (user) loadTasks()
  }, [user])

  const loadTasks = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        due_date: newTask.due_date || null,
        completed: false,
      })

      if (!error) {
        loadTasks()
        setShowForm(false)
        setNewTask({ title: '', description: '', priority: 'medium', category: '', due_date: '' })
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleQuickAdd = async (preset: typeof TASK_PRESETS[0]) => {
    if (!user) return

    try {
      await supabase.from('tasks').insert({
        user_id: user.id,
        title: preset.title,
        category: preset.category,
        priority: preset.priority,
        completed: false,
      })
      loadTasks()
    } catch (error) {
      console.error('Error quick adding task:', error)
    }
  }

  const toggleComplete = async (task: Task) => {
    try {
      await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await supabase.from('tasks').delete().eq('id', taskId)
      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const getCategoryInfo = (category: string) => {
    return TASK_CATEGORIES.find(c => c.value === category) || { label: category, icon: '📋', color: 'bg-gray-500/20 text-gray-400' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold gradient-text">Tasks</h1>
                <p className="text-sm text-gray-400">{tasks.length} total tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 glass px-4 py-2 rounded-xl hover:bg-white/10 transition"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-xl hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Quick Add Presets */}
        {showPresets && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Add Presets</h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TASK_PRESETS.map((preset, idx) => {
                const cat = getCategoryInfo(preset.category)
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-left"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm flex-1 truncate">{preset.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Create Task Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none transition"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none transition"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, category: cat.value })}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        newTask.category === cat.value
                          ? `${cat.color} ring-2 ring-white/30`
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-xl hover:opacity-90 transition"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="glass px-6 py-2 rounded-xl hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                filter === f ? 'bg-blue-500/20 text-blue-400' : 'glass hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task, idx) => {
            const cat = getCategoryInfo(task.category)
            return (
              <div
                key={task.id}
                className={`glass rounded-2xl p-4 flex items-center gap-4 transition-all animate-slide-up ${
                  task.completed ? 'opacity-60' : ''
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-blue-500'
                  }`}
                >
                  {task.completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                  {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {task.category && (
                      <span className={`text-xs px-2 py-1 rounded-full ${cat.color}`}>
                        {cat.icon} {cat.label}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
