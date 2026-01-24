import { supabase } from './supabase';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  goal?: string;
};

// Sign up new user
export async function signUp(email: string, password: string, name: string, goal: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        goal,
        username: username || null
      }
    }
  });

  if (error) throw error;
  
  // Update profile with username if provided
  // Add retry logic since trigger might not have created profile yet
  if (data.user && username) {
    let retries = 5;
    while (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase() })
        .eq('id', data.user.id);
      
      if (!updateError) break;
      retries--;
    }
  }
  
  return data;
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email,
    name: profile.name,
    goal: profile.goal
  };
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

// Send password reset email
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

// Update password (after clicking reset link)
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
}
