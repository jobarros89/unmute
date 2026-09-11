import { Redirect } from "expo-router";
import { Text } from "react-native";
import { useLearning } from "../src/features/learning/provider";
import { Loading, Screen, styles } from "../src/components/ui";

export default function Index() {
  const { state, ready, storageError } = useLearning();
  if (!ready) return <Loading />;
  if (storageError)
    return (
      <Screen>
        <Text style={styles.title}>Vamos recuperar seu treino.</Text>
        <Text style={styles.error}>{storageError}</Text>
      </Screen>
    );
  return <Redirect href={state.settings ? "/(tabs)" : "/onboarding"} />;
}
