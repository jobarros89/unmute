import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";
import { supabase } from "../../lib/supabase";

const AuthContext = createContext<{
  session: Session | null;
  ready: boolean;
  error: string;
}>({ session: null, ready: false, error: "" });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    let eventReceived = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, value) => {
      eventReceived = true;
      if (active) {
        setSession(value);
        setReady(true);
        setError("");
      }
    });
    void supabase.auth
      .getSession()
      .then(({ data, error: err }) => {
        if (!active || eventReceived) return;
        if (err)
          setError(
            "Não foi possível recuperar sua sessão. Tente abrir novamente.",
          );
        else setSession(data.session);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível recuperar sua sessão.");
          setReady(true);
        }
      });
    const listener = AppState.addEventListener("change", (state) => {
      if (Platform.OS === "web") return;
      if (state === "active") supabase?.auth.startAutoRefresh();
      else supabase?.auth.stopAutoRefresh();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      listener.remove();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ session, ready, error }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
