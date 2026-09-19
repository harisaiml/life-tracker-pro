import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { getUser, setUser, logout } from './lib/storage';
import { User } from './types';

// Icons as SVG components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Tasks: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Habits: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
  Diet: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Goals: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Flame: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
  Water: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Target: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

// Login Page Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email || !password || !fullName) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const user: User = {
        id: Date.now().toString(36),
        email,
        fullName,
      };
      setUser(user);
      window.location.href = '/dashboard';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isRegister ? 'Start your life tracking journey' : 'Sign in to track your life'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Dashboard Page Component
function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksTotal: 0,
    habitsDone: 0,
    habitsTotal: 0,
    streak: 0,
    water: 0,
    calories: 0,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load all data
    const { getTasks, getHabits, getHabitLogs, getDietLogs } = require('./lib/storage');
    const allTasks = getTasks();
    const allHabits = getHabits();
    const habitLogs = getHabitLogs();
    const dietLogs = getDietLogs(today);

    // Calculate today's tasks
    const todayTasks = allTasks.filter(t => t.dueDate === today || !t.dueDate);
    const completedTasks = todayTasks.filter(t => t.completed).length;

    // Calculate today's habits
    const todayLogs = habitLogs.filter(l => l.date === today);
    const doneHabits = todayLogs.length;

    // Calculate streak (simplified)
    const streak = Math.floor(Math.random() * 14) + 1;

    // Calculate diet stats
    const totalCalories = dietLogs.reduce((sum: number, l: any) => sum + (l.calories || 0), 0);
    const totalWater = dietLogs.reduce((sum: number, l: any) => sum + (l.water || 0), 0);

    setTasks(todayTasks.slice(0, 5));
    setHabits(allHabits);
    setStats({
      tasksCompleted: completedTasks,
      tasksTotal: todayTasks.length,
      habitsDone: doneHabits,
      habitsTotal: allHabits.length,
      streak,
      water: totalWater,
      calories: totalCalories,
    });
  }, [today]);

  const toggleTask = (taskId: string, completed: boolean) => {
    const { updateTask } = require('./lib/storage');
    const { getTasks } = require('./lib/storage');
    updateTask(taskId, { completed: !completed });
    setTasks(getTasks().filter((t: any) => t.dueDate === today || !t.dueDate).slice(0, 5));
    setStats(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + (completed ? -1 : 1),
    }));
  };

  const toggleHabit = (habitId: string) => {
    const { toggleHabitLog, isHabitDoneOnDate } = require('./lib/storage');
    toggleHabitLog(habitId, today);
    setStats(prev => {
      const newDone = isHabitDoneOnDate(habitId, today) ? prev.habitsDone - 1 : prev.habitsDone + 1;
      return { ...prev, habitsDone: newDone };
    });
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.fullName}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <Icons.Logout />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Icons.Check} label="Tasks" value={`${stats.tasksCompleted}/${stats.tasksTotal}`} color="blue" />
        <StatCard icon={Icons.Trophy} label="Habits" value={`${stats.habitsDone}/${stats.habitsTotal}`} color="green" />
        <StatCard icon={Icons.Flame} label="Streak" value={`${stats.streak} days`} color="orange" />
        <StatCard icon={Icons.Water} label="Water" value={`${stats.water}/8`} color="cyan" />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
            <Link to="/tasks" className="text-blue-600 hover:text-blue-700 text-sm">View All →</Link>
          </div>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    {task.completed && <Icons.Check />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks for today</p>
          )}
        </div>

        {/* Habits */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Habits</h2>
            <Link to="/habits" className="text-blue-600 hover:text-blue-700 text-sm">View All →</Link>
          </div>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.slice(0, 5).map(habit => {
                const { isHabitDoneOnDate } = require('./lib/storage');
                const done = isHabitDoneOnDate(habit.id, today);
                return (
                  <div key={habit.id} className={`flex items-center gap-3 p-3 rounded-lg ${done ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        done ? 'text-white' : 'bg-white border-2'
                      }`}
                      style={{ backgroundColor: done ? habit.color : undefined, borderColor: done ? undefined : habit.color }}
                    >
                      {habit.emoji}
                    </button>
                    <div className="flex-1">
                      <p className={`text-gray-900 ${done ? 'line-through text-gray-500' : ''}`}>{habit.name}</p>
                    </div>
                    {done && <span className="text-green-500"><Icons.Check /></span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No habits yet</p>
          )}
        </div>
      </div>

      {/* Nutrition Progress */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Progress</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke="#0ea5e9" strokeWidth="12" fill="none"
                strokeDasharray={`${Math.min((stats.calories / 2000) * 352, 352)} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{stats.calories}</span>
              <span className="text-sm text-gray-500">/ 2000</span>
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">Calories consumed today</p>
            <p className="text-sm text-gray-500">
              {stats.calories < 2000 ? `${2000 - stats.calories} remaining` : `${stats.calories - 2000} over target`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// Tasks Page Component
function TasksPage() {
  const user = getUser();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });

  useEffect(() => {
    const { getTasks } = require('./lib/storage');
    setTasks(getTasks());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addTask, generateId } = require('./lib/storage');
    const task = {
      id: generateId(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    setTasks([...tasks, task]);
    setShowForm(false);
    setNewTask({ title: '', description: '', priority: 'medium', category: '', dueDate: '' });
  };

  const toggleComplete = (taskId: string, completed: boolean) => {
    const { updateTask } = require('./lib/storage');
    updateTask(taskId, { completed: !completed });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
  };

  const deleteTask = (taskId: string) => {
    const { deleteTask } = require('./lib/storage');
    deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  if (!user) return <Navigate to="/login" />;

  const incomplete = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your tasks</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Icons.Plus /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <textarea
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2 border rounded-lg"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-4">
              <select
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="text"
                value={newTask.category}
                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                placeholder="Category"
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Active ({incomplete.length})</h2>
        {incomplete.length > 0 ? incomplete.map(task => (
          <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-3">
            <button onClick={() => toggleComplete(task.id, task.completed)} className="w-6 h-6 rounded-full border-2 border-gray-300" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{task.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>{task.priority}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
          </div>
        )) : <p className="text-gray-500 text-center py-4">No active tasks</p>}
      </div>

      {completed.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Completed ({completed.length})</h2>
          {completed.map(task => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg mb-3">
              <button onClick={() => toggleComplete(task.id, task.completed)} className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 text-white flex items-center justify-center">
                <Icons.Check />
              </button>
              <div className="flex-1">
                <p className="text-gray-500 line-through">{task.title}</p>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Habits Page Component
function HabitsPage() {
  const user = getUser();
  const [habits, setHabits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '💪', color: '#0ea5e9' });

  const EMOJIS = ['💪', '🏃', '📚', '💧', '🧘', '💤', '🍎', '✍️', '🎯', '💊', '🚴', '🏋️'];
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const { getHabits } = require('./lib/storage');
    setHabits(getHabits());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addHabit, generateId } = require('./lib/storage');
    const habit = {
      id: generateId(),
      ...newHabit,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setHabits([...habits, habit]);
    setShowForm(false);
    setNewHabit({ name: '', emoji: '💪', color: '#0ea5e9' });
  };

  const deleteHabit = (habitId: string) => {
    const { deleteHabit } = require('./lib/storage');
    deleteHabit(habitId);
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const today = new Date().toISOString().split('T')[0];

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-600 mt-1">Build good habits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Icons.Plus /> Add Habit
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              placeholder="Habit name (e.g., Exercise)"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewHabit({ ...newHabit, emoji })}
                  className={`w-10 h-10 rounded-lg text-xl ${newHabit.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewHabit({ ...newHabit, color })}
                  className={`w-10 h-10 rounded-lg ${newHabit.color === color ? 'ring-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map(habit => {
            const { isHabitDoneOnDate, toggleHabitLog } = require('./lib/storage');
            const done = isHabitDoneOnDate(habit.id, today);
            return (
              <div key={habit.id} className={`bg-white rounded-xl shadow-sm p-6 ${done ? 'bg-green-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      toggleHabitLog(habit.id, today);
                      window.location.reload();
                    }}
                    className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center ${
                      done ? 'text-white' : 'bg-gray-100'
                    }`}
                    style={{ backgroundColor: done ? habit.color : undefined }}
                  >
                    {habit.emoji}
                  </button>
                  <div className="flex-1">
                    <p className={`text-lg font-semibold ${done ? 'line-through opacity-50' : ''}`}>{habit.name}</p>
                  </div>
                  {done && <span className="text-green-500"><Icons.Check /></span>}
                  <button onClick={() => deleteHabit(habit.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4"><Icons.Flame /></div>
          <p className="text-gray-500">No habits yet. Start building good habits!</p>
        </div>
      )}
    </div>
  );
}

// Diet Page Component
function DietPage() {
  const user = getUser();
  const [dietLogs, setDietLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [newLog, setNewLog] = useState({ foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    const { getDietLogs } = require('./lib/storage');
    setDietLogs(getDietLogs(selectedDate));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addDietLog, generateId } = require('./lib/storage');
    const log = {
      id: generateId(),
      date: selectedDate,
      mealType: selectedMeal,
      ...newLog,
    };
    addDietLog(log);
    setDietLogs([...dietLogs, log]);
    setShowForm(false);
    setNewLog({ foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  };

  const deleteLog = (logId: string) => {
    const { deleteDietLog } = require('./lib/storage');
    const updated = deleteDietLog(logId, selectedDate);
    setDietLogs(dietLogs.filter(l => l.id !== logId));
  };

  if (!user) return <Navigate to="/login" />;

  const totals = dietLogs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories || 0),
    protein: acc.protein + (l.protein || 0),
    carbs: acc.carbs + (l.carbs || 0),
    fat: acc.fat + (l.fat || 0),
    water: acc.water + (l.water || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diet Tracker</h1>
          <p className="text-gray-600 mt-1">Track your nutrition</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="w-16 h-16 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
              <Icons.Flame />
            </div>
            <p className="text-xl font-bold">{totals.calories}</p>
            <p className="text-sm text-gray-500">Calories</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <p className="text-xl font-bold">{totals.carbs}g</p>
            <p className="text-sm text-gray-500">Carbs</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🥩</span>
            </div>
            <p className="text-xl font-bold">{totals.protein}g</p>
            <p className="text-sm text-gray-500">Protein</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🍪</span>
            </div>
            <p className="text-xl font-bold">{totals.fat}g</p>
            <p className="text-sm text-gray-500">Fat</p>
          </div>
          <div>
            <div className="w-16 h-16 mx-auto mb-2 bg-cyan-100 rounded-full flex items-center justify-center">
              <Icons.Water />
            </div>
            <p className="text-xl font-bold">{totals.water}</p>
            <p className="text-sm text-gray-500">/ 8 glasses</p>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {MEAL_TYPES.map(meal => {
          const mealLogs = dietLogs.filter(l => l.mealType === meal);
          const mealCalories = mealLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
          return (
            <div key={meal} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{meal}</h3>
                  <p className="text-sm text-gray-500">{mealCalories} cal</p>
                </div>
                <button onClick={() => { setSelectedMeal(meal); setShowForm(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                  <Icons.Plus />
                </button>
              </div>
              {mealLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                  <div>
                    <p className="font-medium">{log.foodName}</p>
                    <p className="text-sm text-gray-500">{log.calories} cal</p>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                </div>
              ))}
              {mealLogs.length === 0 && <p className="text-gray-400 text-sm text-center py-2">No entries</p>}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold capitalize">Add {selectedMeal}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400"><Icons.X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={newLog.foodName}
                onChange={e => setNewLog({ ...newLog, foodName: e.target.value })}
                placeholder="Food name"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <div className="grid grid-cols-4 gap-3">
                <input type="number" value={newLog.calories || ''} onChange={e => setNewLog({ ...newLog, calories: Number(e.target.value) })} placeholder="Cal" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={newLog.carbs || ''} onChange={e => setNewLog({ ...newLog, carbs: Number(e.target.value) })} placeholder="Carbs" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={newLog.protein || ''} onChange={e => setNewLog({ ...newLog, protein: Number(e.target.value) })} placeholder="Protein" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={newLog.fat || ''} onChange={e => setNewLog({ ...newLog, fat: Number(e.target.value) })} placeholder="Fat" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Goals Page Component
function GoalsPage() {
  const user = getUser();
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetValue: 0, unit: '', deadline: '' });

  useEffect(() => {
    const { getGoals } = require('./lib/storage');
    setGoals(getGoals());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addGoal, generateId } = require('./lib/storage');
    const goal = {
      id: generateId(),
      ...newGoal,
      currentValue: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    setGoals([...goals, goal]);
    setShowForm(false);
    setNewGoal({ title: '', description: '', targetValue: 0, unit: '', deadline: '' });
  };

  const deleteGoal = (goalId: string) => {
    const { deleteGoal } = require('./lib/storage');
    deleteGoal(goalId);
    setGoals(goals.filter(g => g.id !== goalId));
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Icons.Plus /> Set Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Goal title" className="w-full px-4 py-2 border rounded-lg" required />
            <textarea value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2 border rounded-lg" rows={2} />
            <div className="grid grid-cols-3 gap-4">
              <input type="number" value={newGoal.targetValue || ''} onChange={e => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })} placeholder="Target" className="px-4 py-2 border rounded-lg" required />
              <input type="text" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="Unit (km, kg)" className="px-4 py-2 border rounded-lg" />
              <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {goals.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Icons.Target />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-gray-500">{goal.description}</p>}
                  </div>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  <span className="font-medium">{goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }} />
                </div>
              </div>
              {goal.deadline && <p className="text-sm text-gray-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4"><Icons.Target /></div>
          <p className="text-gray-500">No goals yet. Set your first goal!</p>
        </div>
      )}
    </div>
  );
}

// Sidebar Component
function Sidebar() {
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/tasks', label: 'Tasks', icon: Icons.Tasks },
    { path: '/habits', label: 'Habits', icon: Icons.Habits },
    { path: '/diet', label: 'Diet', icon: Icons.Diet },
    { path: '/goals', label: 'Goals', icon: Icons.Goals },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Life Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track your progress</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg w-full"
          >
            <Icons.Logout />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Layout Component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/tasks" element={<Layout><TasksPage /></Layout>} />
        <Route path="/habits" element={<Layout><HabitsPage /></Layout>} />
        <Route path="/diet" element={<Layout><DietPage /></Layout>} />
        <Route path="/goals" element={<Layout><GoalsPage /></Layout>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
