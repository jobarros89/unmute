import { useRouter } from "expo-router";
import { Text } from "react-native";
import { Button, Screen, styles } from "../src/components/ui";
export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <Text style={styles.title}>Vamos voltar ao seu treino?</Text>
      <Button label="Ir para o início" onPress={() => router.replace("/")} />
    </Screen>
  );
}
