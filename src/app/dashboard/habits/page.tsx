'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, CheckCircle, X, ArrowLeft, Award } from 'lucide-react';
import { getHabits, addHabit, deleteHabit, getHabitLogs, toggleHabitLog, generateId, getTodayDate } from '@/lib/storage';
import { Habit } from '@/types';

const EMOJI_OPTIONS = ['💪', '📚', '🏃', '💧', '🧘', '😴', '🥗', '✍️', '🎯', '🧠', '🎨', '🎵'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    emoji: '💪',
    color: '#3b82f6',
    frequency: 'daily' as 'daily' | 'weekly',
  });

  useEffect(() => {
    setHabits(getHabits());
    setHabitLogs(getHabitLogs());
  }, []);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const habit: Habit = {
      id: generateId(),
      name: newHabit.name,
      description: newHabit.description,
      emoji: newHabit.emoji,
      color: newHabit.color,
      frequency: newHabit.frequency,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setHabits(getHabits());
    setShowForm(false);
    setNewHabit({ name: '', description: '', emoji: '💪', color: '#3b82f6', frequency: 'daily' });
  };

  const handleToggleHabit = (habitId: string) => {
    const today = getTodayDate();
    toggleHabitLog(habitId, today);
    setHabitLogs(getHabitLogs());
  };

  const handleDelete = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
      setHabits(getHabits());
    }
  };

  const isHabitDoneToday = (habitId: string) => {
    const today = getTodayDate();
    return habitLogs.some(l => l.habitId === habitId && l.date === today);
  };

  const today = getTodayDate();
  const completedToday = habits.filter(h => isHabitDoneToday(h.id)).length;

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
                <h1 className="text-xl font-bold text-gray-900">Habits</h1>
                <p className="text-sm text-gray-500">Track your daily habits - {completedToday}/{habits.length} done today</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Habit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Habit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Habit</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Morning Exercise"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your habit"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, emoji })}
                      className={`w-10 h-10 text-xl rounded-lg transition ${
                        newHabit.emoji === emoji ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-10 h-10 rounded-lg transition ${
                        newHabit.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Habit
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

        {/* Habits List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Habits</h2>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    isHabitDoneToday(habit.id) ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                    style={{
                      backgroundColor: isHabitDoneToday(habit.id) ? habit.color : 'white',
                      border: `2px solid ${habit.color}`,
                      color: isHabitDoneToday(habit.id) ? 'white' : 'inherit'
                    }}
                  >
                    {habit.emoji}
                  </button>
                  <div className="flex-1">
                    <p className={`text-gray-900 font-medium ${isHabitDoneToday(habit.id) ? 'line-through text-gray-500' : ''}`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-gray-500 text-sm">{habit.description}</p>
                    )}
                  </div>
                  {isHabitDoneToday(habit.id) && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="text-gray-400 hover:text-red-500 transition p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No habits created yet</p>
              <p className="text-gray-400 text-sm">Start tracking your daily habits to build consistency!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
