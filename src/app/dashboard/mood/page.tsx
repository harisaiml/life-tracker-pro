'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, Heart, Calendar } from 'lucide-react'
import { supabase, MoodEntry } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const MOOD_OPTIONS = [
  { value: 'great', emoji: '\u{1F604}', label: 'Great', color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  { value: 'good', emoji: '\u{1F642}', label: 'Good', color: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  { value: 'okay', emoji: '\u{1F610}', label: 'Okay', color: '#eab308', gradient: 'from-yellow-500 to-amber-500' },
  { value: 'bad', emoji: '\u{1F614}', label: 'Bad', color: '#f97316', gradient: 'from-orange-500 to-amber-500' },
  { value: 'terrible', emoji: '\u{1F622}', label: 'Terrible', color: '#ef4444', gradient: 'from-red-500 to-rose-500' },
]

export default function MoodPage() {
  const { user } = useAuth()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)

  useEffect(() => {
    if (user) {
      fetchMoodEntries()
    }
  }, [user])

  const fetchMoodEntries = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMoodEntries(data || [])

      const today = new Date().toISOString().split('T')[0]
      const todayEntry = data?.find(
        (entry) => entry.created_at.split('T')[0] === today
      )
      if (todayEntry) {
        setTodayMood(todayEntry)
        setSelectedMood(todayEntry.mood)
        setNote(todayEntry.note || '')
      }
    } catch (error) {
      console.error('Error fetching mood entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveMood = async () => {
    if (!user || !selectedMood) return

    setSaving(true)
    try {
      const moodData = MOOD_OPTIONS.find((m) => m.value === selectedMood)
      const today = new Date().toISOString().split('T')[0]

      const existingEntry = moodEntries.find(
        (entry) => entry.created_at.split('T')[0] === today
      )

      if (existingEntry) {
        const { error } = await supabase
          .from('mood_entries')
          .update({
            mood: selectedMood,
            emoji: moodData?.emoji,
            note: note || null,
          })
          .eq('id', existingEntry.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('mood_entries').insert({
          user_id: user.id,
          mood: selectedMood,
          emoji: moodData?.emoji,
          note: note || null,
        })

        if (error) throw error
      }

      await fetchMoodEntries()
    } catch (error) {
      console.error('Error saving mood:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteMoodEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return

    try {
      const { error } = await supabase.from('mood_entries').delete().eq('id', id)

      if (error) throw error

      setMoodEntries(moodEntries.filter((entry) => entry.id !== id))

      const today = new Date().toISOString().split('T')[0]
      const deletedEntry = moodEntries.find(
        (entry) => entry.id === id && entry.created_at.split('T')[0] === today
      )
      if (deletedEntry) {
        setTodayMood(null)
        setSelectedMood(null)
        setNote('')
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const getMoodData = (mood: string) => {
    return MOOD_OPTIONS.find((m) => m.value === mood) || MOOD_OPTIONS[2]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <header className="relative backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-white/10 rounded-lg transition backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5 text-white/80" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Mood Tracker</h1>
                <p className="text-sm text-white/60">How are you feeling today?</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-pink-400">
              <Heart className="w-5 h-5 fill-pink-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 py-8 space-y-8">
        <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Log Your Mood</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm text-white/60 mb-4">Select your current mood:</p>
            <div className="grid grid-cols-5 gap-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                    selectedMood === option.value
                      ? `bg-gradient-to-br ${option.gradient} scale-105 shadow-lg`
                      : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">
                    {option.emoji}
                  </span>
                  <span className={`text-xs ${
                    selectedMood === option.value ? 'text-white' : 'text-white/60'
                  }`}>
                    {option.label}
                  </span>
                  {selectedMood === option.value && (
                    <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-white/60 mb-2 block">Add a note (optional):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is on your mind?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition"
              rows={3}
            />
          </div>

          <button
            onClick={saveMood}
            disabled={!selectedMood || saving}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedMood
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {todayMood ? "Update Today's Mood" : "Log Today's Mood"}
              </>
            )}
          </button>
        </section>

        {todayMood && (
          <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Mood</h2>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getMoodData(todayMood.mood).gradient} flex items-center justify-center text-3xl shadow-lg`}
              >
                {todayMood.emoji}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-lg">
                  Feeling {getMoodData(todayMood.mood).label}
                </p>
                {todayMood.note && (
                  <p className="text-white/60 text-sm mt-1">{todayMood.note}</p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  {new Date(todayMood.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Mood History</h2>

          {moodEntries.length > 0 ? (
            <div className="space-y-3">
              {moodEntries.map((entry) => {
                const moodData = getMoodData(entry.mood)
                return (
                  <div
                    key={entry.id}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${moodData.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                    >
                      {entry.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          Feeling {moodData.label}
                        </p>
                      </div>
                      {entry.note && (
                        <p className="text-white/60 text-sm mt-1 truncate">
                          {entry.note}
                        </p>
                      )}
                      <p className="text-white/40 text-xs mt-1">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMoodEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/60 mb-1">No mood entries yet</p>
              <p className="text-white/40 text-sm">
                Start tracking your mood to see your history here
              </p>
            </div>
          )}
        </section>

        {moodEntries.length > 0 && (
          <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Mood Distribution</h2>
            <div className="space-y-3">
              {MOOD_OPTIONS.map((option) => {
                const count = moodEntries.filter((e) => e.mood === option.value).length
                const percentage = Math.round((count / moodEntries.length) * 100)

                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <span className="text-xl w-8">{option.emoji}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${option.gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-white/60 text-sm w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}