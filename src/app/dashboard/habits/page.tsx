'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Habit } from '@/lib/supabase';
import {
  Plus, Trash2, CheckCircle, ArrowLeft, Loader2, Award, Flame,
  X, Target, Calendar, TrendingUp, Zap
} from 'lucide-react';

const HABIT_PRESETS = [
  { name: 'Morning Exercise', emoji: '💪', color: '#f59e0b' },
  { name: 'Drink 8 Glasses Water', emoji: '💧', color: '#3b82f6' },
  { name: 'Read 30 Minutes', emoji: '📖', color: '#8b5cf6' },
  { name: 'Meditate', emoji: '🧘', color: '#10b981' },
  { name: 'Sleep 8 Hours', emoji: '😴', color: '#6366f1' },
  { name: 'Eat Healthy', emoji: '🥗', color: '#22c55e' },
  { name: 'Journaling', emoji: '📓', color: '#ec4899' },
  { name: 'No Social Media', emoji: '📵', color: '#ef4444' },
  { name: 'Learn New Skill', emoji: '🎯', color: '#f97316' },
  { name: 'Practice Gratitude', emoji: '🙏', color: '#14b8a6' },
  { name: 'Stretch', emoji: '🤸', color: '#a855f7' },
  { name: 'Take Vitamins', emoji: '💊', color: '#f43f5e' },
];

