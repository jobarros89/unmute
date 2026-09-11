import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const authRedirectTo =
  Platform.OS === "web" ? globalThis.location?.origin : "unmute://auth";
export const backendConfigured = Boolean(url && key);
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          // Confirmação e recuperação usam código digitado no app. Não aceite
          // tokens de autenticação vindos de fragmentos/links da URL.
          detectSessionInUrl: false,
        },
      })
    : null;

export function requireBackend() {
  if (!supabase)
    throw new Error(
      "As contas e a IA ainda não estão disponíveis nesta versão. Você pode praticar no modo local.",
    );
  return supabase;
}
