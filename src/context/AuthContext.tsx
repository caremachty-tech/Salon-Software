import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "owner" | "staff";

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
}

interface Salon {
  id: string;
  name: string;
  is_profile_complete: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  salon: Salon | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  salon: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProfile, setFetchingProfile] = useState<string | null>(null);

  const fetchProfileAndSalon = async (user: User) => {
    // Prevent redundant fetches for the same user
    if (fetchingProfile === user.id) return;
    setFetchingProfile(user.id);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setFetchingProfile(null);
        return;
      }

      if (profileData) {
        setProfile(profileData as Profile);

        if (profileData.role === "owner") {
          const { data: salonData } = await supabase
            .from("salons")
            .select("id, name, is_profile_complete")
            .eq("owner_id", user.id)
            .maybeSingle(); // Use maybeSingle to avoid 406 errors if no salon exists yet
          setSalon(salonData as Salon);
        } else {
          const { data: staffData } = await supabase
            .from("staff")
            .select("salon_id, salons(id, name, is_profile_complete)")
            .eq("user_id", user.id)
            .maybeSingle();
          if (staffData?.salons) {
            setSalon(staffData.salons as unknown as Salon);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile/salon:", error);
    } finally {
      setFetchingProfile(null);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
    if (s?.user) {
      await fetchProfileAndSalon(s.user);
    } else {
      setProfile(null);
      setSalon(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as the primary source of truth. 
    // It triggers immediately with the current session on subscription.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      try {
        setSession(s);
        
        if (s?.user) {
          await fetchProfileAndSalon(s.user);
        } else {
          setProfile(null);
          setSalon(null);
        }
      } catch (error: any) {
        // Catch the specific "lock stolen" or "AbortError" to prevent UI crashes
        if (error?.name === 'AbortError' || error?.message?.includes('lock')) {
          console.warn("Auth lock contention handled:", error.message);
        } else {
          console.error("Auth state change error:", error);
        }
      } finally {
        if (mounted && (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT")) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        salon,
        loading,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
