import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput } from "react-native";
import { Button, Card, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/features/auth/provider";
import {
  authRedirectTo,
  backendConfigured,
  requireBackend,
} from "../src/lib/supabase";

export default function Account() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<
    "login" | "signup" | "verify" | "reset" | "recovery" | "password"
  >("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const db = requireBackend();
      const address = email.trim().toLowerCase();
      if (mode === "password") {
        if (password.length < 12)
          throw new Error("Use uma senha com pelo menos 12 caracteres.");
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        router.replace("/");
        return;
      }
      if (!address.includes("@")) throw new Error("Informe um e-mail válido.");
      if (mode === "verify" || mode === "recovery") {
        const { error } = await db.auth.verifyOtp({
          email: address,
          token: token.trim(),
          type: mode === "verify" ? "signup" : "recovery",
        });
        if (error) throw error;
        if (mode === "recovery") {
          router.replace("/password");
        } else router.replace("/");
        return;
      }
      if (mode === "reset") {
        const { error } = await db.auth.resetPasswordForEmail(address, {
          redirectTo: authRedirectTo,
        });
        if (error) throw error;
        setMode("recovery");
        setMessage("Se o e-mail estiver cadastrado, você receberá um código.");
        return;
      }
      if (mode === "signup" && password.length < 12)
        throw new Error("Use uma senha com pelo menos 12 caracteres.");
      const result =
        mode === "signup"
          ? await db.auth.signUp({
              email: address,
              password,
              options: { emailRedirectTo: authRedirectTo },
            })
          : await db.auth.signInWithPassword({ email: address, password });
      if (result.error) throw result.error;
      if (result.data.session) router.replace("/");
      else {
        setMode("verify");
        setMessage(
          "Confira seu e-mail. Se recebeu um código, digite abaixo. Se recebeu um link, clique para confirmar e depois volte aqui e escolha Já tenho conta para entrar.",
        );
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Button
        label="← Voltar"
        secondary
        onPress={() => router.replace("/")}
        disabled={busy}
      />
      <Text style={styles.wordmark}>unmute.</Text>
      {session && mode !== "password" ? (
        <Card>
          <Text style={styles.heading}>Sua conta</Text>
          <Text style={styles.body}>{session.user.email}</Text>
          <Text style={styles.small}>
            Você já está conectado. O link de confirmação também permite entrar;
            sua sessão fica salva neste aparelho até você sair.
          </Text>
          <Button
            label="Continuar meus treinos"
            onPress={() => router.replace("/")}
          />
          <Text style={styles.body}>
            Seu perfil e os treinos feitos nesta conta são salvos na nuvem. A
            prática local fica separada.
          </Text>
          <Button
            label="Sair da conta"
            secondary
            busy={busy}
            onPress={() => {
              setBusy(true);
              void requireBackend()
                .auth.signOut()
                .then(({ error }) => {
                  if (error) throw error;
                  router.replace("/");
                })
                .catch(() =>
                  setMessage("Não foi possível sair. Tente novamente."),
                )
                .finally(() => setBusy(false));
            }}
          />
        </Card>
      ) : (
        <>
          <Text style={styles.title}>
            {mode === "signup"
              ? "Crie espaço para sua voz."
              : mode === "verify" || mode === "recovery"
                ? "Confira seu e-mail."
                : mode === "password"
                  ? "Escolha sua nova senha."
                  : "Entre no seu ritmo."}
          </Text>
          {!backendConfigured ? (
            <Card>
              <Text style={styles.body}>
                Contas e análise por IA ainda não foram ativadas neste ambiente.
                Os treinos locais estão disponíveis.
              </Text>
            </Card>
          ) : (
            <>
              {mode !== "password" && (
                <TextInput
                  style={styles.input}
                  accessibilityLabel="E-mail"
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!busy}
                />
              )}
              {["login", "signup", "password"].includes(mode) && (
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Senha"
                  placeholder="Senha"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChangeText={setPassword}
                  editable={!busy}
                />
              )}
              {["verify", "recovery"].includes(mode) && (
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Código recebido por e-mail"
                  placeholder="Código do e-mail"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  value={token}
                  onChangeText={setToken}
                  editable={!busy}
                />
              )}
              <Button
                label={
                  mode === "login"
                    ? "Entrar"
                    : mode === "signup"
                      ? "Criar conta"
                      : mode === "reset"
                        ? "Enviar código"
                        : "Confirmar"
                }
                busy={busy}
                onPress={() => void submit()}
              />
              <Button
                label={mode === "login" ? "Criar uma conta" : "Já tenho conta"}
                secondary
                disabled={busy}
                onPress={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setMessage("");
                }}
              />
              {mode === "login" && (
                <Button
                  label="Esqueci minha senha"
                  secondary
                  disabled={busy}
                  onPress={() => setMode("reset")}
                />
              )}
            </>
          )}
        </>
      )}
      {message ? (
        <Text accessibilityRole="alert" style={styles.body}>
          {message}
        </Text>
      ) : null}
    </Screen>
  );
}
