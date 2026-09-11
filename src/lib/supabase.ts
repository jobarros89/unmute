import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

import { getPublicEnv } from '@/lib/env';

const env = getPublicEnv();

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