const EMOJI_OPTIONS = ['💪', '📚', '🏃', '💧', '🧘', '😴', '🥗', '✍️', '🎯', '🧠', '🎨', '🎵', '🙏', '📵', '🤸', '💊', '📖', '📓'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7', '#14b8a6', '#f43f5e'];

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    emoji: '💪',
    color: '#3b82f6',
    frequency: 'daily' as 'daily' | 'weekly',
  });
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newHabit.name.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabit.name.trim(),
          emoji: newHabit.emoji,
          color: newHabit.color,
          frequency: newHabit.frequency,
          completed_dates: [],
        })
        .select()
        .single();

      if (error) throw error;

      setHabits([data, ...habits]);
      setShowForm(false);
      setNewHabit({ name: '', emoji: '💪', color: '#3b82f6', frequency: 'daily' });
    } catch (error) {
      console.error('Error creating habit:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleQuickAdd = async (preset: typeof HABIT_PRESETS[0]) => {
    if (!user) return;

    // Check if habit already exists
    const exists = habits.some(h => h.name === preset.name);
    if (exists) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: preset.name,
          emoji: preset.emoji,
          color: preset.color,
          frequency: 'daily',
          completed_dates: [],
        })
        .select()
        .single();

      if (error) throw error;

      setHabits([data, ...habits]);
    } catch (error) {
      console.error('Error adding preset habit:', error);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    setToggling(habitId);

    try {
      const completedDates = habit.completed_dates || [];
      const isCompletedToday = completedDates.includes(today);
      const newCompletedDates = isCompletedToday
        ? completedDates.filter(d => d !== today)
        : [...completedDates, today];

      const { error } = await supabase
        .from('habits')
        .update({ completed_dates: newCompletedDates })
        .eq('id', habitId);

      if (error) throw error;

      setHabits(habits.map(h =>
        h.id === habitId ? { ...h, completed_dates: newCompletedDates } : h
      ));
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;

      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const isHabitDoneToday = (habit: Habit) => {
    return habit.completed_dates?.includes(today) || false;
  };

  const getStreak = (habit: Habit): number => {
    if (!habit.completed_dates || habit.completed_dates.length === 0) return 0;

    const sortedDates = [...habit.completed_dates].sort().reverse();
    let streak = 0;
    let currentDate = new Date(today);

    for (const date of sortedDates) {
      const dateObj = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = dateObj;
      } else {
        break;
      }
    }

    return streak;
  };

  const completedToday = habits.filter(h => isHabitDoneToday(h)).length;
  const longestStreak = Math.max(...habits.map(h => getStreak(h)), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
                <h1 className="text-xl font-bold text-white">Habits</h1>
                <p className="text-sm text-gray-400">{completedToday}/{habits.length} completed today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-gray-300 rounded-xl transition"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-green-500/25"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Habit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-4 border border-green-500/30 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedToday}</p>
                <p className="text-xs text-gray-400">Completed Today</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-emerald-500/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{longestStreak}</p>
                <p className="text-xs text-gray-400">Longest Streak</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-teal-500/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{habits.length}</p>
                <p className="text-xs text-gray-400">Total Habits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Presets */}
        {showPresets && (
          <div className="glass rounded-2xl p-6 mb-6 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Add Presets
              </h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {HABIT_PRESETS.map((preset, idx) => {
                const exists = habits.some(h => h.name === preset.name);
                return (
                  <button
                    key={idx}
                    onClick={() => !exists && handleQuickAdd(preset)}
                    disabled={exists}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      exists
                        ? 'bg-green-500/20 opacity-50 cursor-not-allowed'
                        : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: preset.color + '30' }}
                    >
                      {preset.emoji}
                    </span>
                    <span className="text-sm text-gray-200 flex-1 text-left">{preset.name}</span>
                    {exists && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Habit Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Create New Habit
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="e.g., Morning Exercise"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Choose Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, emoji })}
                      className={`w-10 h-10 text-xl rounded-lg transition-all ${
                        newHabit.emoji === emoji
                          ? 'bg-green-500/30 ring-2 ring-green-500 scale-110'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Choose Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        newHabit.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as 'daily' | 'weekly' })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-white"
                >
                  <option value="daily" className="bg-gray-900">Daily</option>
                  <option value="weekly" className="bg-gray-900">Weekly</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating || !newHabit.name.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-green-500/25"
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Create Habit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits List */}
        <div className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Your Habits
            </h2>
            {habits.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>{Math.round((completedToday / habits.length) * 100)}% completion rate</span>
              </div>
            )}
          </div>

          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((habit, idx) => {
                const isDone = isHabitDoneToday(habit);
                const streak = getStreak(habit);
                const isToggling = toggling === habit.id;

                return (
                  <div
                    key={habit.id}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all animate-slide-up ${
                      isDone
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={isToggling}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all transform ${
                        isToggling ? 'scale-90 opacity-50' : isDone ? 'scale-100' : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: isDone ? habit.color : 'transparent',
                        border: `3px solid ${habit.color}`,
                        boxShadow: isDone ? `0 0 20px ${habit.color}50` : 'none',
                      }}
                    >
                      {isToggling ? (
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: habit.color }} />
                      ) : (
                        habit.emoji
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium transition-all ${
                        isDone ? 'line-through text-gray-400' : 'text-white'
                      }`}>
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          habit.frequency === 'daily'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {habit.frequency}
                        </span>
                        {streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-orange-400">
                            <Flame className="w-3 h-3" />
                            {streak} day{streak > 1 ? 's' : ''} streak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isDone && (
                        <div className="flex items-center gap-1 text-green-400 animate-bounce-in">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      )}

                      {!isDone && (
                        <span className="text-xs text-gray-500">Not done</span>
                      )}

                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Award className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No habits yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Start building positive habits today! Use Quick Add for presets or create your own.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowPresets(true)}
                  className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-gray-300 rounded-xl transition"
                >
                  <Zap className="w-4 h-4" />
                  Quick Add
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-green-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Create Habit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        {habits.length > 0 && (
          <div className="glass rounded-2xl p-6 mt-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              This Week
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - idx));
                const dateStr = date.toISOString().split('T')[0];
                const dayCompleted = habits.filter(h => h.completed_dates?.includes(dateStr)).length;
                const percentage = habits.length > 0 ? (dayCompleted / habits.length) * 100 : 0;

                return (
                  <div key={idx} className="text-center">
                    <p className="text-xs text-gray-400 mb-2">{day}</p>
                    <div className="relative">
                      <div className="w-full aspect-square rounded-xl bg-white/5 flex items-center justify-center">
                        <span className={`text-sm font-medium ${
                          percentage >= 100 ? 'text-green-400' :
                          percentage >= 50 ? 'text-yellow-400' :
                          percentage > 0 ? 'text-orange-400' : 'text-gray-500'
                        }`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      {percentage >= 100 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
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
