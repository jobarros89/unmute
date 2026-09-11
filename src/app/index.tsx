import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>UNMUTE</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Inglês para a vida real.</Text>
          <Text style={styles.subtitle}>
            Ouça. Fale. Receba feedback. Repita. Evolua.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>PRIMEIRO CICLO</Text>
          <Text style={styles.cardTitle}>Listen → Speak → Feedback</Text>
          <Text style={styles.cardBody}>
            A fundação do app está pronta para receber diagnóstico, lições curtas e prática de fala.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xxl,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  hero: {
    gap: spacing.md,
    maxWidth: 560,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 27,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 25,
  },
});
