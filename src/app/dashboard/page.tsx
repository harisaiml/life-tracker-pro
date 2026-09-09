'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, Trophy, Flame, Droplets, Calendar, LogOut, Target,
  Plus, TrendingUp, Award, Salad, Dumbbell
} from 'lucide-react';
import { getUser, clearUser, getTasks, getHabits, getHabitLogs, getDietEntries, getGoals, toggleHabitLog, updateTask } from '@/lib/storage';
import { User, Task, Habit } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [dietEntries, setDietEntries] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData();
    setLoading(false);
  }, [router]);

  const loadData = () => {
    setTasks(getTasks());
    setHabits(getHabits());
    setHabitLogs(getHabitLogs());
    setDietEntries(getDietEntries());
    setGoals(getGoals());
  };

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  const toggleTaskComplete = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed: !completed });
    loadData();
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isLogged = toggleHabitLog(habitId, today);
    loadData();
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate === today || !t.dueDate);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;
  const todayHabits = habits;
  const completedTodayHabits = habitLogs.filter(l => l.date === today).length;

  // Calculate stats
  const totalCalories = dietEntries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + (e.calories || 0), 0);
  const totalWater = dietEntries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + (e.water || 0), 0);
  const activeGoals = goals.filter(g => !g.completed).length;

  const isHabitDoneToday = (habitId: string) => {
    return habitLogs.some(l => l.habitId === habitId && l.date === today);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Life Tracker</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CheckCircle}
            label="Tasks Today"
            value={`${completedTodayTasks}/${todayTasks.length}`}
            color="blue"
          />
          <StatCard
            icon={Trophy}
            label="Habits Done"
            value={`${completedTodayHabits}/${todayHabits.length}`}
            color="green"
          />
          <StatCard
            icon={Droplets}
            label="Water Intake"
            value={`${totalWater}/8 glasses`}
            color="cyan"
          />
          <StatCard
            icon={Flame}
            label="Calories"
            value={`${totalCalories}/2000`}
            color="orange"
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <NavCard href="/dashboard/tasks" icon={Target} title="Tasks" description="Manage your tasks" color="blue" />
          <NavCard href="/dashboard/habits" icon={Award} title="Habits" description="Track daily habits" color="green" />
          <NavCard href="/dashboard/diet" icon={Salad} title="Diet" description="Log your meals" color="purple" />
          <NavCard href="/dashboard/goals" icon={TrendingUp} title="Goals" description="Track your goals" color="orange" />
        </div>

        {/* Today's Tasks & Habits */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
              <Link href="/dashboard/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id, task.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks for today</p>
                <Link href="/dashboard/tasks" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                  Create a task →
                </Link>
              </div>
            )}
          </div>

          {/* Today's Habits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Habits</h2>
              <Link href="/dashboard/habits" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            {todayHabits.length > 0 ? (
              <div className="space-y-3">
                {todayHabits.map(habit => (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isHabitDoneToday(habit.id) ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${
                        isHabitDoneToday(habit.id) ? 'bg-green-500 text-white' : 'bg-white border-2'
                      }`}
                      style={{ borderColor: isHabitDoneToday(habit.id) ? undefined : habit.color }}
                    >
                      {habit.emoji}
                    </button>
                    <div className="flex-1">
                      <p className={`text-gray-900 ${isHabitDoneToday(habit.id) ? 'line-through text-gray-500' : ''}`}>
                        {habit.name}
                      </p>
                    </div>
                    {isHabitDoneToday(habit.id) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No habits tracked yet</p>
                <Link href="/dashboard/habits" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                  Create a habit →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function NavCard({ href, icon: Icon, title, description, color }: { href: string; icon: any; title: string; description: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} rounded-xl p-4 transition-colors`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
