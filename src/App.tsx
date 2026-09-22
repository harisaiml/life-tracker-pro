import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, Heart, Zap, Shield, Check, Plus, Trash2, X, Flame, Target, Coffee, Moon, BookOpen, Dumbbell, Droplets, Brain, TrendingUp, BookText, Scale, Calculator } from 'lucide-react';

// Types
interface User { id: string; email: string; fullName: string; }
interface Task { id: string; title: string; description: string; priority: 'low' | 'medium' | 'high'; completed: boolean; dueDate: string; createdAt: string; }
interface Habit { id: string; name: string; emoji: string; color: string; frequency: string; createdAt: string; }
interface DietLog { id: string; mealType: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; water: number; date: string; }
interface Goal { id: string; title: string; targetValue: number; currentValue: number; unit: string; completed: boolean; deadline: string; }
interface MoodEntry { id: string; mood: string; note: string; date: string; }
interface SleepEntry { id: string; hours: number; quality: 'poor' | 'fair' | 'good' | 'excellent'; date: string; notes: string; }
interface ExerciseEntry { id: string; type: string; duration: number; calories: number; date: string; }
interface NoteEntry { id: string; title: string; content: string; date: string; }
interface WeightEntry { id: string; weight: number; date: string; }

// Storage
const STORAGE_KEYS = { USER: 'lt_user', TASKS: 'lt_tasks', HABITS: 'lt_habits', DIET: 'lt_diet', GOALS: 'lt_goals', MOOD: 'lt_mood', HABIT_LOGS: 'lt_habit_logs', SLEEP: 'lt_sleep', EXERCISE: 'lt_exercise', NOTES: 'lt_notes', WEIGHT: 'lt_weight' };
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const getItem = <T,>(key: string): T[] => { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; };
const setItem = <T,>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

// Auth Context
interface AuthContextType { user: User | null; signIn: (email: string, password: string) => Promise<{ error: string | null }>; signUp: (email: string, name: string) => Promise<{ error: string | null }>; signOut: () => void; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error(); return ctx; };

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { const u = localStorage.getItem(STORAGE_KEYS.USER); if (u) setUser(JSON.parse(u)); }, []);
  const signIn = async (email: string, password: string) => {
    if (!email || !password) return { error: 'Fill all fields' };
    if (password.length < 6) return { error: 'Password min 6 chars' };
    const u: User = { id: generateId(), email, fullName: email.split('@')[0] };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    setUser(u); return { error: null };
  };
  const signUp = async (email: string, name: string) => {
    if (!email || !name) return { error: 'Fill all fields' };
    const u: User = { id: generateId(), email, fullName: name };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    setUser(u); return { error: null };
  };
  const signOut = () => { localStorage.removeItem(STORAGE_KEYS.USER); setUser(null); };
  return <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

// Login Page
function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = isLogin ? await signIn(email, password) : await signUp(email, name);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Life Tracker</h1>
          <p className="text-gray-400 mt-1">Track everything that matters</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500" placeholder="John Doe" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500" placeholder="Min 6 characters" required minLength={6} />
          </div>
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin">⟳</span> : null}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
          {isLogin ? "Don't have account? Sign Up" : 'Have account? Sign In'}
        </button>
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><Shield className="w-5 h-5 mx-auto text-green-400" /><p className="text-xs text-gray-400 mt-1">Secure</p></div>
            <div><Zap className="w-5 h-5 mx-auto text-yellow-400" /><p className="text-xs text-gray-400 mt-1">Fast</p></div>
            <div><Heart className="w-5 h-5 mx-auto text-red-400" /><p className="text-xs text-gray-400 mt-1">Free</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar
function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const nav = [
    { path: '/dashboard', label: 'Dashboard', icon: Sparkles },
    { path: '/tasks', label: 'Tasks', icon: Check },
    { path: '/habits', label: 'Habits', icon: Flame },
    { path: '/diet', label: 'Diet', icon: Coffee },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/mood', label: 'Mood', icon: Heart },
    { path: '/sleep', label: 'Sleep', icon: Moon },
    { path: '/exercise', label: 'Exercise', icon: Dumbbell },
    { path: '/notes', label: 'Notes', icon: BookText },
    { path: '/weight', label: 'Weight', icon: Scale },
  ];
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Life Tracker</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {nav.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === path ? 'bg-purple-500/30 text-purple-300' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            <Icon className="w-5 h-5" /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/20">
        <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-white/10 rounded-xl transition-all">
          <X className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}

