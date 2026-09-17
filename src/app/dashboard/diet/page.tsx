'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, DietEntry } from '@/lib/supabase'
import {
  Plus, Trash2, ArrowLeft, Loader2, Salad, Flame, Droplets,
  UtensilsCrossed, X, Filter
} from 'lucide-react'

const MEAL_TYPES = [
  { value: 'all', label: 'All Meals', emoji: '🍽️' },
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
]

const DIET_PRESETS = [
  { name: 'Grilled Chicken Salad', mealType: 'lunch' as const, calories: 350, protein: 35, carbs: 15, fat: 15, water: 0 },
  { name: 'Oatmeal with Berries', mealType: 'breakfast' as const, calories: 280, protein: 8, carbs: 50, fat: 5, water: 0 },
  { name: 'Salmon with Vegetables', mealType: 'dinner' as const, calories: 450, protein: 40, carbs: 20, fat: 22, water: 0 },
  { name: 'Greek Yogurt Parfait', mealType: 'breakfast' as const, calories: 220, protein: 15, carbs: 30, fat: 5, water: 0 },
  { name: 'Turkey Sandwich', mealType: 'lunch' as const, calories: 380, protein: 25, carbs: 40, fat: 12, water: 0 },
  { name: 'Protein Smoothie', mealType: 'snack' as const, calories: 180, protein: 20, carbs: 15, fat: 4, water: 200 },
  { name: 'Quinoa Buddha Bowl', mealType: 'lunch' as const, calories: 420, protein: 15, carbs: 60, fat: 14, water: 0 },
  { name: 'Scrambled Eggs Toast', mealType: 'breakfast' as const, calories: 350, protein: 18, carbs: 35, fat: 16, water: 0 },
  { name: 'Grilled Steak Dinner', mealType: 'dinner' as const, calories: 550, protein: 50, carbs: 10, fat: 35, water: 0 },
  { name: 'Mixed Nuts Snack', mealType: 'snack' as const, calories: 170, protein: 5, carbs: 8, fat: 15, water: 0 },
]

