'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Tag, X, ArrowLeft, Zap } from 'lucide-react';
import { getTasks, addTask, updateTask, deleteTask, generateId, getTodayDate } from '@/lib/storage';
import { Task } from '@/types';

const TASK_CATEGORIES = [
  { value: 'work', label: 'Work', icon: '💼', color: 'bg-blue-100 text-blue-700' },
  { value: 'personal', label: 'Personal', icon: '🏠', color: 'bg-purple-100 text-purple-700' },
  { value: 'health', label: 'Health', icon: '❤️', color: 'bg-red-100 text-red-700' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'bg-green-100 text-green-700' },
  { value: 'study', label: 'Study', icon: '📚', color: 'bg-amber-100 text-amber-700' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', color: 'bg-pink-100 text-pink-700' },
  { value: 'fitness', label: 'Fitness', icon: '💪', color: 'bg-orange-100 text-orange-700' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'social', label: 'Social', icon: '🤝', color: 'bg-teal-100 text-teal-700' },
];

const TASK_PRESETS = [
  { title: 'Team standup meeting', category: 'work', priority: 'medium' as const, dueDate: getTodayDate() },
  { title: 'Review project proposal', category: 'work', priority: 'high' as const, dueDate: '' },
  { title: 'Grocery shopping', category: 'shopping', priority: 'medium' as const, dueDate: getTodayDate() },
  { title: 'Morning yoga session', category: 'fitness', priority: 'low' as const, dueDate: getTodayDate() },
  { title: 'Call mom', category: 'family', priority: 'low' as const, dueDate: getTodayDate() },
  { title: 'Read 30 pages', category: 'study', priority: 'medium' as const, dueDate: '' },
  { title: 'Pay utility bills', category: 'finance', priority: 'high' as const, dueDate: '' },
  { title: 'Schedule dentist appointment', category: 'health', priority: 'low' as const, dueDate: '' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    dueDate: '',
  });

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: generateId(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    setTasks(getTasks());
    setShowForm(false);
    setNewTask({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
  };

  const handleQuickAdd = (preset: typeof TASK_PRESETS[0]) => {
    const task: Task = {
      id: generateId(),
      title: preset.title,
      description: '',
      priority: preset.priority,
      category: preset.category,
      dueDate: preset.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    setTasks(getTasks());
  };

  const toggleComplete = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed });
    setTasks(getTasks());
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      setTasks(getTasks());
    }
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const getCategoryInfo = (category: string) => {
    return TASK_CATEGORIES.find(c => c.value === category) || { label: category, icon: '📋', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-500">Manage your tasks and to-dos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                <Zap className="w-4 h-4" />
                Quick Add
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Add Presets */}
        {showPresets && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Add Presets</h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TASK_PRESETS.map((preset, idx) => {
                const cat = getCategoryInfo(preset.category);
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm text-gray-900 flex-1 truncate">{preset.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                  rows={3}
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {TASK_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, category: cat.value })}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        newTask.category === cat.value
                          ? `${cat.color} ring-2 ring-offset-1 ring-gray-400`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ color: '#111827' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ color: '#111827' }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Tasks ({incompleteTasks.length})
          </h2>
          {incompleteTasks.length > 0 ? (
            <div className="space-y-3">
              {incompleteTasks.map(task => {
                const cat = getCategoryInfo(task.category);
                return (
                  <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleComplete(task.id, task.completed)}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition"
                    >
                      <Circle className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-400 hover:text-red-500 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active tasks. Create one above!</p>
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex-1">
                    <p className="text-gray-500 line-through">{task.title}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-400 hover:text-red-500 transition p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