// Dashboard
function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tasks: 0, habits: 0, calories: 0, water: 0 });

  useEffect(() => {
    const tasks = getItem<Task>(STORAGE_KEYS.TASKS);
    const habits = getItem<Habit>(STORAGE_KEYS.HABITS);
    const diet = getItem<DietLog>(STORAGE_KEYS.DIET);
    const today = new Date().toISOString().split('T')[0];
    const todayDiet = diet.filter(d => d.date === today);
    setStats({
      tasks: tasks.filter(t => !t.completed).length,
      habits: habits.length,
      calories: todayDiet.reduce((s, d) => s + d.calories, 0),
      water: todayDiet.reduce((s, d) => s + d.water, 0),
    });
  }, []);

  return (
    <div className="ml-64 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.fullName}!</h1>
      <p className="text-gray-400 mb-8">Here's your progress today</p>
      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={Check} label="Tasks" value={stats.tasks} color="from-purple-500 to-purple-600" />
        <StatCard icon={Flame} label="Habits" value={stats.habits} color="from-orange-500 to-orange-600" />
        <StatCard icon={Coffee} label="Calories" value={stats.calories} color="from-green-500 to-green-600" />
        <StatCard icon={Droplets} label="Water" value={`${stats.water}/8`} color="from-blue-500 to-blue-600" />
      </div>
      <div className="grid grid-cols-2 gap-6 mt-8">
        <QuickAction to="/tasks" icon={Check} label="Add Task" color="purple" />
        <QuickAction to="/habits" icon={Flame} label="Track Habit" color="orange" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, color }: { to: string; icon: any; label: string; color: string }) {
  return (
    <Link to={to} className={`bg-gradient-to-br ${color === 'purple' ? 'from-purple-500/20 to-purple-600/20' : 'from-orange-500/20 to-orange-600/20'} backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all flex items-center gap-4`}>
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-orange-500 to-orange-600'} flex items-center justify-center`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="text-xl font-semibold text-white">{label}</span>
    </Link>
  );
}

