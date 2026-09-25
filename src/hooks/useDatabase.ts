import { useState, useEffect, useCallback } from 'react';
import { supabase, Task, Habit, HabitLog, Goal, Meal, MoodLog, SleepLog, ExerciseLog, Note, WeightLog } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Debug helper
const debug = (message: string, ...args: any[]) => {
  if (args.length > 0) {
    console.log(`[DEBUG] ${message}`, ...args);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
};

// Generic hook for fetching data with error handling
function useSupabaseData<T>(table: string, userId: string | undefined, whereClause?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      debug('No userId, skipping fetch for', table);
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
      if (err) {
        debug(`Error fetching ${table}:`, err);
        setError(err.message);
        // If RLS error, data might be empty - that's ok for new users
        if (err.message.includes('row-level security') || err.code === 'PGRST116') {
          setData([]);
        }
      } else {
        debug(`Fetched ${table}:`, result?.length || 0, 'items');
        setData(result || []);
      }
    } catch (err: any) {
      debug(`Exception fetching ${table}:`, err);
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
    if (!userId) { debug('Cannot add task: no userId'); return false; }
    debug('Adding task:', task);
    const { error: err } = await supabase.from('tasks').insert({ ...task, user_id: userId });
    if (err) debug('Error adding task:', err);
    if (!err) refetch();
    return !err;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    debug('Updating task:', id, updates);
    const { error: err } = await supabase.from('tasks').update(updates).eq('id', id);
    if (err) debug('Error updating task:', err);
    if (!err) refetch();
    return !err;
  };

  const deleteTask = async (id: string) => {
    debug('Deleting task:', id);
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (err) debug('Error deleting task:', err);
    if (!err) refetch();
    return !err;
  };

  return { tasks: data as Task[], loading, error, addTask, updateTask, deleteTask, refetch };
}

