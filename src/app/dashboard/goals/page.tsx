'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Goal } from '@/lib/supabase';
import { Plus, Trash2, ArrowLeft, Loader2, TrendingUp, Target, Calendar } from 'lucide-react';

const GOAL_CATEGORIES = [
  { value: 'fitness', label: 'Fitness', emoji: '💪', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30', iconColor: 'text-orange-400' },
  { value: 'career', label: 'Career', emoji: '💼', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30', iconColor: 'text-blue-400' },
  { value: 'education', label: 'Education', emoji: '📚', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30', iconColor: 'text-purple-400' },
  { value: 'finance', label: 'Finance', emoji: '💰', color: 'from-green-500/20 to-green-600/20 border-green-500/30', iconColor: 'text-green-400' },
  { value: 'health', label: 'Health', emoji: '❤️', color: 'from-red-500/20 to-red-600/20 border-red-500/30', iconColor: 'text-red-400' },
  { value: 'personal', label: 'Personal', emoji: '🌱', color: 'from-teal-500/20 to-teal-600/20 border-teal-500/30', iconColor: 'text-teal-400' },
  { value: 'creative', label: 'Creative', emoji: '🎨', color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30', iconColor: 'text-pink-400' },
  { value: 'social', label: 'Social', emoji: '🤝', color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30', iconColor: 'text-indigo-400' },
];

const GOAL_PRESETS = [
  { title: 'Run a Marathon', description: 'Complete a full 26.2 mile marathon', category: 'fitness', targetValue: 26.2, unit: 'miles' },
  { title: 'Save $10,000', description: 'Build emergency fund for financial security', category: 'finance', targetValue: 10000, unit: 'USD' },
  { title: 'Read 50 Books', description: 'Read one book per week to expand knowledge', category: 'education', targetValue: 50, unit: 'books' },
  { title: 'Learn a Language', description: 'Become conversational in a new language', category: 'education', targetValue: 365, unit: 'days' },
  { title: 'Lose 20 Pounds', description: 'Get to a healthy weight through diet and exercise', category: 'health', targetValue: 20, unit: 'lbs' },
  { title: 'Build Side Project', description: 'Launch a SaaS product or app', category: 'career', targetValue: 1, unit: 'product' },
  { title: 'Meditate 100 Days', description: 'Build a daily meditation practice', category: 'personal', targetValue: 100, unit: 'days' },
  { title: 'Network 50 People', description: 'Expand professional connections', category: 'social', targetValue: 50, unit: 'people' },
];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        target_value: newGoal.targetValue,
        current_value: newGoal.currentValue,
        unit: newGoal.unit,
        deadline: newGoal.deadline || null,
      });

      if (error) throw error;

      await loadGoals();
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
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleQuickAdd = async (preset: typeof GOAL_PRESETS[0]) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title: preset.title,
        description: preset.description,
        category: preset.category,
        target_value: preset.targetValue,
        current_value: 0,
        unit: preset.unit,
        deadline: null,
      });

      if (error) throw error;
      await loadGoals();
    } catch (error) {
      console.error('Error adding preset:', error);
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number, goal: Goal) => {
    setUpdatingId(goalId);
    try {
      const completed = newValue >= goal.target_value;
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;
      await loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase.from('goals').delete().eq('id', goalId);
      if (error) throw error;
      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getCategoryInfo = (category: string) => {
    return GOAL_CATEGORIES.find(c => c.value === category) || GOAL_CATEGORIES[0];
  };

  const filteredGoals = selectedCategory
    ? goals.filter(g => g.category === selectedCategory)
    : goals;

  const activeGoals = filteredGoals.filter(g => g.current_value < g.target_value);
  const completedGoals = filteredGoals.filter(g => g.current_value >= g.target_value);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Goals</h1>
                <p className="text-sm text-gray-400">Set and track your long-term goals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 glass hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition"
              >
                <TrendingUp className="w-4 h-4" />
                Quick Add
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-5 h-5" />
                Add Goal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-white/20 text-white border border-white/30'
                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Goals
          </button>
          {GOAL_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat.value
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Add Presets */}
        {showPresets && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Popular Goal Presets</h2>
              <button
                onClick={() => setShowPresets(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GOAL_PRESETS.map((preset, idx) => {
                const cat = getCategoryInfo(preset.category);
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex items-center gap-3 p-3 glass hover:bg-white/10 rounded-xl transition text-left animate-scale-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${cat.color} border ${cat.color.split(' ')[0].replace('/20', '')}/30`}>
                      {cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{preset.title}</p>
                      <p className="text-xs text-gray-400">{preset.targetValue} {preset.unit}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Goal Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Create New Goal</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                  placeholder="e.g., Run a Marathon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                  placeholder="Describe your goal"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, category: cat.value })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newGoal.category === cat.value
                          ? `border-orange-500 bg-orange-500/20`
                          : 'border-white/10 hover:border-white/30 glass'
                      }`}
                    >
                      <span className="text-xl block text-center">{cat.emoji}</span>
                      <p className="text-xs mt-1 text-center text-gray-300">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    step="any"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={newGoal.currentValue || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                    placeholder="e.g., km, pages, kg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="glass hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Goals */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            Active Goals ({activeGoals.length})
          </h2>
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map((goal, idx) => {
                const category = getCategoryInfo(goal.category);
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl glass animate-slide-up ${isOverdue ? 'border border-red-500/30 bg-red-500/5' : ''}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${category.color} border ${category.color.split(' ')[0].replace('/20', '')}/30`}>
                          {category.emoji}
                        </div>
                        <div>
                          <p className="text-white font-medium">{goal.title}</p>
                          <p className="text-sm text-gray-400">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </p>
                          {goal.description && (
                            <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.deadline && (
                          <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                            isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-gray-400'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-gray-500 hover:text-red-400 transition p-2 glass rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
                        <p className="text-xs text-gray-400">
                          {goal.target_value - goal.current_value} {goal.unit} remaining
                        </p>
                      </div>
                    </div>
                    {/* Quick Update */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={goal.current_value}
                          onBlur={(e) => handleUpdateProgress(goal.id, parseFloat(e.target.value) || 0, goal)}
                          className="w-28 px-3 py-2 text-sm glass border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                          min="0"
                          step="any"
                          disabled={updatingId === goal.id}
                        />
                        <span className="text-sm text-gray-400">{goal.unit}</span>
                      </div>
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.target_value, goal)}
                        disabled={updatingId === goal.id}
                        className="ml-auto text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-green-500/20 disabled:opacity-50"
                      >
                        {updatingId === goal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Mark Complete'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No active goals found</p>
              <p className="text-gray-500 text-sm">Set your first goal above to start tracking!</p>
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Completed ({completedGoals.length})
            </h2>
            <div className="space-y-3">
              {completedGoals.map((goal, idx) => {
                const category = getCategoryInfo(goal.category);
                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4 p-4 glass rounded-xl border border-green-500/20 bg-green-500/5 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${category.color} border ${category.color.split(' ')[0].replace('/20', '')}/30`}>
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 line-through">{goal.title}</p>
                      <p className="text-sm text-gray-500">
                        Achieved: {goal.target_value} {goal.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        Completed
                      </span>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-gray-500 hover:text-red-400 transition p-2 glass rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Target className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-2">Start Your Journey</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Set meaningful goals and track your progress. Whether it&apos;s fitness, career, or personal growth — we&apos;ve got you covered.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-5 h-5" />
                Create Custom Goal
              </button>
              <button
                onClick={() => setShowPresets(true)}
                className="flex items-center gap-2 glass hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl transition"
              >
                <TrendingUp className="w-5 h-5" />
                Browse Presets
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}