// Tasks Page
function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, dueDate: '' });

  useEffect(() => { setTasks(getItem(STORAGE_KEYS.TASKS)); }, []);

  const addTask = () => {
    if (!newTask.title) return;
    const task: Task = { id: generateId(), ...newTask, completed: false, createdAt: new Date().toISOString() };
    const updated = [...tasks, task];
    setItem(STORAGE_KEYS.TASKS, updated);
    setTasks(updated);
    setShowForm(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setItem(STORAGE_KEYS.TASKS, updated);
    setTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setItem(STORAGE_KEYS.TASKS, updated);
    setTasks(updated);
  };

  const priorities = { low: 'bg-gray-500', medium: 'bg-yellow-500', high: 'bg-red-500' };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Tasks</h1><p className="text-gray-400 mt-1">Manage your tasks</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all">
          <Plus className="w-5 h-5" /> Add Task
        </button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none focus:border-purple-500" />
          <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Description (optional)" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none focus:border-purple-500" />
          <div className="flex gap-4 mb-4">
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={addTask} className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {tasks.filter(t => !t.completed).map(task => (
          <div key={task.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <button onClick={() => toggleTask(task.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
              {task.completed && <Check className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1">
              <p className={`text-white font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorities[task.priority]}`}>{task.priority}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {tasks.filter(t => t.completed).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-4">Completed</h3>
            {tasks.filter(t => t.completed).map(task => (
              <div key={task.id} className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-4 border border-green-500/20 flex items-center gap-4 mb-2">
                <button onClick={() => toggleTask(task.id)} className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></button>
                <p className="flex-1 text-gray-400 line-through">{task.title}</p>
                <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Habits Page
function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '💪', color: '#8b5cf6' });
  const [logs, setLogs] = useState<{ habitId: string; date: string }[]>([]);

  useEffect(() => {
    setHabits(getItem(STORAGE_KEYS.HABITS));
    const today = new Date().toISOString().split('T')[0];
    const allLogs = getItem<{ habitId: string; date: string }>(STORAGE_KEYS.HABIT_LOGS);
    setLogs(allLogs.filter(l => l.date === today));
  }, []);

  const addHabit = () => {
    if (!newHabit.name) return;
    const habit: Habit = { id: generateId(), ...newHabit, frequency: 'daily', createdAt: new Date().toISOString() };
    const updated = [...habits, habit];
    setItem(STORAGE_KEYS.HABITS, updated);
    setHabits(updated);
    setShowForm(false);
    setNewHabit({ name: '', emoji: '💪', color: '#8b5cf6' });
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const allLogs = getItem<{ habitId: string; date: string }>(STORAGE_KEYS.HABIT_LOGS);
    const existing = allLogs.findIndex(l => l.habitId === id && l.date === today);
    if (existing >= 0) {
      allLogs.splice(existing, 1);
    } else {
      allLogs.push({ habitId: id, date: today });
    }
    setItem(STORAGE_KEYS.HABIT_LOGS, allLogs);
    setLogs(allLogs.filter(l => l.date === today));
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setItem(STORAGE_KEYS.HABITS, updated);
    setHabits(updated);
  };

  const EMOJIS = ['💪', '🏃', '📚', '💧', '🧘', '💤', '🍎', '✍️', '🎯', '💊'];
  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Habits</h1><p className="text-gray-400 mt-1">Build good habits</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all">
          <Plus className="w-5 h-5" /> Add Habit
        </button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} placeholder="Habit name" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none focus:border-orange-500" />
          <div className="flex flex-wrap gap-2 mb-4">
            {EMOJIS.map(e => <button key={e} onClick={() => setNewHabit({ ...newHabit, emoji: e })} className={`w-10 h-10 rounded-xl text-xl ${newHabit.emoji === e ? 'bg-orange-500 ring-2 ring-orange-300' : 'bg-white/10'}`}>{e}</button>)}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {COLORS.map(c => <button key={c} onClick={() => setNewHabit({ ...newHabit, color: c })} className={`w-10 h-10 rounded-xl ${newHabit.color === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />)}
          </div>
          <div className="flex gap-3">
            <button onClick={addHabit} className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {habits.map(habit => {
          const done = logs.some(l => l.habitId === habit.id);
          return (
            <div key={habit.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${done ? 'bg-green-500/10' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => toggleHabit(habit.id)} className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center ${done ? 'text-white' : 'bg-white/10'}`} style={{ backgroundColor: done ? habit.color : undefined }}>
                  {habit.emoji}
                </button>
                <div className="flex-1">
                  <p className={`text-lg font-semibold text-white ${done ? 'line-through opacity-50' : ''}`}>{habit.name}</p>
                </div>
                {done && <Check className="w-6 h-6 text-green-400" />}
              </div>
              <button onClick={() => deleteHabit(habit.id)} className="text-gray-400 hover:text-red-400 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          );
        })}
      </div>
      {habits.length === 0 && <div className="text-center py-20 text-gray-400">No habits yet. Start building good habits!</div>}
    </div>
  );
}

// Diet Page
function DietPage() {
  const [entries, setEntries] = useState<DietLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ mealType: 'breakfast', foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { setEntries(getItem<DietLog>(STORAGE_KEYS.DIET).filter(e => e.date === selectedDate)); }, [selectedDate]);

  const addEntry = () => {
    if (!newEntry.foodName) return;
    const entry: DietLog = { id: generateId(), date: selectedDate, ...newEntry };
    const all = getItem<DietLog>(STORAGE_KEYS.DIET);
    all.push(entry);
    setItem(STORAGE_KEYS.DIET, all);
    setEntries([...entries, entry]);
    setShowForm(false);
    setNewEntry({ mealType: 'breakfast', foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  };

  const deleteEntry = (id: string) => {
    const all = getItem<DietLog>(STORAGE_KEYS.DIET).filter(e => e.id !== id);
    setItem(STORAGE_KEYS.DIET, all);
    setEntries(entries.filter(e => e.id !== id));
  };

  const totals = entries.reduce((acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat, water: acc.water + e.water }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Diet Tracker</h1><p className="text-gray-400 mt-1">Track your nutrition</p></div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" />
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div><div className="w-12 h-12 mx-auto mb-2 bg-orange-500/20 rounded-full flex items-center justify-center"><Flame className="w-6 h-6 text-orange-400" /></div><p className="text-2xl font-bold text-white">{totals.calories}</p><p className="text-sm text-gray-400">Calories</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center"><span className="text-2xl">🌾</span></div><p className="text-2xl font-bold text-white">{totals.carbs}g</p><p className="text-sm text-gray-400">Carbs</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center"><span className="text-2xl">🥩</span></div><p className="text-2xl font-bold text-white">{totals.protein}g</p><p className="text-sm text-gray-400">Protein</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-yellow-500/20 rounded-full flex items-center justify-center"><span className="text-2xl">🍪</span></div><p className="text-2xl font-bold text-white">{totals.fat}g</p><p className="text-sm text-gray-400">Fat</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center"><Droplets className="w-6 h-6 text-blue-400" /></div><p className="text-2xl font-bold text-white">{totals.water}</p><p className="text-sm text-gray-400">Water</p></div>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all mb-6">
        <Plus className="w-5 h-5" /> Add Food
      </button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newEntry.foodName} onChange={e => setNewEntry({ ...newEntry, foodName: e.target.value })} placeholder="Food name" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="grid grid-cols-6 gap-4 mb-4">
            <select value={newEntry.mealType} onChange={e => setNewEntry({ ...newEntry, mealType: e.target.value })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
              {meals.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" value={newEntry.calories || ''} onChange={e => setNewEntry({ ...newEntry, calories: +e.target.value })} placeholder="Cal" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newEntry.carbs || ''} onChange={e => setNewEntry({ ...newEntry, carbs: +e.target.value })} placeholder="Carbs" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newEntry.protein || ''} onChange={e => setNewEntry({ ...newEntry, protein: +e.target.value })} placeholder="Protein" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newEntry.fat || ''} onChange={e => setNewEntry({ ...newEntry, fat: +e.target.value })} placeholder="Fat" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newEntry.water || ''} onChange={e => setNewEntry({ ...newEntry, water: +e.target.value })} placeholder="Water" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={addEntry} className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      {meals.map(meal => {
        const mealEntries = entries.filter(e => e.mealType === meal);
        const cal = mealEntries.reduce((s, e) => s + e.calories, 0);
        return mealEntries.length > 0 ? (
          <div key={meal} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">{meal}</h3>
              <span className="text-gray-400">{cal} cal</span>
            </div>
            {mealEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <span className="text-gray-300">{e.foodName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{e.calories} cal</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : null;
      })}
    </div>
  );
}

// Goals Page
function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetValue: 0, unit: '', deadline: '' });

  useEffect(() => { setGoals(getItem(STORAGE_KEYS.GOALS)); }, []);

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetValue) return;
    const goal: Goal = { id: generateId(), ...newGoal, currentValue: 0, completed: false };
    const updated = [...goals, goal];
    setItem(STORAGE_KEYS.GOALS, updated);
    setGoals(updated);
    setShowForm(false);
    setNewGoal({ title: '', targetValue: 0, unit: '', deadline: '' });
  };

  const updateProgress = (id: string, delta: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const newVal = Math.max(0, Math.min(g.targetValue, g.currentValue + delta));
        return { ...g, currentValue: newVal, completed: newVal >= g.targetValue };
      }
      return g;
    });
    setItem(STORAGE_KEYS.GOALS, updated);
    setGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setItem(STORAGE_KEYS.GOALS, updated);
    setGoals(updated);
  };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Goals</h1><p className="text-gray-400 mt-1">Set and track your goals</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all">
          <Plus className="w-5 h-5" /> Set Goal
        </button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Goal title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input type="number" value={newGoal.targetValue || ''} onChange={e => setNewGoal({ ...newGoal, targetValue: +e.target.value })} placeholder="Target" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="text" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="Unit (km, kg)" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={addGoal} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
          return (
            <div key={goal.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${goal.completed ? 'bg-green-500/10' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                    {goal.deadline && <p className="text-sm text-gray-400">Deadline: {goal.deadline}</p>}
                  </div>
                </div>
                <button onClick={() => deleteGoal(goal.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  <span className="text-white font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateProgress(goal.id, -1)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">-</button>
                <button onClick={() => updateProgress(goal.id, 1)} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">+</button>
              </div>
            </div>
          );
        })}
      </div>
      {goals.length === 0 && <div className="text-center py-20 text-gray-400">No goals yet. Set your first goal!</div>}
    </div>
  );
}

