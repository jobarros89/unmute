import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, colors, Screen, styles } from "../../src/components/ui";
import { useLearning } from "../../src/features/learning/provider";
import { summarize } from "../../src/features/learning/model";
import { findLesson } from "../../src/features/learning/lessons";
import { useAuth } from "../../src/features/auth/provider";

export default function Progress() {
  const router = useRouter();
  const { session } = useAuth();
  const { state } = useLearning();
  const total = summarize(state.sessions);
  return (
    <Screen>
      <Text style={styles.eyebrow}>Meu progresso</Text>
      <Text style={styles.title}>Cada tentativa{"\n"}conta.</Text>
      <Text style={styles.body}>
        {session
          ? "Seu histórico sincronizado nesta conta."
          : "Seu histórico de prática neste aparelho."}{" "}
        O tempo registrado é a duração das gravações aceitas, incluindo
        eventuais pausas.
      </Text>
      <View style={[styles.row, { alignItems: "stretch" }]}>
        {[
          [total.sessions, "treinos"],
          [total.repetitions, "repetições"],
          [Math.round(total.recordingSeconds), "seg. gravados"],
        ].map(([value, label]) => (
          <View
            key={label}
            style={{
              flex: 1,
              minWidth: 90,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 24,
              backgroundColor: colors.white,
            }}
          >
            <Text style={styles.heading}>{value}</Text>
            <Text style={styles.small}>{label}</Text>
          </View>
        ))}
      </View>
      {state.sessions.length === 0 ? (
        <Card>
          <Text style={styles.heading}>Sua primeira conversa começa aqui.</Text>
          <Text style={styles.body}>
            Conclua um treino para começar seu histórico. Não precisa sair
            perfeito.
          </Text>
          <Button
            label="Escolher meu primeiro treino"
            onPress={() => router.push("/(tabs)/practice")}
          />
        </Card>
      ) : (
        <>
          <Text style={styles.heading}>Últimos treinos</Text>
          {state.sessions.slice(0, 10).map((session) => (
            <Card key={session.id}>
              <Text style={styles.heading}>
                {findLesson(session.lessonId)?.title ?? "Prática de inglês"}
              </Text>
              <Text style={styles.small}>
                {new Date(session.completedAt).toLocaleDateString("pt-BR")} ·{" "}
                {session.repetitions} repetições ·{" "}
                {Math.round(session.recordingSeconds)} segundos gravados
              </Text>
            </Card>
          ))}
        </>
      )}
      <Button
        label={session ? "Minha conta" : "Entrar para sincronizar"}
        onPress={() => router.push("/account")}
        secondary
      />
      <Button
        label="Ajustar meu objetivo e ritmo"
        onPress={() => router.push("/onboarding")}
        secondary
      />
      <Text style={styles.small}>
        Esses registros mostram prática realizada. Ainda não representam uma
        avaliação de nível ou fluência.
      </Text>
    </Screen>
  );
}
