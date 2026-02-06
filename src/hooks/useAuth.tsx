import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sessionError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Refresh session 5 minutes before expiration
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Clear any existing refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Proactive session refresh function
  const refreshSession = useCallback(async (): Promise<Session | null> => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error.message);
        setSessionError(error);
        return null;
      }
      
      if (isMountedRef.current) {
        setSessionError(null);
        setSession(refreshedSession);
        setUser(refreshedSession?.user ?? null);
      }
      
      return refreshedSession;
    } catch (error) {
      console.error('Unexpected error during session refresh:', error);
      if (isMountedRef.current) {
        setSessionError(error as Error);
      }
      return null;
    }
  }, []);

  // Schedule proactive session refresh before expiration
  const scheduleSessionRefresh = useCallback((currentSession: Session | null) => {
    clearRefreshTimer();
    
    if (!currentSession?.expires_at) return;
    
    const expiresAt = currentSession.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiration = expiresAt - now;
    const refreshIn = timeUntilExpiration - REFRESH_THRESHOLD_MS;
    
    if (refreshIn > 0) {
      console.log(`Session refresh scheduled in ${Math.round(refreshIn / 1000 / 60)} minutes`);
      refreshTimerRef.current = setTimeout(async () => {
        console.log('Executing proactive session refresh...');
        const newSession = await refreshSession();
        if (newSession && isMountedRef.current) {
          scheduleSessionRefresh(newSession);
        }
      }, refreshIn);
    } else if (timeUntilExpiration > 0) {
      // Session is about to expire, refresh immediately
      console.log('Session expiring soon, refreshing now...');
      refreshSession().then((newSession) => {
        if (newSession && isMountedRef.current) {
          scheduleSessionRefresh(newSession);
        }
      });
    }
  }, [clearRefreshTimer, refreshSession]);

  // Handle auth state change events
  const handleAuthStateChange = useCallback((event: AuthChangeEvent, newSession: Session | null) => {
    if (!isMountedRef.current) return;
    
    console.log('Auth state change:', event);
    
    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setSessionError(null);
        scheduleSessionRefresh(newSession);
        break;
        
      case 'SIGNED_OUT':
        setSession(null);
        setUser(null);
        setSessionError(null);
        clearRefreshTimer();
        break;
        
      case 'USER_UPDATED':
        setSession(newSession);
        setUser(newSession?.user ?? null);
        break;
        
      case 'PASSWORD_RECOVERY':
        // Handle password recovery state if needed
        setSession(newSession);
        setUser(newSession?.user ?? null);
        break;
        
      default:
        // Handle INITIAL_SESSION and any other events
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession) {
          scheduleSessionRefresh(newSession);
        }
    }
  }, [scheduleSessionRefresh, clearRefreshTimer]);

  useEffect(() => {
    isMountedRef.current = true;

    // Listener for ONGOING auth changes (does NOT control loading state)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // INITIAL load (controls loading state)
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (isMountedRef.current) {
            setSessionError(error);
          }
        }
        
        if (!isMountedRef.current) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession) {
          scheduleSessionRefresh(initialSession);
        }
      } finally {
        // Only set loading to false after initial check is complete
        if (isMountedRef.current) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      clearRefreshTimer();
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, scheduleSessionRefresh, clearRefreshTimer]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    clearRefreshTimer();
    await supabase.auth.signOut();
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      sessionError,
      signIn, 
      signUp, 
      signOut, 
      updatePassword,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
