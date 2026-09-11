import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import * as Speech from "expo-speech";
import { Button, Card, Loading, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/features/auth/provider";
import { requireBackend } from "../src/lib/supabase";

type Review = {
  id: string;
  original: string;
  corrected: string;
  explanation: string;
  repetitions: number;
  due_at: string;
};
export default function Review() {
  const router = useRouter();
  const { session } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  async function load() {
    setReady(false);
    setError("");
    try {
      if (session) {
        const { data, error } = await requireBackend()
          .from("review_items")
          .select("*")
          .lte("due_at", new Date().toISOString())
          .order("due_at")
          .limit(30);
        if (error) throw error;
        setItems(data as Review[]);
      }
    } catch {
      setError("Não foi possível carregar sua revisão.");
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      void Speech.stop();
    };
  }, [session?.user.id]);
  async function answer(remembered: boolean) {
    const item = items[0];
    if (!item || busy) return;
    setBusy(true);
    setError("");
    try {
      const repetitions = remembered ? Math.min(item.repetitions + 1, 10) : 0;
      const days = remembered ? Math.min(2 ** repetitions, 30) : 0;
      const { error } = await requireBackend()
        .from("review_items")
        .update({
          repetitions,
          due_at: new Date(
            Date.now() + (days ? days * 86400000 : 600000),
          ).toISOString(),
        })
        .eq("id", item.id);
      if (error) throw error;
      setItems((previous) => previous.slice(1));
      setReveal(false);
    } catch {
      setError("Sua revisão não foi salva. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  if (!ready) return <Loading />;
  const item = items[0];
  return (
    <Screen>
      <Button
        label="← Voltar"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
      <Text style={styles.eyebrow}>Revisão inteligente</Text>
      <Text style={styles.title}>Seus erros viram prática.</Text>
      {!session ? (
        <Card>
          <Text style={styles.body}>
            Entre para revisar as correções das suas conversas.
          </Text>
          <Button label="Entrar" onPress={() => router.push("/account")} />
        </Card>
      ) : error ? (
        <Card>
          <Text style={styles.error}>{error}</Text>
          <Button label="Tentar novamente" onPress={() => void load()} />
        </Card>
      ) : !item ? (
        <Card>
          <Text style={styles.heading}>Tudo em dia por aqui.</Text>
          <Text style={styles.body}>
            Novas correções das conversas vão aparecer aqui na hora de revisar.
          </Text>
          <Button
            label="Praticar uma conversa"
            onPress={() => router.push("/rooms")}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.small}>
            {items.length} revisão(ões) disponíveis
          </Text>
          <Text style={styles.body}>Como você melhoraria esta frase?</Text>
          <Text style={styles.heading}>{item.original}</Text>
          {!reveal ? (
            <Button label="Mostrar sugestão" onPress={() => setReveal(true)} />
          ) : (
            <>
              <Text style={styles.heading}>{item.corrected}</Text>
              <Text style={styles.body}>{item.explanation}</Text>
              <Button
                label="Ouvir a frase"
                secondary
                onPress={() =>
                  Speech.speak(item.corrected, { language: "en-US" })
                }
              />
              <Button
                label="Lembrei sem ajuda"
                busy={busy}
                onPress={() => void answer(true)}
              />
              <Button
                label="Quero rever em 10 minutos"
                secondary
                busy={busy}
                onPress={() => void answer(false)}
              />
            </>
          )}
        </Card>
      )}
    </Screen>
  );
}