// Mood Page
function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { setMoods(getItem(STORAGE_KEYS.MOOD)); }, []);

  const saveMood = () => {
    if (!selectedMood) return;
    const entry: MoodEntry = { id: generateId(), mood: selectedMood, note, date: new Date().toISOString().split('T')[0] };
    const updated = [...moods, entry];
    setItem(STORAGE_KEYS.MOOD, updated);
    setMoods(updated);
    setSelectedMood('');
    setNote('');
  };

  const deleteMood = (id: string) => {
    const updated = moods.filter(m => m.id !== id);
    setItem(STORAGE_KEYS.MOOD, updated);
    setMoods(updated);
  };

  const moodOptions = [
    { value: 'great', emoji: '😄', label: 'Great', color: 'from-green-500 to-green-600' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'from-blue-500 to-blue-600' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-yellow-500 to-yellow-600' },
    { value: 'bad', emoji: '😔', label: 'Bad', color: 'from-orange-500 to-orange-600' },
    { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="ml-64 p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-white">Mood Tracker</h1><p className="text-gray-400 mt-1">How are you feeling today?</p></div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-5 gap-4 mb-4">
          {moodOptions.map(m => (
            <button key={m.value} onClick={() => setSelectedMood(m.value)} className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} ${selectedMood === m.value ? 'ring-4 ring-white' : 'opacity-70 hover:opacity-100'} transition-all`}>
              <span className="text-4xl block mb-2">{m.emoji}</span>
              <span className="text-white text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" rows={2} />
        <button onClick={saveMood} disabled={!selectedMood} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50">Save Mood</button>
      </div>
      <h2 className="text-xl font-semibold text-white mb-4">Recent Moods</h2>
      <div className="space-y-4">
        {moods.slice().reverse().map(m => {
          const opt = moodOptions.find(o => o.value === m.mood);
          return (
            <div key={m.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
              <span className="text-4xl">{opt?.emoji}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{opt?.label}</p>
                {m.note && <p className="text-gray-400 text-sm">{m.note}</p>}
                <p className="text-gray-500 text-xs">{m.date}</p>
              </div>
              <button onClick={() => deleteMood(m.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sleep Page
function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ hours: 7, quality: 'good' as const, notes: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { setEntries(getItem<SleepEntry>(STORAGE_KEYS.SLEEP)); }, []);

  const saveSleep = () => {
    const entry: SleepEntry = { id: generateId(), date: selectedDate, ...newEntry };
    const all = getItem<SleepEntry>(STORAGE_KEYS.SLEEP);
    const existing = all.findIndex(e => e.date === selectedDate);
    if (existing >= 0) all[existing] = entry;
    else all.push(entry);
    setItem(STORAGE_KEYS.SLEEP, all);
    setEntries(all);
    setShowForm(false);
    setNewEntry({ hours: 7, quality: 'good', notes: '' });
  };

  const deleteSleep = (id: string) => {
    const all = getItem<SleepEntry>(STORAGE_KEYS.SLEEP).filter(e => e.id !== id);
    setItem(STORAGE_KEYS.SLEEP, all);
    setEntries(all);
  };

  const qualityColors = { poor: 'bg-red-500', fair: 'bg-orange-500', good: 'bg-green-500', excellent: 'bg-emerald-500' };
  const qualityLabels = { poor: 'Poor', fair: 'Fair', good: 'Good', excellent: 'Excellent' };
  const todaySleep = entries.find(e => e.date === selectedDate);
  const avgSleep = entries.length > 0 ? (entries.reduce((s, e) => s + e.hours, 0) / entries.length).toFixed(1) : '0';

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Sleep Tracker</h1><p className="text-gray-400 mt-1">Track your sleep quality</p></div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" />
      </div>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4"><Moon className="w-6 h-6 text-indigo-400" /></div>
          <p className="text-3xl font-bold text-white">{todaySleep ? todaySleep.hours : 0}h</p>
          <p className="text-gray-400 mt-1">Last Night</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-purple-400" /></div>
          <p className="text-3xl font-bold text-white">{avgSleep}h</p>
          <p className="text-gray-400 mt-1">Average Sleep</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-emerald-400" /></div>
          <p className="text-3xl font-bold text-white">{entries.length}</p>
          <p className="text-gray-400 mt-1">Nights Tracked</p>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all mb-6">
        <Plus className="w-5 h-5" /> Log Sleep
      </button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Hours Slept</label>
              <input type="number" step="0.5" min="0" max="24" value={newEntry.hours} onChange={e => setNewEntry({ ...newEntry, hours: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quality</label>
              <select value={newEntry.quality} onChange={e => setNewEntry({ ...newEntry, quality: e.target.value as any })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
                <option value="poor">Poor</option><option value="fair">Fair</option><option value="good">Good</option><option value="excellent">Excellent</option>
              </select>
            </div>
          </div>
          <textarea value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" rows={2} />
          <div className="flex gap-3">
            <button onClick={saveSleep} className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold text-white mb-4">Recent Sleep</h2>
      <div className="space-y-4">
        {entries.slice().reverse().slice(0, 7).map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${qualityColors[e.quality]}`}><Moon className="w-6 h-6 text-white" /></div>
            <div className="flex-1">
              <p className="text-white font-medium">{e.hours} hours - {qualityLabels[e.quality]}</p>
              <p className="text-gray-400 text-sm">{e.date}</p>
            </div>
            <button onClick={() => deleteSleep(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Exercise Page
function ExercisePage() {
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'Running', duration: 30, calories: 200 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { setEntries(getItem<ExerciseEntry>(STORAGE_KEYS.EXERCISE).filter(e => e.date === selectedDate)); }, [selectedDate]);

  const saveExercise = () => {
    const entry: ExerciseEntry = { id: generateId(), date: selectedDate, ...newEntry };
    const all = getItem<ExerciseEntry>(STORAGE_KEYS.EXERCISE);
    all.push(entry);
    setItem(STORAGE_KEYS.EXERCISE, all);
    setEntries([...entries, entry]);
    setShowForm(false);
    setNewEntry({ type: 'Running', duration: 30, calories: 200 });
  };

  const deleteExercise = (id: string) => {
    const all = getItem<ExerciseEntry>(STORAGE_KEYS.EXERCISE).filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EXERCISE, all);
    setEntries(entries.filter(e => e.id !== id));
  };

  const totals = entries.reduce((acc, e) => ({ duration: acc.duration + e.duration, calories: acc.calories + e.calories }), { duration: 0, calories: 0 });
  const exerciseTypes = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Sports', 'Other'];
  const exerciseIcons: Record<string, string> = { Running: '🏃', Walking: '🚶', Cycling: '🚴', Swimming: '🏊', Gym: '💪', Yoga: '🧘', HIIT: '⚡', Sports: '⚽', Other: '🏋️' };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Exercise Tracker</h1><p className="text-gray-400 mt-1">Log your workouts</p></div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" />
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div><div className="w-12 h-12 mx-auto mb-2 bg-orange-500/20 rounded-full flex items-center justify-center"><Dumbbell className="w-6 h-6 text-orange-400" /></div><p className="text-2xl font-bold text-white">{totals.duration}</p><p className="text-sm text-gray-400">Minutes</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center"><Flame className="w-6 h-6 text-red-400" /></div><p className="text-2xl font-bold text-white">{totals.calories}</p><p className="text-sm text-gray-400">Calories</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-blue-400" /></div><p className="text-2xl font-bold text-white">{entries.length}</p><p className="text-sm text-gray-400">Workouts</p></div>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all mb-6">
        <Plus className="w-5 h-5" /> Log Exercise
      </button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Exercise Type</label>
              <select value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
                {exerciseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Duration (min)</label>
              <input type="number" value={newEntry.duration} onChange={e => setNewEntry({ ...newEntry, duration: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Calories</label>
              <input type="number" value={newEntry.calories} onChange={e => setNewEntry({ ...newEntry, calories: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveExercise} className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold text-white mb-4">Today's Exercises</h2>
      <div className="space-y-4">
        {entries.map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <span className="text-4xl">{exerciseIcons[e.type] || '💪'}</span>
            <div className="flex-1">
              <p className="text-white font-medium">{e.type}</p>
              <p className="text-gray-400 text-sm">{e.duration} min • {e.calories} cal</p>
            </div>
            <button onClick={() => deleteExercise(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {entries.length === 0 && <div className="text-center py-8 text-gray-400">No exercises logged today</div>}
      </div>
    </div>
  );
}

// Notes Page
function NotesPage() {
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  useEffect(() => { setEntries(getItem<NoteEntry>(STORAGE_KEYS.NOTES)); }, []);

  const saveNote = () => {
    if (!newEntry.title) return;
    const entry: NoteEntry = { id: generateId(), date: new Date().toISOString().split('T')[0], ...newEntry };
    const updated = [...entries, entry];
    setItem(STORAGE_KEYS.NOTES, updated);
    setEntries(updated);
    setShowForm(false);
    setNewEntry({ title: '', content: '' });
  };

  const deleteNote = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.NOTES, updated);
    setEntries(updated);
  };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Notes</h1><p className="text-gray-400 mt-1">Quick notes and journal</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-all">
          <Plus className="w-5 h-5" /> Add Note
        </button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} placeholder="Note title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <textarea value={newEntry.content} onChange={e => setNewEntry({ ...newEntry, content: e.target.value })} placeholder="Write your note..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" rows={4} />
          <div className="flex gap-3">
            <button onClick={saveNote} className="px-6 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {entries.slice().reverse().map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <BookText className="w-6 h-6 text-teal-400" />
              <button onClick={() => deleteNote(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{e.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{e.content || 'No content'}</p>
            <p className="text-gray-500 text-xs">{e.date}</p>
          </div>
        ))}
      </div>
      {entries.length === 0 && <div className="text-center py-20 text-gray-400">No notes yet. Start writing!</div>}
    </div>
  );
}

// Weight Page
function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ weight: 70 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { setEntries(getItem<WeightEntry>(STORAGE_KEYS.WEIGHT)); }, []);

  const saveWeight = () => {
    const entry: WeightEntry = { id: generateId(), date: selectedDate, weight: newEntry.weight };
    const all = getItem<WeightEntry>(STORAGE_KEYS.WEIGHT);
    const existing = all.findIndex(e => e.date === selectedDate);
    if (existing >= 0) all[existing] = entry;
    else all.push(entry);
    setItem(STORAGE_KEYS.WEIGHT, all);
    setEntries(all);
    setShowForm(false);
  };

  const deleteWeight = (id: string) => {
    const all = getItem<WeightEntry>(STORAGE_KEYS.WEIGHT).filter(e => e.id !== id);
    setItem(STORAGE_KEYS.WEIGHT, all);
    setEntries(all);
  };

  const sortedEntries = entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentWeight = sortedEntries[0]?.weight || 0;
  const startWeight = sortedEntries[sortedEntries.length - 1]?.weight || 0;
  const weightChange = startWeight > 0 ? (currentWeight - startWeight).toFixed(1) : '0';
  const trend = +weightChange < 0 ? 'down' : +weightChange > 0 ? 'up' : 'stable';

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Weight Tracker</h1><p className="text-gray-400 mt-1">Monitor your weight</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition-all">
          <Plus className="w-5 h-5" /> Log Weight
        </button>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="w-12 h-12 mx-auto mb-2 bg-pink-500/20 rounded-full flex items-center justify-center"><Scale className="w-6 h-6 text-pink-400" /></div><p className="text-3xl font-bold text-white">{currentWeight}</p><p className="text-sm text-gray-400">Current (kg)</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center"><TrendingUp className={`w-6 h-6 ${trend === 'down' ? 'text-green-400 rotate-180' : trend === 'up' ? 'text-red-400' : 'text-gray-400'}`} /></div><p className={`text-3xl font-bold ${trend === 'down' ? 'text-green-400' : trend === 'up' ? 'text-red-400' : 'text-white'}`}>{weightChange} kg</p><p className="text-sm text-gray-400">Change</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-emerald-500/20 rounded-full flex items-center justify-center"><Calculator className="w-6 h-6 text-emerald-400" /></div><p className="text-3xl font-bold text-white">{entries.length}</p><p className="text-sm text-gray-400">Entries</p></div>
        </div>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
              <input type="number" step="0.1" value={newEntry.weight} onChange={e => setNewEntry({ ...newEntry, weight: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveWeight} className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold text-white mb-4">History</h2>
      <div className="space-y-4">
        {sortedEntries.slice(0, 14).map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center"><Scale className="w-6 h-6 text-pink-400" /></div>
            <div className="flex-1">
              <p className="text-white font-medium">{e.weight} kg</p>
              <p className="text-gray-400 text-sm">{e.date}</p>
            </div>
            <button onClick={() => deleteWeight(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Layout
function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Sidebar />
      {children}
    </div>
  );
}

// Main App
function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/tasks" element={user ? <Layout><TasksPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/habits" element={user ? <Layout><HabitsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/diet" element={user ? <Layout><DietPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/goals" element={user ? <Layout><GoalsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/mood" element={user ? <Layout><MoodPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/sleep" element={user ? <Layout><SleepPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/exercise" element={user ? <Layout><ExercisePage /></Layout> : <Navigate to="/login" />} />
        <Route path="/notes" element={user ? <Layout><NotesPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/weight" element={user ? <Layout><WeightPage /></Layout> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
