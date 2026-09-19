export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
}

export interface DietEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  notes: string;
  date: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
}
