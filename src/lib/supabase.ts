import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idwsbalyolgjybblcnhh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkd3NiYWx5b2xnanliYmxjbmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTU4MTAsImV4cCI6MjAzNTQ5MTgxMH0.s9kVuIhH6xMqn-mJOlEHNqu0gRdwj0kQpOCTTw2jWU8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  due_date?: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color?: string
  frequency: 'daily' | 'weekly'
  completed_dates: string[]
  created_at: string
}

export interface DietEntry {
  id: string
  user_id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water_ml: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  target_value: number
  current_value: number
  unit: string
  deadline?: string
  created_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible'
  emoji: string
  note?: string
  created_at: string
}
