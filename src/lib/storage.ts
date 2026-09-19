import { User, Task, Habit, HabitLog, DietLog, Goal } from '../types';

const STORAGE_KEYS = {
  USER: 'life_tracker_user',
  TASKS: 'life_tracker_tasks',
  HABITS: 'life_tracker_habits',
  HABIT_LOGS: 'life_tracker_habit_logs',
  DIET_LOGS: 'life_tracker_diet_logs',
  GOALS: 'life_tracker_goals',
};

// User functions
export function getUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function setUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Task functions
export function getTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
}

export function setTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function addTask(task: Task): Task[] {
  const tasks = getTasks();
  tasks.push(task);
  setTasks(tasks);
  return tasks;
}

export function updateTask(taskId: string, updates: Partial<Task>): Task[] {
  const tasks = getTasks().map(t => t.id === taskId ? { ...t, ...updates } : t);
  setTasks(tasks);
  return tasks;
}

export function deleteTask(taskId: string): Task[] {
  const tasks = getTasks().filter(t => t.id !== taskId);
  setTasks(tasks);
  return tasks;
}

// Habit functions
export function getHabits(): Habit[] {
  const data = localStorage.getItem(STORAGE_KEYS.HABITS);
  return data ? JSON.parse(data) : [];
}

export function setHabits(habits: Habit[]): void {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function addHabit(habit: Habit): Habit[] {
  const habits = getHabits();
  habits.push(habit);
  setHabits(habits);
  return habits;
}

export function deleteHabit(habitId: string): Habit[] {
  const habits = getHabits().filter(h => h.id !== habitId);
  setHabits(habits);
  // Also delete habit logs
  const logs = getHabitLogs().filter(l => l.habitId !== habitId);
  setHabitLogs(logs);
  return habits;
}

// Habit Log functions
export function getHabitLogs(): HabitLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
  return data ? JSON.parse(data) : [];
}

export function setHabitLogs(logs: HabitLog[]): void {
  localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
}

export function toggleHabitLog(habitId: string, date: string): HabitLog[] {
  const logs = getHabitLogs();
  const existingIndex = logs.findIndex(l => l.habitId === habitId && l.date === date);

  if (existingIndex >= 0) {
    logs.splice(existingIndex, 1);
  } else {
    logs.push({
      id: Date.now().toString(),
      habitId,
      date,
    });
  }

  setHabitLogs(logs);
  return logs;
}

export function isHabitDoneOnDate(habitId: string, date: string): boolean {
  const logs = getHabitLogs();
  return logs.some(l => l.habitId === habitId && l.date === date);
}

// Diet Log functions
export function getDietLogs(date?: string): DietLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.DIET_LOGS);
  const logs: DietLog[] = data ? JSON.parse(data) : [];

  if (date) {
    return logs.filter(l => l.date === date);
  }
  return logs;
}

export function setDietLogs(logs: DietLog[]): void {
  localStorage.setItem(STORAGE_KEYS.DIET_LOGS, JSON.stringify(logs));
}

export function addDietLog(log: DietLog): DietLog[] {
  const logs = getDietLogs();
  logs.push(log);
  setDietLogs(logs);
  return logs;
}

export function deleteDietLog(logId: string, date: string): DietLog[] {
  const logs = getDietLogs().filter(l => !(l.id === logId && l.date === date));
  setDietLogs(logs);
  return logs;
}

// Goal functions
export function getGoals(): Goal[] {
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : [];
}

export function setGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

export function addGoal(goal: Goal): Goal[] {
  const goals = getGoals();
  goals.push(goal);
  setGoals(goals);
  return goals;
}

export function updateGoal(goalId: string, updates: Partial<Goal>): Goal[] {
  const goals = getGoals().map(g => g.id === goalId ? { ...g, ...updates } : g);
  setGoals(goals);
  return goals;
}

export function deleteGoal(goalId: string): Goal[] {
  const goals = getGoals().filter(g => g.id !== goalId);
  setGoals(goals);
  return goals;
}

// Helper function to generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
