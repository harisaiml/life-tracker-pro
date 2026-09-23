import { useState, useEffect, useCallback } from 'react';
import { supabase, Task, Habit, HabitLog, Goal, Meal, MoodLog, SleepLog, ExerciseLog, Note, WeightLog } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Generic hook for fetching data
function useSupabaseData<T>(table: string, userId: string | undefined, whereClause?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase.from(table).select('*').eq('user_id', userId);
      if (whereClause) {
        const [field, value] = whereClause.split(':');
        query = query.eq(field, value);
      }
      query = query.order('created_at', { ascending: false });

      const { data: result, error: err } = await query;
      if (err) throw err;
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, userId, whereClause]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Tasks
export function useTasks(userId: string | undefined) {
  const { data, loading, error, refetch } = useSupabaseData<Task>('tasks', userId);

  const addTask = async (task: Partial<Task>) => {
    if (!userId) return;
    const { error: err } = await supabase.from('tasks').insert({ ...task, user_id: userId });
    if (!err) refetch();
    return !err;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error: err } = await supabase.from('tasks').update(updates).eq('id', id);
    if (!err) refetch();
    return !err;
  };

  const deleteTask = async (id: string) => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (!err) refetch();
    return !err;
  };

  return { tasks: data as Task[], loading, error, addTask, updateTask, deleteTask, refetch };
}

// Habits
export function useHabits(userId: string | undefined) {
  const { data, loading, error, refetch } = useSupabaseData<Habit>('habits', userId);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!userId) return;
    const { error: err } = await supabase.from('habits').insert({ ...habit, user_id: userId });
    if (!err) refetch();
    return !err;
  };

  const deleteHabit = async (id: string) => {
    const { error: err } = await supabase.from('habits').delete().eq('id', id);
    if (!err) refetch();
    return !err;
  };

  return { habits: data as Habit[], loading, error, addHabit, deleteHabit, refetch };
}

// Habit Logs
export function useHabitLogs(userId: string | undefined, date?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    let query = supabase.from('habit_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('completed_date', date);

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const toggleHabit = async (habitId: string, dateStr: string) => {
    if (!userId) return;
    const existing = logs.find(l => l.habit_id === habitId && l.completed_date === dateStr);

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, completed_date: dateStr });
    }
    fetchLogs();
  };

  return { logs, loading, toggleHabit, refetch: fetchLogs };
}

// Goals
export function useGoals(userId: string | undefined) {
  const { data, loading, error, refetch } = useSupabaseData<Goal>('goals', userId);

  const addGoal = async (goal: Partial<Goal>) => {
    if (!userId) return;
    const { error: err } = await supabase.from('goals').insert({ ...goal, user_id: userId });
    if (!err) refetch();
    return !err;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error: err } = await supabase.from('goals').update(updates).eq('id', id);
    if (!err) refetch();
    return !err;
  };

  const deleteGoal = async (id: string) => {
    const { error: err } = await supabase.from('goals').delete().eq('id', id);
    if (!err) refetch();
    return !err;
  };

  return { goals: data as Goal[], loading, error, addGoal, updateGoal, deleteGoal, refetch };
}

// Meals
export function useMeals(userId: string | undefined, date?: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    if (!userId) return;
    let query = supabase.from('meals').select('*').eq('user_id', userId);
    if (date) query = query.eq('meal_date', date);
    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    setMeals(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const addMeal = async (meal: Partial<Meal>) => {
    if (!userId) return;
    await supabase.from('meals').insert({ ...meal, user_id: userId });
    fetchMeals();
  };

  const deleteMeal = async (id: string) => {
    await supabase.from('meals').delete().eq('id', id);
    fetchMeals();
  };

  return { meals, loading, addMeal, deleteMeal, refetch: fetchMeals };
}

// Mood Logs
export function useMoodLogs(userId: string | undefined) {
  const { data, loading, refetch } = useSupabaseData<MoodLog>('mood_logs', userId);

  const addMood = async (mood: Partial<MoodLog>) => {
    if (!userId) return;
    await supabase.from('mood_logs').insert({ ...mood, user_id: userId });
    refetch();
  };

  const deleteMood = async (id: string) => {
    await supabase.from('mood_logs').delete().eq('id', id);
    refetch();
  };

  return { moods: data as MoodLog[], loading, addMood, deleteMood, refetch };
}

// Sleep Logs
export function useSleepLogs(userId: string | undefined) {
  const { data, loading, refetch } = useSupabaseData<SleepLog>('sleep_logs', userId);

  const addSleep = async (sleep: Partial<SleepLog>) => {
    if (!userId) return;
    const { data: existing } = await supabase.from('sleep_logs').select('*').eq('user_id', userId).eq('sleep_date', sleep.sleep_date).single();

    if (existing) {
      await supabase.from('sleep_logs').update(sleep).eq('id', existing.id);
    } else {
      await supabase.from('sleep_logs').insert({ ...sleep, user_id: userId });
    }
    refetch();
  };

  const deleteSleep = async (id: string) => {
    await supabase.from('sleep_logs').delete().eq('id', id);
    refetch();
  };

  return { sleeps: data as SleepLog[], loading, addSleep, deleteSleep, refetch };
}

// Exercise Logs
export function useExerciseLogs(userId: string | undefined, date?: string) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    let query = supabase.from('exercise_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('exercise_date', date);
    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addExercise = async (exercise: Partial<ExerciseLog>) => {
    if (!userId) return;
    await supabase.from('exercise_logs').insert({ ...exercise, user_id: userId });
    fetchLogs();
  };

  const deleteExercise = async (id: string) => {
    await supabase.from('exercise_logs').delete().eq('id', id);
    fetchLogs();
  };

  return { exercises: logs, loading, addExercise, deleteExercise, refetch: fetchLogs };
}

// Notes
export function useNotes(userId: string | undefined) {
  const { data, loading, refetch } = useSupabaseData<Note>('notes', userId);

  const addNote = async (note: Partial<Note>) => {
    if (!userId) return;
    await supabase.from('notes').insert({ ...note, user_id: userId });
    refetch();
  };

  const deleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    refetch();
  };

  return { notes: data as Note[], loading, addNote, deleteNote, refetch };
}

// Weight Logs
export function useWeightLogs(userId: string | undefined) {
  const { data, loading, refetch } = useSupabaseData<WeightLog>('weight_logs', userId);

  const addWeight = async (weight: Partial<WeightLog>) => {
    if (!userId) return;
    const { data: existing } = await supabase.from('weight_logs').select('*').eq('user_id', userId).eq('recorded_date', weight.recorded_date).single();

    if (existing) {
      await supabase.from('weight_logs').update(weight).eq('id', existing.id);
    } else {
      await supabase.from('weight_logs').insert({ ...weight, user_id: userId });
    }
    refetch();
  };

  const deleteWeight = async (id: string) => {
    await supabase.from('weight_logs').delete().eq('id', id);
    refetch();
  };

  return { weights: data as WeightLog[], loading, addWeight, deleteWeight, refetch };
}

// Auth hook
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { error: error?.message || null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    return { error: error?.message || null };
  };

  return { user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword };
}
