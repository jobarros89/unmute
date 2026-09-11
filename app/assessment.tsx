import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Button, Card, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/features/auth/provider";
import { requireBackend } from "../src/lib/supabase";

const questions = [
  {
    phrase: "I'm staying home tonight.",
    options: [
      "Vou ficar em casa hoje à noite.",
      "Vou trabalhar amanhã.",
      "Estou saindo agora.",
    ],
    answer: 0,
  },
  {
    phrase: "Could you tell me how to get to the station?",
    options: [
      "Que horas o trem sai?",
      "Pode me dizer como chegar à estação?",
      "Você trabalha na estação?",
    ],
    answer: 1,
  },
  {
    phrase: "If I had known about the delay, I would have left later.",
    options: [
      "Vou sair antes para evitar atraso.",
      "O atraso foi causado por mim.",
      "Se soubesse do atraso, teria saído mais tarde.",
    ],
    answer: 2,
  },
];
export default function Assessment() {
  const router = useRouter();
  const { session } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [comfort, setComfort] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [played, setPlayed] = useState(false);
  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  async function finish() {
    if (comfort === null || busy) return;
    setBusy(true);
    setError("");
    const correct = answers.filter(
      (answer, i) => answer === questions[i]?.answer,
    ).length;
    const summary =
      correct < 2
        ? "Comece por frases curtas: ouvir sem ler e repetir em voz alta."
        : comfort < 2
          ? "Você compreendeu boa parte desta amostra. Agora priorize responder em voz alta."
          : "Nesta amostra, você acompanhou bem. Experimente conversas com perguntas novas.";
    try {
      if (session) {
        const { error } = await requireBackend().from("assessments").insert({
          user_id: session.user.id,
          listening_correct: correct,
          listening_total: questions.length,
          speaking_comfort: comfort,
          summary,
        });
        if (error) throw error;
      }
      setResult(summary);
    } catch {
      setError("Não foi possível salvar o diagnóstico. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  const q = questions[index];
  return (
    <Screen>
      <Button
        label="← Voltar"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
      <Text style={styles.eyebrow}>Seu ponto de partida</Text>
      <Text style={styles.title}>Vamos ouvir primeiro.</Text>
      <Text style={styles.body}>
        Uma amostra curta para orientar seu próximo treino. Não certifica seu
        nível de inglês.
      </Text>
      {result ? (
        <Card>
          <Text style={styles.heading}>{result}</Text>
          <Text style={styles.small}>
            {session
              ? "Resultado salvo na sua conta."
              : "Resultado desta prática local; entre para guardar novos diagnósticos."}
          </Text>
          <Button
            label="Agora, praticar minha fala"
            onPress={() => router.push("/rooms")}
          />
        </Card>
      ) : q ? (
        <Card>
          <Text style={styles.small}>Listening · {index + 1} de 3</Text>
          <Button
            label="Ouvir"
            onPress={() => {
              setError("");
              Speech.speak(q.phrase, {
                language: "en-US",
                rate: 0.9,
                onDone: () => setPlayed(true),
                onError: () =>
                  setError(
                    "Não foi possível tocar o áudio. Confira o volume e tente novamente.",
                  ),
              });
            }}
          />
          {q.options.map((option, i) => (
            <Button
              key={option}
              label={option}
              secondary
              disabled={!played}
              onPress={() => {
                void Speech.stop();
                setAnswers((previous) => [...previous, i]);
                setIndex(index + 1);
                setPlayed(false);
              }}
            />
          ))}
          <Text style={styles.small}>
            Ouça até o final antes de escolher o significado.
          </Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.heading}>Como é responder em inglês?</Text>
          {[
            "Ainda travo para começar",
            "Respondo com palavras soltas",
            "Consigo formar frases",
            "Converso com alguma segurança",
          ].map((label, i) => (
            <Button
              key={label}
              label={`${comfort === i ? "✓ " : ""}${label}`}
              secondary={comfort !== i}
              onPress={() => setComfort(i)}
            />
          ))}
          <Button
            label="Ver meu ponto de partida"
            disabled={comfort === null}
            busy={busy}
            onPress={() => void finish()}
          />
        </Card>
      )}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}
