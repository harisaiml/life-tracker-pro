'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Task, Habit, DietEntry, Goal, MoodEntry } from '@/lib/supabase'
import {
  CheckCircle, Target, Award, Salad, TrendingUp, Heart,
  LogOut, Plus, Flame, Droplets, Moon, Loader2
} from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [tasksRes, habitsRes, dietRes, goalsRes, moodRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('diet_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('mood_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      setTasks(tasksRes.data || [])
      setHabits(habitsRes.data || [])
      setDietEntries(dietRes.data || [])
      setGoals(goalsRes.data || [])
      setMoodEntries(moodRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  // Calculate stats
  const todayTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed).length
  const completedTodayHabits = habits.filter(h => h.completed_dates?.includes(today)).length
  const totalCalories = dietEntries
    .filter(e => e.created_at?.startsWith(today))
    .reduce((sum, e) => sum + (e.calories || 0), 0)
  const totalWater = dietEntries
    .filter(e => e.created_at?.startsWith(today))
    .reduce((sum, e) => sum + (e.water_ml || 0), 0)
  const activeGoals = goals.filter(g => g.current_value < g.target_value).length

  // Get today's mood
  const todayMood = moodEntries.find(m => m.created_at?.startsWith(today))

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
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Life Tracker Pro</h1>
                <p className="text-sm text-gray-400">Welcome, {user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Target} label="Active Tasks" value={`${todayTasks.length}`} subtext={`${completedTasks} completed`} color="blue" />
          <StatCard icon={Award} label="Habits Today" value={`${completedTodayHabits}/${habits.length}`} subtext="Keep going!" color="green" />
          <StatCard icon={Droplets} label="Water" value={`${Math.round(totalWater / 250)}`} subtext="glasses" color="cyan" />
          <StatCard icon={Flame} label="Calories" value={`${totalCalories}`} subtext="consumed" color="orange" />
          <StatCard icon={Heart} label="Mood" value={todayMood?.emoji || '😐'} subtext={todayMood?.mood || 'Track today'} color="pink" />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <NavCard href="/dashboard/tasks" icon={Target} title="Tasks" description="Manage your tasks" color="blue" />
          <NavCard href="/dashboard/habits" icon={Award} title="Habits" description="Track daily habits" color="green" />
          <NavCard href="/dashboard/diet" icon={Salad} title="Diet" description="Log your meals" color="purple" />
          <NavCard href="/dashboard/goals" icon={TrendingUp} title="Goals" description="Track your goals" color="orange" />
          <NavCard href="/dashboard/mood" icon={Heart} title="Mood" description="How are you?" color="pink" />
        </div>

        {/* Today's Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
              <Link href="/dashboard/tasks" className="text-purple-400 hover:text-purple-300 text-sm">
                View All →
              </Link>
            </div>
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="flex-1 text-sm">{task.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks for today!</p>
                <Link href="/dashboard/tasks" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                  Create a task →
                </Link>
              </div>
            )}
          </div>

          {/* Today's Habits */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
              <Link href="/dashboard/habits" className="text-green-400 hover:text-green-300 text-sm">
                View All →
              </Link>
            </div>
            {habits.length > 0 ? (
              <div className="space-y-3">
                {habits.slice(0, 5).map((habit, idx) => {
                  const isDone = habit.completed_dates?.includes(today)
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isDone ? 'bg-green-500/20' : 'bg-white/5'
                      } animate-slide-up`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <span className="text-2xl">{habit.emoji}</span>
                      <span className={`flex-1 text-sm ${isDone ? 'line-through opacity-50' : ''}`}>
                        {habit.name}
                      </span>
                      {isDone && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No habits tracked yet!</p>
                <Link href="/dashboard/habits" className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block">
                  Create a habit →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals > 0 && (
          <div className="mt-6 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Goals</h2>
              <Link href="/dashboard/goals" className="text-orange-400 hover:text-orange-300 text-sm">
                View All →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.filter(g => g.current_value < g.target_value).slice(0, 3).map((goal, idx) => {
                const progress = Math.round((goal.current_value / goal.target_value) * 100)
                return (
                  <div
                    key={goal.id}
                    className="bg-white/5 rounded-xl p-4 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{goal.title}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{goal.current_value} / {goal.target_value} {goal.unit}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: any; label: string; value: string; subtext: string; color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  }

  return (
    <div className={`glass rounded-2xl p-4 border ${colorClasses[color]} animate-slide-up`}>
      <Icon className={`w-5 h-5 mb-2 ${
        color === 'blue' ? 'text-blue-400' :
        color === 'green' ? 'text-green-400' :
        color === 'orange' ? 'text-orange-400' :
        color === 'cyan' ? 'text-cyan-400' : 'text-pink-400'
      }`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  )
}

function NavCard({ href, icon: Icon, title, description, color }: {
  href: string; icon: any; title: string; description: string; color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'hover:border-blue-500/50 hover:bg-blue-500/10',
    green: 'hover:border-green-500/50 hover:bg-green-500/10',
    orange: 'hover:border-orange-500/50 hover:bg-orange-500/10',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    pink: 'hover:border-pink-500/50 hover:bg-pink-500/10',
  }

  return (
    <Link
      href={href}
      className={`glass rounded-2xl p-4 border border-transparent transition-all ${colorClasses[color]} animate-slide-up`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-gray-400">{description}</p>
    </Link>
  )
}
