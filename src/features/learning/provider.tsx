import AsyncStorage from "@react-native-async-storage/async-storage";
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

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>(emptyLearningState);
  const current = useRef(state);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const canWrite = useRef(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
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
  }, []);

  function persist(update: (previous: LearningState) => LearningState) {
    const operation = queue.current.then(async () => {
      if (!canWrite.current)
        throw new Error(
          "Seu histórico não pôde ser carregado. Tente reabrir o aplicativo.",
        );
      const next = update(current.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
          persist((previous) => ({
            ...previous,
            settings: settingsSchema.parse(settings),
          })),
        complete: (session) =>
          persist((previous) => addSession(previous, session)),
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
