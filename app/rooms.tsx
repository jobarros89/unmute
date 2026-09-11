import { randomUUID } from "expo-crypto";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Button, Card, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/features/auth/provider";
import { CoachPanel } from "../src/features/conversation/coach-panel";

const rooms = [
  {
    id: "airport",
    name: "No aeroporto",
    prompt: "Good morning! Where are you flying today?",
  },
  {
    id: "work",
    name: "Sua primeira reunião",
    prompt: "Welcome to the team! Could you tell me about your work?",
  },
  {
    id: "cafe",
    name: "Na cafeteria",
    prompt: "Hi there! What would you like to order?",
  },
];
export default function Rooms() {
  const router = useRouter();
  const { session } = useAuth();
  const [room, setRoom] = useState<(typeof rooms)[number] | null>(null);
  const [conversationId, setId] = useState(randomUUID);
  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );
  return (
    <Screen>
      <Button
        label="← Voltar ao treino"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
      <Text style={styles.eyebrow}>Unmute Rooms</Text>
      <Text style={styles.title}>Uma conversa.{"\n"}Uma situação real.</Text>
      {!session ? (
        <Card>
          <Text style={styles.body}>
            Entre para conversar por voz com o coach e guardar suas correções.
          </Text>
          <Button
            label="Entrar ou criar conta"
            onPress={() => router.push("/account")}
          />
        </Card>
      ) : !room ? (
        rooms.map((item) => (
          <Card key={item.id}>
            <Text style={styles.heading}>{item.name}</Text>
            <Button
              label="Entrar nesta conversa"
              onPress={() => {
                setId(randomUUID());
                setRoom(item);
              }}
            />
          </Card>
        ))
      ) : (
        <>
          <Card>
            <Text style={styles.heading}>{room.name}</Text>
            <Text style={styles.body}>{room.prompt}</Text>
            <Button
              label="Ouvir a primeira pergunta"
              onPress={() => {
                void Speech.stop();
                Speech.speak(room.prompt, { language: "en-US" });
              }}
              secondary
            />
          </Card>
          <CoachPanel
            key={conversationId}
            context={{ mode: "room", topic: room.id, conversationId }}
          />
          <Button
            label="Encerrar e escolher outra situação"
            secondary
            onPress={() => setRoom(null)}
          />
        </>
      )}
    </Screen>
  );
}
