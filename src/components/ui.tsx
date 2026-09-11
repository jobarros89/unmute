import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  background: "#F8F7F2",
  ink: "#182E2B",
  muted: "#596B65",
  accent: "#DDF486",
  border: "#DBE1D5",
  white: "#FFFFFF",
  error: "#8C2B22",
};
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        (disabled || busy) && { opacity: 0.45 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}
export function Card({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        dark && { backgroundColor: colors.ink, borderColor: colors.ink },
      ]}
    >
      {children}
    </View>
  );
}
export function Loading() {
  return (
    <SafeAreaView style={styles.loading}>
      <ActivityIndicator color={colors.ink} accessibilityLabel="Carregando" />
    </SafeAreaView>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 22,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  wordmark: {
    color: colors.ink,
    fontSize: 29,
    letterSpacing: -1.5,
    fontWeight: "900",
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1.6,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.1,
    fontWeight: "700",
  },
  heading: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  body: { color: colors.muted, fontSize: 16, lineHeight: 25 },
  small: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 54,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.ink,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  error: { color: colors.error, fontSize: 14, lineHeight: 22 },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 17,
    minHeight: 54,
  },
});