// Habits
export function useHabits(userId: string | undefined) {
  const { data, loading, error, refetch } = useSupabaseData<Habit>('habits', userId);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!userId) { debug('Cannot add habit: no userId'); return false; }
    debug('Adding habit:', habit);
    const { error: err } = await supabase.from('habits').insert({ ...habit, user_id: userId });
    if (err) debug('Error adding habit:', err);
    if (!err) refetch();
    return !err;
  };

  const deleteHabit = async (id: string) => {
    debug('Deleting habit:', id);
    const { error: err } = await supabase.from('habits').delete().eq('id', id);
    if (err) debug('Error deleting habit:', err);
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
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    let query = supabase.from('habit_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('completed_date', date);

    const { data } = await query;
    debug('Fetched habit logs:', data?.length || 0);
    setLogs(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const toggleHabit = async (habitId: string, dateStr: string) => {
    if (!userId) return;
    const existing = logs.find(l => l.habit_id === habitId && l.completed_date === dateStr);

    if (existing) {
      debug('Removing habit log:', existing.id);
      await supabase.from('habit_logs').delete().eq('id', existing.id);
    } else {
      debug('Adding habit log:', habitId, dateStr);
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
    if (!userId) return false;
    debug('Adding goal:', goal);
    const { error: err } = await supabase.from('goals').insert({ ...goal, user_id: userId });
    if (err) debug('Error adding goal:', err);
    if (!err) refetch();
    return !err;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    debug('Updating goal:', id, updates);
    const { error: err } = await supabase.from('goals').update(updates).eq('id', id);
    if (err) debug('Error updating goal:', err);
    if (!err) refetch();
    return !err;
  };

  const deleteGoal = async (id: string) => {
    debug('Deleting goal:', id);
    const { error: err } = await supabase.from('goals').delete().eq('id', id);
    if (err) debug('Error deleting goal:', err);
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
    if (!userId) {
      setMeals([]);
      setLoading(false);
      return;
    }
    let query = supabase.from('meals').select('*').eq('user_id', userId);
    if (date) query = query.eq('meal_date', date);
    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    debug('Fetched meals:', data?.length || 0);
    setMeals(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const addMeal = async (meal: Partial<Meal>) => {
    if (!userId) return;
    debug('Adding meal:', meal);
    await supabase.from('meals').insert({ ...meal, user_id: userId });
    fetchMeals();
  };

  const deleteMeal = async (id: string) => {
    debug('Deleting meal:', id);
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
    debug('Adding mood:', mood);
    await supabase.from('mood_logs').insert({ ...mood, user_id: userId });
    refetch();
  };

  const deleteMood = async (id: string) => {
    debug('Deleting mood:', id);
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
    debug('Adding sleep:', sleep);
    const { data: existing } = await supabase.from('sleep_logs').select('*').eq('user_id', userId).eq('sleep_date', sleep.sleep_date).single();

    if (existing) {
      debug('Updating existing sleep log:', existing.id);
      await supabase.from('sleep_logs').update(sleep).eq('id', existing.id);
    } else {
      debug('Inserting new sleep log');
      await supabase.from('sleep_logs').insert({ ...sleep, user_id: userId });
    }
    refetch();
  };

  const deleteSleep = async (id: string) => {
    debug('Deleting sleep:', id);
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
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    let query = supabase.from('exercise_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('exercise_date', date);
    query = query.order('created_at', { ascending: false });

    const { data } = await query;
    debug('Fetched exercise logs:', data?.length || 0);
    setLogs(data || []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addExercise = async (exercise: Partial<ExerciseLog>) => {
    if (!userId) return;
    debug('Adding exercise:', exercise);
    await supabase.from('exercise_logs').insert({ ...exercise, user_id: userId });
    fetchLogs();
  };

  const deleteExercise = async (id: string) => {
    debug('Deleting exercise:', id);
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
    debug('Adding note:', note);
    await supabase.from('notes').insert({ ...note, user_id: userId });
    refetch();
  };

  const deleteNote = async (id: string) => {
    debug('Deleting note:', id);
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
    debug('Adding weight:', weight);
    const { data: existing } = await supabase.from('weight_logs').select('*').eq('user_id', userId).eq('recorded_date', weight.recorded_date).single();

    if (existing) {
      debug('Updating existing weight log:', existing.id);
      await supabase.from('weight_logs').update(weight).eq('id', existing.id);
    } else {
      debug('Inserting new weight log');
      await supabase.from('weight_logs').insert({ ...weight, user_id: userId });
    }
    refetch();
  };

  const deleteWeight = async (id: string) => {
    debug('Deleting weight:', id);
    await supabase.from('weight_logs').delete().eq('id', id);
    refetch();
  };

  return { weights: data as WeightLog[], loading, addWeight, deleteWeight, refetch };
}

// Auth hook with better error handling
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    debug('Setting up auth listener');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      debug('Initial session:', session?.user?.email || 'none');
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      debug('Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      debug('Auth state changed:', event, session?.user?.email || 'none');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      debug('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    debug('Attempting sign in for:', email);
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        debug('Sign in error:', authError);
        setError(authError.message);
        setLoading(false);
        return { error: authError.message };
      }

      debug('Sign in success:', data.user?.email);
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      debug('Sign in exception:', err);
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    debug('Attempting sign up for:', email);
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (authError) {
        debug('Sign up error:', authError);
        setError(authError.message);
        setLoading(false);
        return { error: authError.message };
      }

      debug('Sign up success:', data.user?.email);
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      debug('Sign up exception:', err);
      setError(err.message);
      setLoading(false);
      return { error: err.message };
    }
  };

  const signInWithGoogle = async () => {
    debug('Attempting Google sign in');
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' }
        }
      });

      if (authError) {
        debug('Google sign in error:', authError);
        setError(authError.message);
        return { error: authError.message };
      }

      debug('Google sign in initiated');
      return { error: null };
    } catch (err: any) {
      debug('Google sign in exception:', err);
      setError(err.message);
      return { error: err.message };
    }
  };

  const signOut = async () => {
    debug('Attempting sign out');
    await supabase.auth.signOut();
    debug('Sign out complete');
  };

  const resetPassword = async (email: string) => {
    debug('Attempting password reset for:', email);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    return { error: authError?.message || null };
  };

  return { user, loading, error, signIn, signUp, signInWithGoogle, signOut, resetPassword };
}
