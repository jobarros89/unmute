import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LearningProvider } from "../src/features/learning/provider";
import { colors } from "../src/components/ui";
import { AuthProvider, useAuth } from "../src/features/auth/provider";
import { Loading, Screen, styles } from "../src/components/ui";
import { Text } from "react-native";

function AppSession() {
  const { session, ready, error } = useAuth();
  if (!ready) return <Loading />;
  if (error)
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  return (
    <LearningProvider
      key={session?.user.id ?? "guest"}
      userId={session?.user.id}
    >
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="account" />
        <Stack.Protected guard={Boolean(session && !session.user.is_anonymous)}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="lesson/[id]" />
          <Stack.Screen name="assessment" />
          <Stack.Screen name="rooms" />
          <Stack.Screen name="review" />
          <Stack.Screen name="password" />
        </Stack.Protected>
      </Stack>
    </LearningProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppSession />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
