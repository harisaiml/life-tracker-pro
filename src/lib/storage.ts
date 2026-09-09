'use client';

import { Task, Habit, HabitLog, DietEntry, Goal, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'life_tracker_user',
  TASKS: 'life_tracker_tasks',
  HABITS: 'life_tracker_habits',
  HABIT_LOGS: 'life_tracker_habit_logs',
  DIET: 'life_tracker_diet',
  GOALS: 'life_tracker_goals',
};

// User functions
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Task functions
export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
}

export function setTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function addTask(task: Task): void {
  const tasks = getTasks();
  tasks.push(task);
  setTasks(tasks);
}

export function updateTask(taskId: string, updates: Partial<Task>): void {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    setTasks(tasks);
  }
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks();
  setTasks(tasks.filter(t => t.id !== taskId));
}

// Habit functions
export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.HABITS);
  return data ? JSON.parse(data) : [];
}

export function setHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function addHabit(habit: Habit): void {
  const habits = getHabits();
  habits.push(habit);
  setHabits(habits);
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits();
  setHabits(habits.filter(h => h.id !== habitId));
}

// Habit Log functions
export function getHabitLogs(): HabitLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
  return data ? JSON.parse(data) : [];
}

export function setHabitLogs(logs: HabitLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
}

export function toggleHabitLog(habitId: string, date: string): boolean {
  const logs = getHabitLogs();
  const existingIndex = logs.findIndex(l => l.habitId === habitId && l.date === date);

  if (existingIndex !== -1) {
    logs.splice(existingIndex, 1);
    setHabitLogs(logs);
    return false;
  } else {
    logs.push({ id: Date.now().toString(), habitId, date });
    setHabitLogs(logs);
    return true;
  }
}

export function isHabitLoggedToday(habitId: string): boolean {
  const logs = getHabitLogs();
  const today = new Date().toISOString().split('T')[0];
  return logs.some(l => l.habitId === habitId && l.date === today);
}

// Diet functions
export function getDietEntries(): DietEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.DIET);
  return data ? JSON.parse(data) : [];
}

export function setDietEntries(entries: DietEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DIET, JSON.stringify(entries));
}

export function addDietEntry(entry: DietEntry): void {
  const entries = getDietEntries();
  entries.push(entry);
  setDietEntries(entries);
}

export function deleteDietEntry(entryId: string): void {
  const entries = getDietEntries();
  setDietEntries(entries.filter(e => e.id !== entryId));
}

// Goal functions
export function getGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : [];
}

export function setGoals(goals: Goal[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

export function addGoal(goal: Goal): void {
  const goals = getGoals();
  goals.push(goal);
  setGoals(goals);
}

export function updateGoal(goalId: string, updates: Partial<Goal>): void {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === goalId);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    setGoals(goals);
  }
}

export function deleteGoal(goalId: string): void {
  const goals = getGoals();
  setGoals(goals.filter(g => g.id !== goalId));
}

// Utility functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
