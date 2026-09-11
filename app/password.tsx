import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput } from "react-native";
import { Button, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/features/auth/provider";
import { requireBackend } from "../src/lib/supabase";
export default function Password() {
  const { session } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!session) return <Redirect href="/account" />;
  async function save() {
    setBusy(true);
    setError("");
    try {
      const { error } = await requireBackend().auth.updateUser({ password });
      if (error) throw error;
      router.replace("/");
    } catch {
      setError("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Text style={styles.title}>Sua nova senha.</Text>
      <Text style={styles.body}>Use pelo menos 12 caracteres.</Text>
      <TextInput
        accessibilityLabel="Nova senha"
        style={styles.input}
        secureTextEntry
        autoComplete="new-password"
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <Button
        label="Salvar nova senha"
        busy={busy}
        disabled={password.length < 12}
        onPress={() => void save()}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}
