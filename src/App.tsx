import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, Heart, Zap, Shield, Check, Plus, Trash2, X, Flame, Target, Coffee, Moon, Dumbbell, Droplets, Brain, TrendingUp, BookText, Scale, Calculator, Settings, Calendar, LayoutDashboard, User, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { useSupabaseAuth, useTasks, useHabits, useHabitLogs, useGoals, useMeals, useMoodLogs, useSleepLogs, useExerciseLogs, useNotes, useWeightLogs } from './hooks/useDatabase';

// Icons mapping
const icons: Record<string, any> = {
  Sparkles, Heart, Zap, Shield, Check, Plus, Trash2, X, Flame, Target, Coffee, Moon, Dumbbell, Droplets, Brain, TrendingUp, BookText, Scale, Calculator, Settings, Calendar, LayoutDashboard, User, BarChart3
};

// Sidebar
function Sidebar() {
  const { signOut } = useSupabaseAuth();

  const navItems = [
    { group: 'Overview', items: [
      { path: '/', label: 'Dashboard', icon: 'Sparkles' },
      { path: '/today', label: 'Today', icon: 'Target' },
    ]},
    { group: 'Productivity', items: [
      { path: '/tasks', label: 'Tasks', icon: 'Check' },
      { path: '/habits', label: 'Habits', icon: 'Flame' },
      { path: '/goals', label: 'Goals', icon: 'Target' },
    ]},
    { group: 'Health', items: [
      { path: '/diet', label: 'Diet', icon: 'Coffee' },
      { path: '/exercise', label: 'Exercise', icon: 'Dumbbell' },
      { path: '/sleep', label: 'Sleep', icon: 'Moon' },
      { path: '/weight', label: 'Weight', icon: 'Scale' },
    ]},
    { group: 'Personal', items: [
      { path: '/mood', label: 'Mood', icon: 'Heart' },
      { path: '/notes', label: 'Notes', icon: 'BookText' },
    ]},
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Life Tracker</h1>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map(group => (
          <div key={group.group} className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">{group.group}</p>
            {group.items.map(item => {
              const IconComponent = icons[item.icon];
              return (
                <Link key={item.path} to={item.path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-gray-400 hover:bg-white/10 hover:text-white">
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <X className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}

// Dashboard
function DashboardPage() {
  const { user } = useSupabaseAuth();
  const { tasks } = useTasks(user?.id);
  const { habits } = useHabits(user?.id);
  const today = new Date().toISOString().split('T')[0];
  const { logs: habitLogs } = useHabitLogs(user?.id, today);
  const { meals } = useMeals(user?.id, today);
  const { sleeps } = useSleepLogs(user?.id);
  const { exercises } = useExerciseLogs(user?.id, today);

  const todayCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const todayWater = meals.reduce((sum, m) => sum + (m.water || 0), 0);
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.due_date === today);
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedHabits = habitLogs.length;
  const totalHabits = habits.length;

  const stats = [
    { label: 'Tasks', value: `${completedTasks.length}/${tasks.filter(t => t.due_date === today).length || pendingTasks.length}`, icon: 'Check', color: 'from-purple-500 to-purple-600' },
    { label: 'Habits', value: `${completedHabits}/${totalHabits}`, icon: 'Flame', color: 'from-orange-500 to-orange-600' },
    { label: 'Calories', value: todayCalories, icon: 'Coffee', color: 'from-green-500 to-green-600' },
    { label: 'Water', value: `${todayWater}/8`, icon: 'Droplets', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="ml-64 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
      <p className="text-gray-400 mb-8">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map(stat => {
          const IconComponent = icons[stat.icon];
          return (
            <div key={stat.label} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/tasks" className="flex items-center gap-2 bg-purple-500/20 p-3 rounded-xl hover:bg-purple-500/30 transition-all">
              <Plus className="w-5 h-5 text-purple-400" /> Add Task
            </Link>
            <Link to="/habits" className="flex items-center gap-2 bg-orange-500/20 p-3 rounded-xl hover:bg-orange-500/30 transition-all">
              <Flame className="w-5 h-5 text-orange-400" /> Track Habit
            </Link>
            <Link to="/diet" className="flex items-center gap-2 bg-green-500/20 p-3 rounded-xl hover:bg-green-500/30 transition-all">
              <Coffee className="w-5 h-5 text-green-400" /> Log Meal
            </Link>
            <Link to="/exercise" className="flex items-center gap-2 bg-blue-500/20 p-3 rounded-xl hover:bg-blue-500/30 transition-all">
              <Dumbbell className="w-5 h-5 text-blue-400" /> Log Workout
            </Link>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-300 text-sm truncate">{task.title}</span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-gray-500 text-sm">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tasks Page
function TasksPage() {
  const { user } = useSupabaseAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState<{ title: string; description: string; priority: 'low' | 'medium' | 'high'; due_date: string }>({ title: '', description: '', priority: 'medium', due_date: '' });

  const handleAddTask = async () => {
    if (!newTask.title) return;
    await addTask({ ...newTask, status: 'todo' as const });
    setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
    setShowForm(false);
  };

  const toggleTask = async (task: any) => {
    await updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  };

  const priorities: Record<string, string> = { low: 'bg-gray-500', medium: 'bg-yellow-500', high: 'bg-red-500' };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Tasks</h1><p className="text-gray-400 mt-1">Manage your tasks</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all"><Plus className="w-5 h-5" /> Add Task</button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Description (optional)" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="flex gap-4 mb-4">
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddTask} className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {tasks.filter(t => t.status !== 'completed').map(task => (
          <div key={task.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <button onClick={() => toggleTask(task)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
              {task.status === 'completed' && <Check className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1">
              <p className={`text-white font-medium ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>{task.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorities[task.priority || 'medium']}`}>{task.priority || 'medium'}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {tasks.filter(t => t.status === 'completed').length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-4">Completed ({tasks.filter(t => t.status === 'completed').length})</h3>
            {tasks.filter(t => t.status === 'completed').map(task => (
              <div key={task.id} className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-4 border border-green-500/20 flex items-center gap-4 mb-2">
                <button onClick={() => toggleTask(task)} className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></button>
                <p className="flex-1 text-gray-400 line-through">{task.title}</p>
                <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        )}
        {tasks.length === 0 && <div className="text-center py-20 text-gray-400">No tasks yet. Create your first task!</div>}
      </div>
    </div>
  );
}

// Habits Page
function HabitsPage() {
  const { user } = useSupabaseAuth();
  const { habits, addHabit, deleteHabit } = useHabits(user?.id);
  const today = new Date().toISOString().split('T')[0];
  const { logs: habitLogs, toggleHabit } = useHabitLogs(user?.id, today);
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '💪', color: '#8b5cf6' });

  const handleAddHabit = async () => {
    if (!newHabit.name) return;
    await addHabit({ ...newHabit, frequency: 'daily' });
    setNewHabit({ name: '', emoji: '💪', color: '#8b5cf6' });
    setShowForm(false);
  };

  const EMOJIS = ['💪', '🏃', '📚', '💧', '🧘', '💤', '🍎', '✍️', '🎯', '💊'];

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Habits</h1><p className="text-gray-400 mt-1">Build good habits</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all"><Plus className="w-5 h-5" /> Add Habit</button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} placeholder="Habit name" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="flex flex-wrap gap-2 mb-4">
            {EMOJIS.map(e => <button key={e} onClick={() => setNewHabit({ ...newHabit, emoji: e })} className={`w-10 h-10 rounded-xl text-xl ${newHabit.emoji === e ? 'bg-orange-500 ring-2 ring-orange-300' : 'bg-white/10'}`}>{e}</button>)}
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddHabit} className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {habits.map(habit => {
          const done = habitLogs.some(l => l.habit_id === habit.id);
          return (
            <div key={habit.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${done ? 'bg-green-500/10' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => toggleHabit(habit.id, today)} className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center ${done ? 'text-white' : 'bg-white/10'}`} style={{ backgroundColor: done ? habit.color : undefined }}>
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
  const { user } = useSupabaseAuth();
  const { meals, addMeal, deleteMeal } = useMeals(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newMeal, setNewMeal] = useState<{ meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; food_name: string; calories: number; protein: number; carbs: number; fat: number; water: number }>({ meal_type: 'breakfast', food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayMeals = meals.filter(m => m.meal_date === selectedDate);
  const totals = todayMeals.reduce((acc, e) => ({ calories: acc.calories + (e.calories || 0), protein: acc.protein + (e.protein || 0), carbs: acc.carbs + (e.carbs || 0), fat: acc.fat + (e.fat || 0), water: acc.water + (e.water || 0) }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });

  const handleAddMeal = async () => {
    if (!newMeal.food_name) return;
    await addMeal({ ...newMeal, meal_date: selectedDate });
    setNewMeal({ meal_type: 'breakfast', food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    setShowForm(false);
  };

  const meals_types = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

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
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-all mb-6"><Plus className="w-5 h-5" /> Add Food</button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newMeal.food_name} onChange={e => setNewMeal({ ...newMeal, food_name: e.target.value })} placeholder="Food name" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="grid grid-cols-6 gap-4 mb-4">
            <select value={newMeal.meal_type} onChange={e => setNewMeal({ ...newMeal, meal_type: e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack' })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
              {meals_types.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" value={newMeal.calories || ''} onChange={e => setNewMeal({ ...newMeal, calories: +e.target.value })} placeholder="Cal" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newMeal.carbs || ''} onChange={e => setNewMeal({ ...newMeal, carbs: +e.target.value })} placeholder="Carbs" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newMeal.protein || ''} onChange={e => setNewMeal({ ...newMeal, protein: +e.target.value })} placeholder="Protein" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newMeal.fat || ''} onChange={e => setNewMeal({ ...newMeal, fat: +e.target.value })} placeholder="Fat" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="number" value={newMeal.water || ''} onChange={e => setNewMeal({ ...newMeal, water: +e.target.value })} placeholder="Water" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddMeal} className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      {meals_types.map(meal => {
        const mealEntries = todayMeals.filter(e => e.meal_type === meal);
        const cal = mealEntries.reduce((s, e) => s + (e.calories || 0), 0);
        return mealEntries.length > 0 ? (
          <div key={meal} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">{meal}</h3>
              <span className="text-gray-400">{cal} cal</span>
            </div>
            {mealEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <span className="text-gray-300">{e.food_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{e.calories} cal</span>
                  <button onClick={() => deleteMeal(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
  const { user } = useSupabaseAuth();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target_value: 0, unit: '', deadline: '' });

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_value) return;
    await addGoal({ ...newGoal, current_value: 0, status: 'active' });
    setNewGoal({ title: '', target_value: 0, unit: '', deadline: '' });
    setShowForm(false);
  };

  const updateProgress = async (id: string, delta: number, goal: any) => {
    const newVal = Math.max(0, Math.min(goal.target_value, (goal.current_value || 0) + delta));
    await updateGoal(id, { current_value: newVal, status: newVal >= goal.target_value ? 'completed' : 'active' });
  };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Goals</h1><p className="text-gray-400 mt-1">Set and track your goals</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all"><Plus className="w-5 h-5" /> Set Goal</button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Goal title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input type="number" value={newGoal.target_value || ''} onChange={e => setNewGoal({ ...newGoal, target_value: +e.target.value })} placeholder="Target" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="text" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="Unit (km, kg)" className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddGoal} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = goal.target_value > 0 ? ((goal.current_value || 0) / goal.target_value) * 100 : 0;
          return (
            <div key={goal.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 ${goal.status === 'completed' ? 'bg-green-500/10' : ''}`}>
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
                  <span className="text-gray-400">{goal.current_value || 0} / {goal.target_value} {goal.unit}</span>
                  <span className="text-white font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateProgress(goal.id, -1, goal)} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">-</button>
                <button onClick={() => updateProgress(goal.id, 1, goal)} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">+</button>
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
  const { user } = useSupabaseAuth();
  const { moods, addMood, deleteMood } = useMoodLogs(user?.id);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  const saveMood = async () => {
    if (!selectedMood) return;
    const ratings: Record<string, number> = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
    await addMood({ mood: selectedMood, rating: ratings[selectedMood], note, date: new Date().toISOString().split('T')[0] });
    setSelectedMood('');
    setNote('');
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
        {moods.slice(0, 10).map(m => {
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
  const { user } = useSupabaseAuth();
  const { sleeps, addSleep, deleteSleep } = useSleepLogs(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newSleep, setNewSleep] = useState({ hours: 7, quality: 'good', notes: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSaveSleep = async () => {
    await addSleep({ hours: newSleep.hours, quality: newSleep.quality as any, notes: newSleep.notes, sleep_date: selectedDate });
    setShowForm(false);
    setNewSleep({ hours: 7, quality: 'good', notes: '' });
  };

  const todaySleep = sleeps.find(e => e.sleep_date === selectedDate);
  const avgSleep = sleeps.length > 0 ? (sleeps.reduce((s, e) => s + e.hours, 0) / sleeps.length).toFixed(1) : '0';
  const qualityColors: Record<string, string> = { poor: 'bg-red-500', fair: 'bg-orange-500', good: 'bg-green-500', excellent: 'bg-emerald-500' };

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
          <p className="text-3xl font-bold text-white">{sleeps.length}</p>
          <p className="text-gray-400 mt-1">Nights Tracked</p>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all mb-6"><Plus className="w-5 h-5" /> Log Sleep</button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Hours Slept</label>
              <input type="number" step="0.5" min="0" max="24" value={newSleep.hours} onChange={e => setNewSleep({ ...newSleep, hours: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Quality</label>
              <select value={newSleep.quality} onChange={e => setNewSleep({ ...newSleep, quality: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
                <option value="poor">Poor</option><option value="fair">Fair</option><option value="good">Good</option><option value="excellent">Excellent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveSleep} className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold text-white mb-4">Recent Sleep</h2>
      <div className="space-y-4">
        {sleeps.slice(0, 7).map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${qualityColors[e.quality]}`}><Moon className="w-6 h-6 text-white" /></div>
            <div className="flex-1">
              <p className="text-white font-medium">{e.hours} hours - {e.quality}</p>
              <p className="text-gray-400 text-sm">{e.sleep_date}</p>
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
  const { user } = useSupabaseAuth();
  const { exercises, addExercise, deleteExercise } = useExerciseLogs(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newExercise, setNewExercise] = useState({ exercise_type: 'Running', duration: 30, calories_burned: 200 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayExercises = exercises.filter(e => e.exercise_date === selectedDate);
  const totals = todayExercises.reduce((acc, e) => ({ duration: acc.duration + (e.duration || 0), calories: acc.calories + (e.calories_burned || 0) }), { duration: 0, calories: 0 });

  const handleAddExercise = async () => {
    await addExercise({ ...newExercise, exercise_date: selectedDate });
    setShowForm(false);
    setNewExercise({ exercise_type: 'Running', duration: 30, calories_burned: 200 });
  };

  const exerciseTypes = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Sports', 'Other'];
  const exerciseIcons: Record<string, string> = { Running: '🏃', Walking: '🚶', Cycling: '🚴', Swimming: '🏊', Gym: '💪', Yoga: '🧘', HIIT: '⚡', Sports: '⚽', Other: '🏋️' };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Exercise Tracker</h1><p className="text-gray-400 mt-1">Log your workouts</p></div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" />
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="w-12 h-12 mx-auto mb-2 bg-orange-500/20 rounded-full flex items-center justify-center"><Dumbbell className="w-6 h-6 text-orange-400" /></div><p className="text-2xl font-bold text-white">{totals.duration}</p><p className="text-sm text-gray-400">Minutes</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center"><Flame className="w-6 h-6 text-red-400" /></div><p className="text-2xl font-bold text-white">{totals.calories}</p><p className="text-sm text-gray-400">Calories</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center"><Check className="w-6 h-6 text-blue-400" /></div><p className="text-2xl font-bold text-white">{todayExercises.length}</p><p className="text-sm text-gray-400">Workouts</p></div>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-all mb-6"><Plus className="w-5 h-5" /> Log Exercise</button>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Exercise Type</label>
              <select value={newExercise.exercise_type} onChange={e => setNewExercise({ ...newExercise, exercise_type: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white">
                {exerciseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Duration (min)</label>
              <input type="number" value={newExercise.duration} onChange={e => setNewExercise({ ...newExercise, duration: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Calories</label>
              <input type="number" value={newExercise.calories_burned} onChange={e => setNewExercise({ ...newExercise, calories_burned: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddExercise} className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {todayExercises.map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <span className="text-4xl">{exerciseIcons[e.exercise_type] || '💪'}</span>
            <div className="flex-1">
              <p className="text-white font-medium">{e.exercise_type}</p>
              <p className="text-gray-400 text-sm">{e.duration} min • {e.calories_burned} cal</p>
            </div>
            <button onClick={() => deleteExercise(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {todayExercises.length === 0 && <div className="text-center py-8 text-gray-400">No exercises logged today</div>}
      </div>
    </div>
  );
}

// Notes Page
function NotesPage() {
  const { user } = useSupabaseAuth();
  const { notes, addNote, deleteNote } = useNotes(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleSaveNote = async () => {
    if (!newNote.title) return;
    await addNote({ ...newNote });
    setShowForm(false);
    setNewNote({ title: '', content: '' });
  };

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Notes</h1><p className="text-gray-400 mt-1">Quick notes and journal</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-all"><Plus className="w-5 h-5" /> Add Note</button>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <input type="text" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} placeholder="Note title" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" />
          <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} placeholder="Write your note..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 outline-none" rows={4} />
          <div className="flex gap-3">
            <button onClick={handleSaveNote} className="px-6 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {notes.map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <BookText className="w-6 h-6 text-teal-400" />
              <button onClick={() => deleteNote(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{e.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{e.content || 'No content'}</p>
            <p className="text-gray-500 text-xs">{new Date(e.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {notes.length === 0 && <div className="text-center py-20 text-gray-400">No notes yet. Start writing!</div>}
    </div>
  );
}

// Weight Page
function WeightPage() {
  const { user } = useSupabaseAuth();
  const { weights, addWeight, deleteWeight } = useWeightLogs(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [newWeight, setNewWeight] = useState({ weight: 70 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSaveWeight = async () => {
    await addWeight({ weight: newWeight.weight, recorded_date: selectedDate, unit: 'kg' });
    setShowForm(false);
  };

  const sortedWeights = [...weights].sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime());
  const currentWeight = sortedWeights[0]?.weight || 0;
  const startWeight = sortedWeights[sortedWeights.length - 1]?.weight || 0;
  const weightChange = startWeight > 0 ? (currentWeight - startWeight).toFixed(1) : '0';
  const trend = +weightChange < 0 ? 'down' : +weightChange > 0 ? 'up' : 'stable';

  return (
    <div className="ml-64 p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Weight Tracker</h1><p className="text-gray-400 mt-1">Monitor your weight</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition-all"><Plus className="w-5 h-5" /> Log Weight</button>
      </div>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="w-12 h-12 mx-auto mb-2 bg-pink-500/20 rounded-full flex items-center justify-center"><Scale className="w-6 h-6 text-pink-400" /></div><p className="text-3xl font-bold text-white">{currentWeight}</p><p className="text-sm text-gray-400">Current (kg)</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center"><TrendingUp className={`w-6 h-6 ${trend === 'down' ? 'text-green-400 rotate-180' : trend === 'up' ? 'text-red-400' : 'text-gray-400'}`} /></div><p className={`text-3xl font-bold ${trend === 'down' ? 'text-green-400' : trend === 'up' ? 'text-red-400' : 'text-white'}`}>{weightChange} kg</p><p className="text-sm text-gray-400">Change</p></div>
          <div><div className="w-12 h-12 mx-auto mb-2 bg-emerald-500/20 rounded-full flex items-center justify-center"><Calculator className="w-6 h-6 text-emerald-400" /></div><p className="text-3xl font-bold text-white">{weights.length}</p><p className="text-sm text-gray-400">Entries</p></div>
        </div>
      </div>
      {showForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Weight (kg)</label>
              <input type="number" step="0.1" value={newWeight.weight} onChange={e => setNewWeight({ weight: +e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveWeight} className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600">Save</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {sortedWeights.slice(0, 14).map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center"><Scale className="w-6 h-6 text-pink-400" /></div>
            <div className="flex-1">
              <p className="text-white font-medium">{e.weight} kg</p>
              <p className="text-gray-400 text-sm">{e.recorded_date}</p>
            </div>
            <button onClick={() => deleteWeight(e.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Today Page
function TodayPage() {
  const { user } = useSupabaseAuth();
  const { tasks } = useTasks(user?.id);
  const { habits } = useHabits(user?.id);
  const today = new Date().toISOString().split('T')[0];
  const { logs: habitLogs } = useHabitLogs(user?.id, today);
  const { sleeps } = useSleepLogs(user?.id);
  const { moods } = useMoodLogs(user?.id);
  const { exercises } = useExerciseLogs(user?.id, today);
  const { meals } = useMeals(user?.id, today);

  const todayTasks = tasks.filter(t => t.due_date === today && t.status !== 'completed');
  const todayMood = moods.find(m => m.date === today);
  const todaySleep = sleeps.find(s => s.sleep_date === today);
  const todayExercise = exercises.length > 0;
  const todayCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="ml-64 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Today</h1>
      <p className="text-gray-400 mb-8">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Priorities</h2>
          {todayTasks.length > 0 ? todayTasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3 py-2">
              <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
              <span className="text-gray-300">{task.title}</span>
            </div>
          )) : <p className="text-gray-500">No tasks due today</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Habits</h2>
          <div className="space-y-2">
            {habits.slice(0, 6).map(habit => {
              const done = habitLogs.some(l => l.habit_id === habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <span>{done ? '✓' : '○'}</span>
                  <span className={done ? 'text-gray-400 line-through' : 'text-gray-300'}>{habit.emoji} {habit.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
          <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
          <p className="text-2xl font-bold text-white">{todaySleep?.hours || 0}h</p>
          <p className="text-gray-400 text-sm">Sleep</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
          <Dumbbell className="w-6 h-6 mx-auto mb-2 text-orange-400" />
          <p className="text-2xl font-bold text-white">{todayExercise ? exercises.reduce((s, e) => s + e.duration, 0) + 'm' : '0m'}</p>
          <p className="text-gray-400 text-sm">Exercise</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
          <Coffee className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <p className="text-2xl font-bold text-white">{todayCalories}</p>
          <p className="text-gray-400 text-sm">Calories</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 text-center">
          <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
          <p className="text-2xl font-bold text-white">{todayMood ? ['😢', '😔', '😐', '🙂', '😄'][todayMood.rating - 1] : '—'}</p>
          <p className="text-gray-400 text-sm">Mood</p>
        </div>
      </div>
    </div>
  );
}

// Auth Page - Integrated on main screen
function AuthPage() {
  const { signIn, signUp, signInWithGoogle, signOut, user } = useSupabaseAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, name);
      if (result.error) setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) setError(result.error);
    setLoading(false);
  };

  // If already logged in, show logout button
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Life Tracker</h1>
          <p className="text-gray-400 mb-4">Logged in as {user.email}</p>
          <button onClick={signOut} className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Life Tracker</h1>
          <p className="text-gray-400 mt-1">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-500 outline-none text-white placeholder-gray-500 pr-12" placeholder="Min 6 characters" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin">⟳</span> : null}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4">
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
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

// Layout
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Sidebar />
      {children}
    </div>
  );
}

// Main App
function App() {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin text-white text-4xl">⟳</div>
      </div>
    );
  }

  // If not logged in, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // If logged in, show main app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/today" element={<Layout><TodayPage /></Layout>} />
        <Route path="/tasks" element={<Layout><TasksPage /></Layout>} />
        <Route path="/habits" element={<Layout><HabitsPage /></Layout>} />
        <Route path="/diet" element={<Layout><DietPage /></Layout>} />
        <Route path="/goals" element={<Layout><GoalsPage /></Layout>} />
        <Route path="/mood" element={<Layout><MoodPage /></Layout>} />
        <Route path="/sleep" element={<Layout><SleepPage /></Layout>} />
        <Route path="/exercise" element={<Layout><ExercisePage /></Layout>} />
        <Route path="/notes" element={<Layout><NotesPage /></Layout>} />
        <Route path="/weight" element={<Layout><WeightPage /></Layout>} />
        <Route path="*" element={<Layout><DashboardPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
