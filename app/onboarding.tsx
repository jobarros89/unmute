import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button, Screen, styles } from "../src/components/ui";
import {
  goalLabels,
  goals,
  type Settings,
} from "../src/features/learning/model";
import { useLearning } from "../src/features/learning/provider";

export default function Onboarding() {
  const router = useRouter();
  const { state, saveSettings } = useLearning();
  const [name, setName] = useState(state.settings?.name ?? "");
  const [goal, setGoal] = useState<Settings["goal"]>(
    state.settings?.goal ?? "everyday",
  );
  const [dailyMinutes, setMinutes] = useState<Settings["dailyMinutes"]>(
    state.settings?.dailyMinutes ?? 10,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setBusy(true);
    setError("");
    try {
      await saveSettings({ name: name.trim(), goal, dailyMinutes });
      router.replace("/(tabs)");
    } catch {
      setError("Não conseguimos salvar. Tente novamente antes de continuar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Text style={styles.wordmark}>unmute.</Text>
      <Text style={styles.eyebrow}>Seu inglês começa na sua vida</Text>
      <Text style={styles.title}>Mais espaço{"\n"}para sua voz.</Text>
      <Text style={styles.body}>
        Ouça, repita e leve o inglês para situações que fazem parte do seu dia.
      </Text>
      <View style={{ gap: 10 }}>
        <Text style={styles.heading}>Como podemos te chamar?</Text>
        <TextInput
          accessibilityLabel="Seu nome"
          placeholder="Seu nome (opcional)"
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={40}
          autoComplete="given-name"
        />
      </View>
      <View style={{ gap: 10 }}>
        <Text style={styles.heading}>O que você quer destravar?</Text>
        {goals.map((item) => (
          <Button
            key={item}
            label={`${goal === item ? "✓ " : ""}${goalLabels[item]}`}
            secondary={goal !== item}
            onPress={() => setGoal(item)}
          />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Text style={styles.heading}>Um ritmo que cabe no seu dia</Text>
        <View style={styles.row}>
          {([5, 10, 20] as const).map((minutes) => (
            <View key={minutes} style={{ flex: 1 }}>
              <Button
                label={`${minutes} min`}
                secondary={dailyMinutes !== minutes}
                onPress={() => setMinutes(minutes)}
              />
            </View>
          ))}
        </View>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button
        label={
          state.settings ? "Salvar meu ritmo" : "Começar meu primeiro treino"
        }
        onPress={() => void start()}
        busy={busy}
      />
      <Text style={styles.small}>
        Você pode mudar seu objetivo e seu ritmo quando quiser.
      </Text>
    </Screen>
  );
}
