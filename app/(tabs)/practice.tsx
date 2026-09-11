import { useRouter } from "expo-router";
import { Text } from "react-native";
import { Button, Card, Screen, styles } from "../../src/components/ui";
import { lessons } from "../../src/features/learning/lessons";

export default function Practice() {
  const router = useRouter();
  return (
    <Screen>
      <Text style={styles.eyebrow}>Situações reais</Text>
      <Text style={styles.title}>Onde você quer{"\n"}usar sua voz?</Text>
      <Text style={styles.body}>
        Escolha um contexto. Repita quantas vezes precisar.
      </Text>
      {lessons.map((lesson) => (
        <Card key={lesson.id}>
          <Text style={styles.heading}>{lesson.title}</Text>
          <Text style={styles.body}>{lesson.subtitle}</Text>
          <Text style={styles.small}>
            {lesson.exercises.length} frases · prática guiada
          </Text>
          <Button
            label={`Praticar: ${lesson.title}`}
            onPress={() => router.push(`/lesson/${lesson.id}`)}
            secondary
          />
        </Card>
      ))}
    </Screen>
  );
}
