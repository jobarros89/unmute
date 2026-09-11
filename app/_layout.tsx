import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LearningProvider } from "../src/features/learning/provider";
import { colors } from "../src/components/ui";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LearningProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </LearningProvider>
    </SafeAreaProvider>
  );
}
