'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, X, ArrowLeft, Target, TrendingUp, CheckCircle, Calendar, Zap } from 'lucide-react';
import { getGoals, addGoal, updateGoal, deleteGoal, generateId } from '@/lib/storage';
import { Goal } from '@/types';

const GOAL_CATEGORIES = [
  { value: 'fitness', label: 'Fitness', emoji: '💪', color: 'bg-orange-100' },
  { value: 'career', label: 'Career', emoji: '💼', color: 'bg-blue-100' },
  { value: 'education', label: 'Education', emoji: '📚', color: 'bg-purple-100' },
  { value: 'finance', label: 'Finance', emoji: '💰', color: 'bg-green-100' },
  { value: 'health', label: 'Health', emoji: '❤️', color: 'bg-red-100' },
  { value: 'personal', label: 'Personal', emoji: '🌱', color: 'bg-teal-100' },
  { value: 'creative', label: 'Creative', emoji: '🎨', color: 'bg-pink-100' },
  { value: 'social', label: 'Social', emoji: '🤝', color: 'bg-indigo-100' },
];

const GOAL_PRESETS = [
  { title: 'Run a Marathon', description: 'Complete a full 26.2 mile marathon', category: 'fitness', targetValue: 26.2, unit: 'miles', deadline: '' },
  { title: 'Save $10,000', description: 'Build emergency fund', category: 'finance', targetValue: 10000, unit: 'USD', deadline: '' },
  { title: 'Read 50 Books', description: 'Read one book per week', category: 'education', targetValue: 50, unit: 'books', deadline: '' },
  { title: 'Learn a Language', description: 'Become conversational in Spanish', category: 'education', targetValue: 365, unit: 'days', deadline: '' },
  { title: 'Lose 20 Pounds', description: 'Get to healthy weight', category: 'health', targetValue: 20, unit: 'lbs', deadline: '' },
  { title: 'Build Side Project', description: 'Launch SaaS product', category: 'career', targetValue: 1, unit: 'product', deadline: '' },
  { title: 'Meditate 100 Days', description: 'Build daily meditation habit', category: 'personal', targetValue: 100, unit: 'days', deadline: '' },
  { title: 'Network 50 People', description: 'Expand professional connections', category: 'social', targetValue: 50, unit: 'people', deadline: '' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
  });

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: Goal = {
      id: generateId(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      currentValue: newGoal.currentValue,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    setGoals(getGoals());
    setShowForm(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'fitness',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      deadline: '',
    });
  };

  const handleQuickAdd = (preset: typeof GOAL_PRESETS[0]) => {
    const goal: Goal = {
      id: generateId(),
      title: preset.title,
      description: preset.description,
      category: preset.category,
      targetValue: preset.targetValue,
      currentValue: 0,
      unit: preset.unit,
      deadline: preset.deadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    setGoals(getGoals());
  };

  const handleUpdateProgress = (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const completed = newValue >= goal.targetValue;
      updateGoal(goalId, { currentValue: newValue, completed });
      setGoals(getGoals());
    }
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
      setGoals(getGoals());
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const getCategoryInfo = (category: string) => {
    return GOAL_CATEGORIES.find(c => c.value === category) || GOAL_CATEGORIES[0];
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
                <h1 className="text-xl font-bold text-gray-900">Goals</h1>
                <p className="text-sm text-gray-500">Set and track your long-term goals</p>
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
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add Goal
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
              <h2 className="text-lg font-semibold text-gray-900">Popular Goal Presets</h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GOAL_PRESETS.map((preset, idx) => {
                const cat = getCategoryInfo(preset.category);
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left"
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${cat.color}`}>
                      {cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{preset.title}</p>
                      <p className="text-xs text-gray-500">{preset.targetValue} {preset.unit}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Goal Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Goal</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Run a Marathon"
                  required
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe your goal"
                  rows={2}
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, category: cat.value })}
                      className={`p-3 rounded-lg border-2 transition ${
                        newGoal.category === cat.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="text-xs mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                    style={{ color: '#111827' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={newGoal.currentValue || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    style={{ color: '#111827' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., km, pages, kg"
                    style={{ color: '#111827' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  style={{ color: '#111827' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Goal
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

        {/* Active Goals */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Goals ({activeGoals.length})
          </h2>
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map(goal => {
                const category = getCategoryInfo(goal.category);
                const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.completed;

                return (
                  <div key={goal.id} className={`p-4 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-xl`}>
                          {category.emoji}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{goal.title}</p>
                          <p className="text-sm text-gray-500">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.deadline && (
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
                    </div>
                    {/* Quick Update */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={goal.currentValue}
                        onChange={(e) => handleUpdateProgress(goal.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        style={{ color: '#111827' }}
                      />
                      <span className="text-sm text-gray-500">{goal.unit}</span>
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.targetValue)}
                        className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active goals. Set your first goal above!</p>
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed ({completedGoals.length})
            </h2>
            <div className="space-y-3">
              {completedGoals.map(goal => {
                const category = getCategoryInfo(goal.category);
                return (
                  <div key={goal.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-xl`}>
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 line-through">{goal.title}</p>
                      <p className="text-sm text-gray-400">
                        Achieved: {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
