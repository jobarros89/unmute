import { Redirect, useRouter } from "expo-router";
import { Text } from "react-native";
import { useLearning } from "../src/features/learning/provider";
import { Button, Loading, Screen, styles } from "../src/components/ui";

export default function Index() {
  const router = useRouter();
  const { state, ready, storageError } = useLearning();
  if (!ready) return <Loading />;
  if (storageError)
    return (
      <Screen>
        <Text style={styles.title}>Vamos recuperar seu treino.</Text>
        <Text style={styles.error}>{storageError}</Text>
        <Button
          label="Abrir minha conta"
          onPress={() => router.push("/account")}
        />
      </Screen>
    );
  return <Redirect href={state.settings ? "/(tabs)" : "/onboarding"} />;
}
