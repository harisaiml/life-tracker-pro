import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://idwsbalyolgjybblcnhh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkd3NiYWx5b2xnanliYmxjbmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjUyNjksImV4cCI6MjA5NzIwMTI2OX0.lIisGDyz9azidACMqZAyIvXeAIlUbb9RJXsLAQH7lSE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  timezone?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: string;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  meal_date: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood: string;
  rating: number;
  note?: string;
  date: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  sleep_date: string;
  notes?: string;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_type: string;
  duration: number;
  calories_burned: number;
  notes?: string;
  exercise_date: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  unit: string;
  recorded_date: string;
  created_at: string;
}
