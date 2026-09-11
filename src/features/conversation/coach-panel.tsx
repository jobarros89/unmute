import { useRef, useState } from "react";
import { Text, TextInput } from "react-native";
import { Button, Card, styles } from "../../components/ui";
import { askCoach, type CoachFeedback, type CoachInput } from "./coach";
import { Recording } from "../speaking/recording";
import { speakEnglish } from "../speaking/speech";

export function Feedback({ value }: { value: CoachFeedback }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Seu feedback</Text>
      <Text style={styles.small}>
        Transcrição · pode conter erros de reconhecimento
      </Text>
      <Text style={styles.body}>{value.transcript}</Text>
      <Text style={styles.heading}>
        {value.hasCorrection
          ? "Você pode dizer:"
          : "Sua frase funciona neste contexto"}
      </Text>
      <Text style={styles.body}>{value.corrected}</Text>
      <Text style={styles.body}>{value.explanation}</Text>
      <Text style={styles.body}>{value.reply}</Text>
      <Button
        label="Ouvir a resposta"
        secondary
        onPress={() => {
          speakEnglish(value.reply);
        }}
      />
      <Button
        label="Ouvir resposta mais devagar · 0,5×"
        secondary
        onPress={() => speakEnglish(value.reply, { slow: true })}
      />
      <Text style={styles.heading}>Tente agora</Text>
      <Text style={styles.body}>{value.followup}</Text>
      <Text style={styles.small}>
        Feedback de linguagem gerado por IA. Não é uma avaliação de pronúncia ou
        certificação de nível.
      </Text>
    </Card>
  );
}
export function CoachPanel({
  context,
}: {
  context: Omit<CoachInput, "text" | "uri">;
}) {
  const [text, setText] = useState("");
  const [uri, setUri] = useState<string | null>(null);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const [error, setError] = useState("");
  const lock = useRef(false);
  async function send(useAudio: boolean) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setFeedback(null);
    try {
      setFeedback(
        await askCoach({
          ...context,
          ...(useAudio && uri ? { uri } : { text }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível analisar.");
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <>
      <Card>
        <Text style={styles.heading}>Sua vez de falar</Text>
        <Recording
          label={context.reference || `Conversa: ${context.topic}`}
          onTake={() => undefined}
          onUri={setUri}
          onBusy={setRecordingBusy}
          disabled={busy}
        />
        <Text style={styles.small}>
          Ao enviar, você autoriza o processamento da tentativa pela Cloudflare
          Workers AI. O áudio não é salvo no banco; a transcrição e a correção
          ficam no histórico da sua conta.
        </Text>
        <Button
          label="Enviar minha voz ao coach"
          busy={busy}
          disabled={!uri || recordingBusy}
          onPress={() => void send(true)}
        />
        <Text style={styles.small}>Prefere escrever agora?</Text>
        <TextInput
          style={styles.input}
          accessibilityLabel="Sua resposta em inglês"
          placeholder="Your answer in English…"
          multiline
          maxLength={2000}
          value={text}
          onChangeText={setText}
          editable={!busy}
        />
        <Button
          label="Enviar texto ao coach"
          secondary
          disabled={!text.trim() || recordingBusy}
          busy={busy}
          onPress={() => void send(false)}
        />
      </Card>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {feedback ? <Feedback value={feedback} /> : null}
    </>
  );
}
