import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, colors, Screen, styles } from "../../src/components/ui";
import { useLearning } from "../../src/features/learning/provider";
import { findLesson } from "../../src/features/learning/lessons";
import { dailyPlan, activeStreak } from "../../src/features/learning/plan";
import { useAuth } from "../../src/features/auth/provider";

export default function Today() {
  const router = useRouter();
  const { state } = useLearning();
  const { session } = useAuth();
  const plan = state.settings
    ? dailyPlan(state.settings, state.sessions)
    : null;
  const lesson = findLesson(state.settings?.goal);
  return (
    <Screen>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.wordmark}>unmute.</Text>
        <Text style={styles.small}>
          {state.settings?.dailyMinutes} min por dia
        </Text>
      </View>
      <Text style={styles.eyebrow}>
        {state.settings?.name
          ? `Olá, ${state.settings.name}`
          : "Bom ter você aqui"}
      </Text>
      <Text style={styles.title}>Dê voz ao seu dia.</Text>
      <Text style={styles.body}>
        Hoje, comece com uma conversa que poderia acontecer no seu dia.
      </Text>
      <Card dark>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          Seu próximo treino
        </Text>
        <Text
          style={[
            styles.title,
            { color: colors.white, fontSize: 30, lineHeight: 36 },
          ]}
        >
          {lesson?.title}
        </Text>
        <Text style={[styles.body, { color: "#DDE5DF" }]}>
          3 frases · ouvir, repetir e experimentar
        </Text>
        <Button
          label="Dar voz ao meu inglês →"
          onPress={() => router.push(`/lesson/${lesson?.id ?? "everyday"}`)}
        />
      </Card>
      <Text style={styles.heading}>
        Seu plano de hoje · {state.settings?.dailyMinutes} min
      </Text>
      <Text style={styles.small}>
        {plan?.complete
          ? "Treino guiado de hoje concluído. Você pode continuar praticando."
          : "Uma rotina curta para ouvir, falar e revisar."}{" "}
        · {activeStreak(state.sessions)} dia(s) de prática em sequência
      </Text>
      {plan?.steps.map((step) => (
        <Button
          key={step.label}
          label={`${step.label} · ${step.minutes} min`}
          secondary
          onPress={() => router.push(step.route as "/rooms")}
        />
      ))}
      <Button
        label="Descobrir meu ponto de partida"
        secondary
        onPress={() => router.push("/assessment")}
      />
      <Button
        label={session ? "Minha conta" : "Entrar ou criar conta"}
        secondary
        onPress={() => router.push("/account")}
      />
      <Text style={styles.heading}>Um passo de cada vez</Text>
      {[
        ["01", "Ouça antes de ler", "Treine seu ouvido com uma frase curta."],
        ["02", "Fale do seu jeito", "Grave, escute sua voz e tente novamente."],
        ["03", "Leve para a vida", "Mude a frase para falar sobre você."],
      ].map(([number, title, body]) => (
        <View style={styles.row} key={number}>
          <Text style={[styles.heading, { color: colors.muted }]}>
            {number}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heading, { fontSize: 17 }]}>{title}</Text>
            <Text style={styles.small}>{body}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
