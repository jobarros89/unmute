import Feather from "@expo/vector-icons/Feather";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, Loading } from "../../src/components/ui";
import { useLearning } from "../../src/features/learning/provider";

export default function TabLayout() {
  const { ready, state, storageError } = useLearning();
  const insets = useSafeAreaInsets();
  if (!ready) return <Loading />;
  if (storageError) return <Redirect href="/" />;
  if (!state.settings) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color, size }) => (
            <Feather name="sun" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Praticar",
          tabBarIcon: ({ color, size }) => (
            <Feather name="mic" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Meu progresso",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