export default function DietPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DietEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [mealFilter, setMealFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [newEntry, setNewEntry] = useState({
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    waterMl: 0,
  })

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('diet_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading diet entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const entry = {
        user_id: user.id,
        food_name: newEntry.foodName,
        calories: newEntry.calories,
        protein: newEntry.protein,
        carbs: newEntry.carbs,
        fat: newEntry.fat,
        water_ml: newEntry.waterMl,
        meal_type: newEntry.mealType,
      }

      const { error } = await supabase.from('diet_entries').insert(entry)
      if (error) throw error

      await loadEntries()
      setShowForm(false)
      setNewEntry({
        mealType: 'breakfast',
        foodName: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        waterMl: 0,
      })
    } catch (error) {
      console.error('Error creating entry:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAdd = async (preset: typeof DIET_PRESETS[0]) => {
    if (!user) return

    setSubmitting(true)
    try {
      const entry = {
        user_id: user.id,
        food_name: preset.name,
        calories: preset.calories,
        protein: preset.protein,
        carbs: preset.carbs,
        fat: preset.fat,
        water_ml: preset.water,
        meal_type: preset.mealType,
      }

      const { error } = await supabase.from('diet_entries').insert(entry)
      if (error) throw error

      await loadEntries()
    } catch (error) {
      console.error('Error adding preset:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('diet_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      await loadEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.created_at?.startsWith(today))
  const filteredEntries = mealFilter === 'all'
    ? todayEntries
    : todayEntries.filter(e => e.meal_type === mealFilter)

  const totalCalories = todayEntries.reduce((sum, e) => sum + (e.calories || 0), 0)
  const totalProtein = todayEntries.reduce((sum, e) => sum + (e.protein || 0), 0)
  const totalCarbs = todayEntries.reduce((sum, e) => sum + (e.carbs || 0), 0)
  const totalFat = todayEntries.reduce((sum, e) => sum + (e.fat || 0), 0)
  const totalWater = todayEntries.reduce((sum, e) => sum + (e.water_ml || 0), 0)

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Salad className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Diet Tracker</h1>
                  <p className="text-sm text-gray-400">Track your nutrition</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 glass hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-green-500/25"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Log Meal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Quick Add Presets */}
        {showPresets && (
          <div className="glass rounded-2xl p-6 mb-6 border border-green-500/20 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Popular Food Presets</h2>
              <button onClick={() => setShowPresets(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {DIET_PRESETS.map((preset, idx) => {
                const meal = MEAL_TYPES.find(m => m.value === preset.mealType)
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    disabled={submitting}
                    className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-center animate-slide-up disabled:opacity-50"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <span className="text-2xl mb-1">{meal?.emoji}</span>
                    <span className="text-sm text-gray-200 line-clamp-1">{preset.name}</span>
                    <span className="text-xs text-gray-400">{preset.calories} cal</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Nutrition Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 border border-orange-500/30 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCalories}</p>
                <p className="text-xs text-gray-400">Calories</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-cyan-500/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalWater / 250)}</p>
                <p className="text-xs text-gray-400">Glasses Water</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-red-500/30 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProtein}g</p>
                <p className="text-xs text-gray-400">Protein</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-amber-500/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCarbs}g</p>
                <p className="text-xs text-gray-400">Carbs</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border border-yellow-500/30 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.06 23h1.66c.84 0 1.53-.65 1.63-1.47L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.06zM1 22v-1h15.03v1c0 .54-.45 1-1.03 1H2c-.55 0-1-.46-1-1zm15.03-7c0-.08-.03-.15-.05-.23l-.98-1.75h-4.95l-1.05 1.75c-.02.08-.03.15-.03.23v7h6.06v-7zM9.08 16.99l3.86-3.86c.34-.34.88-.34 1.22 0l3.86 3.86-5.08 5.08-3.86-3.86c-.34-.34-.34-.88 0-1.22z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFat}g</p>
                <p className="text-xs text-gray-400">Fat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Entry Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 border border-green-500/20 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Log Food Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.filter(m => m.value !== 'all').map(meal => (
                    <button
                      key={meal.value}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mealType: meal.value as any })}
                      className={`p-3 rounded-xl border-2 transition ${
                        newEntry.mealType === meal.value
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-white/10 hover:border-green-500/50'
                      }`}
                    >
                      <span className="text-xl block mb-1">{meal.emoji}</span>
                      <p className="text-xs text-gray-300">{meal.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Food Name</label>
                <input
                  type="text"
                  value={newEntry.foodName}
                  onChange={(e) => setNewEntry({ ...newEntry, foodName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                  placeholder="e.g., Grilled Chicken Salad"
                  required
                  style={{ color: '#fff' }}
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newEntry.calories || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    style={{ color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newEntry.protein || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, protein: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newEntry.carbs || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, carbs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={newEntry.fat || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, fat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    style={{ color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Water (ml)</label>
                <input
                  type="number"
                  value={newEntry.waterMl || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, waterMl: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-500"
                  placeholder="0"
                  min="0"
                  style={{ color: '#fff' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-green-500/25 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Log Entry
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

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {MEAL_TYPES.map(meal => (
            <button
              key={meal.value}
              onClick={() => setMealFilter(meal.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                mealFilter === meal.value
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
              }`}
            >
              <span>{meal.emoji}</span>
              <span>{meal.label}</span>
            </button>
          ))}
        </div>

        {/* Today's Entries */}
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Today&apos;s Food Log</h2>
          {filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map((entry, idx) => {
                const meal = MEAL_TYPES.find(m => m.value === entry.meal_type)
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
                      {meal?.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-100 font-medium">{entry.food_name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" /> {entry.calories} cal
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/>
                          </svg>
                          {entry.protein}g protein
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.06 23h1.66c.84 0 1.53-.65 1.63-1.47L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.06z"/>
                          </svg>
                          {entry.carbs}g carbs
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.06 23h1.66c.84 0 1.53-.65 1.63-1.47L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.06z"/>
                          </svg>
                          {entry.fat}g fat
                        </span>
                        {entry.water_ml > 0 && (
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-cyan-400" /> {entry.water_ml}ml
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-500 hover:text-red-400 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Salad className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-2">No meals logged {mealFilter !== 'all' ? 'for this meal' : 'today'}</p>
              <p className="text-gray-500 text-sm">Start tracking your nutrition by logging your first meal!</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl transition mx-auto"
              >
                <Plus className="w-4 h-4" />
                Log Meal
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}