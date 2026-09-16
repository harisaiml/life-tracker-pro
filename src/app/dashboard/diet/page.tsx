'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, X, ArrowLeft, Salad, Flame, Droplets, Beef, Wheat, Zap } from 'lucide-react';
import { getDietEntries, addDietEntry, deleteDietEntry, generateId, getTodayDate } from '@/lib/storage';
import { DietEntry } from '@/types';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
];

const DIET_PRESETS = [
  { name: 'Grilled Chicken Salad', mealType: 'lunch' as const, calories: 350, protein: 35, carbs: 15, fat: 15 },
  { name: 'Oatmeal with Berries', mealType: 'breakfast' as const, calories: 280, protein: 8, carbs: 50, fat: 5 },
  { name: 'Salmon with Vegetables', mealType: 'dinner' as const, calories: 450, protein: 40, carbs: 20, fat: 22 },
  { name: 'Greek Yogurt Parfait', mealType: 'breakfast' as const, calories: 220, protein: 15, carbs: 30, fat: 5 },
  { name: 'Turkey Sandwich', mealType: 'lunch' as const, calories: 380, protein: 25, carbs: 40, fat: 12 },
  { name: 'Protein Smoothie', mealType: 'snack' as const, calories: 180, protein: 20, carbs: 15, fat: 4 },
  { name: 'Quinoa Buddha Bowl', mealType: 'lunch' as const, calories: 420, protein: 15, carbs: 60, fat: 14 },
  { name: 'Scrambled Eggs Toast', mealType: 'breakfast' as const, calories: 350, protein: 18, carbs: 35, fat: 16 },
  { name: 'Grilled Steak Dinner', mealType: 'dinner' as const, calories: 550, protein: 50, carbs: 10, fat: 35 },
  { name: 'Mixed Nuts Snack', mealType: 'snack' as const, calories: 170, protein: 5, carbs: 8, fat: 15 },
];

export default function DietPage() {
  const [entries, setEntries] = useState<DietEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newEntry, setNewEntry] = useState({
    mealType: 'breakfast' as DietEntry['mealType'],
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    notes: '',
  });

  useEffect(() => {
    setEntries(getDietEntries());
  }, []);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DietEntry = {
      id: generateId(),
      ...newEntry,
      date: getTodayDate(),
    };
    addDietEntry(entry);
    setEntries(getDietEntries());
    setShowForm(false);
    setNewEntry({
      mealType: 'breakfast',
      foodName: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      notes: '',
    });
  };

  const handleQuickAdd = (preset: typeof DIET_PRESETS[0]) => {
    const entry: DietEntry = {
      id: generateId(),
      mealType: preset.mealType,
      foodName: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      water: 0,
      notes: '',
      date: getTodayDate(),
    };
    addDietEntry(entry);
    setEntries(getDietEntries());
  };

  const handleDelete = (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteDietEntry(entryId);
      setEntries(getDietEntries());
    }
  };

  const today = getTodayDate();
  const todayEntries = entries.filter(e => e.date === today);

  // Calculate totals
  const totalCalories = todayEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const totalProtein = todayEntries.reduce((sum, e) => sum + (e.protein || 0), 0);
  const totalCarbs = todayEntries.reduce((sum, e) => sum + (e.carbs || 0), 0);
  const totalFat = todayEntries.reduce((sum, e) => sum + (e.fat || 0), 0);
  const totalWater = todayEntries.reduce((sum, e) => sum + (e.water || 0), 0);

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
                <h1 className="text-xl font-bold text-gray-900">Diet Tracker</h1>
                <p className="text-sm text-gray-500">Track your nutrition and water intake</p>
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
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Log Meal
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
              <h2 className="text-lg font-semibold text-gray-900">Popular Food Presets</h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {DIET_PRESETS.map((preset, idx) => {
                const meal = MEAL_TYPES.find(m => m.value === preset.mealType);
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-center"
                  >
                    <span className="text-2xl mb-1">{meal?.emoji}</span>
                    <span className="text-sm text-gray-900">{preset.name}</span>
                    <span className="text-xs text-gray-500">{preset.calories} cal</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nutrition Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
                <p className="text-sm text-gray-500">Calories</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalWater}</p>
                <p className="text-sm text-gray-500">Glasses of Water</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Beef className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalProtein}g</p>
                <p className="text-sm text-gray-500">Protein</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Wheat className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCarbs}g</p>
                <p className="text-sm text-gray-500">Carbs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Entry Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Log Food Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map(meal => (
                    <button
                      key={meal.value}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mealType: meal.value as any })}
                      className={`p-3 rounded-lg border-2 transition ${
                        newEntry.mealType === meal.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-xl">{meal.emoji}</span>
                      <p className="text-xs mt-1">{meal.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
                <input
                  type="text"
                  value={newEntry.foodName}
                  onChange={(e) => setNewEntry({ ...newEntry, foodName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Grilled Chicken Salad"
                  required
                  style={{ color: '#111827' }}
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newEntry.calories || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    style={{ color: '#111827' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newEntry.protein || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, protein: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#111827' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newEntry.carbs || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, carbs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#111827' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={newEntry.fat || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, fat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#111827' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Water (glasses)</label>
                <input
                  type="number"
                  value={newEntry.water || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, water: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  style={{ color: '#111827' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                  style={{ color: '#111827' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Log Entry
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

        {/* Today's Entries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Food Log</h2>
          {todayEntries.length > 0 ? (
            <div className="space-y-3">
              {todayEntries.map(entry => {
                const meal = MEAL_TYPES.find(m => m.value === entry.mealType);
                return (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      {meal?.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{entry.foodName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" /> {entry.calories} cal
                        </span>
                        <span className="flex items-center gap-1">
                          <Beef className="w-4 h-4" /> {entry.protein}g protein
                        </span>
                        {entry.water > 0 && (
                          <span className="flex items-center gap-1">
                            <Droplets className="w-4 h-4" /> {entry.water} water
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-400 hover:text-red-500 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Salad className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No meals logged today</p>
              <p className="text-gray-400 text-sm">Start tracking your nutrition by logging your first meal!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
