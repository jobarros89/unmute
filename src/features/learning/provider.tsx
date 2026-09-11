import AsyncStorage from "@react-native-async-storage/async-storage";
import { requireBackend } from "../../lib/supabase";
import { learningSchema } from "./model";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addSession,
  emptyLearningState,
  restoreLearningState,
  settingsSchema,
  type LearningState,
  type Session,
  type Settings,
} from "./model";

const STORAGE_KEY = "unmute.learning.v1";
type Context = {
  state: LearningState;
  ready: boolean;
  storageError: string | null;
  saveSettings: (settings: Settings) => Promise<void>;
  complete: (session: Session) => Promise<void>;
};
const LearningContext = createContext<Context | null>(null);

export function LearningProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const [state, setState] = useState<LearningState>(emptyLearningState);
  const current = useRef(state);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const canWrite = useRef(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!userId) return AsyncStorage.getItem(STORAGE_KEY);
      const db = requireBackend();
      const [profile, sessions] = await Promise.all([
        db
          .from("profiles")
          .select("settings")
          .eq("user_id", userId)
          .maybeSingle(),
        db
          .from("lesson_sessions")
          .select("payload")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(500),
      ]);
      if (profile.error || sessions.error)
        throw profile.error || sessions.error;
      return JSON.stringify(
        learningSchema.parse({
          version: 1,
          settings: profile.data?.settings ?? null,
          sessions: sessions.data.map((row) => row.payload),
        }),
      );
    };
    load()
      .then((raw) => {
        if (!active) return;
        const restored = restoreLearningState(raw);
        current.current = restored;
        setState(restored);
        canWrite.current = true;
      })
      .catch(() => {
        if (active)
          setStorageError(
            "Não foi possível abrir seu histórico. Feche e abra o aplicativo para tentar novamente.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  function persist(
    update: (previous: LearningState) => LearningState,
    writeRemote?: () => Promise<void>,
  ) {
    const operation = queue.current.then(async () => {
      if (!canWrite.current)
        throw new Error(
          "Seu histórico não pôde ser carregado. Tente reabrir o aplicativo.",
        );
      const next = update(current.current);
      if (userId) await writeRemote?.();
      else await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      current.current = next;
      setState(next);
      setStorageError(null);
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  }

  return (
    <LearningContext.Provider
      value={{
        state,
        ready,
        storageError,
        saveSettings: (settings) =>
          persist(
            (previous) => ({
              ...previous,
              settings: settingsSchema.parse(settings),
            }),
            async () => {
              const { error } = await requireBackend()
                .from("profiles")
                .upsert({
                  user_id: userId,
                  settings: settingsSchema.parse(settings),
                });
              if (error) throw error;
            },
          ),
        complete: (session) =>
          persist(
            (previous) => addSession(previous, session),
            async () => {
              const { error } = await requireBackend()
                .from("lesson_sessions")
                .upsert(
                  {
                    user_id: userId,
                    id: session.id,
                    payload: session,
                    completed_at: session.completedAt,
                  },
                  { onConflict: "user_id,id", ignoreDuplicates: true },
                );
              if (error) throw error;
            },
          ),
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("LearningProvider is missing");
  return value;
}
