import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { AppState, Platform, Text } from "react-native";
import { Button, styles } from "../../components/ui";
import { AudioReview } from "./audio-review";

function removeTake(uri: string | null) {
  if (!uri) return;
  try {
    if (Platform.OS === "web") URL.revokeObjectURL(uri);
    else {
      const file = new File(uri);
      if (file.exists) file.delete();
    }
  } catch {
    /* A temporary cache file may already have been removed by the OS. */
  }
}

export function Recording({
  onTake,
  onBusy,
  onUri,
  disabled = false,
  label,
}: {
  onTake: (seconds: number) => void;
  onBusy: (busy: boolean) => void;
  onUri?: (uri: string | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [uri, setUri] = useState<string | null>(null);
  const player = useAudioPlayer(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  const running = useRef(false);
  const lock = useRef(false);
  const savedUri = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useRef({ onTake, onBusy, onUri });
  callbacks.current = { onTake, onBusy, onUri };
  const stopRef = useRef<(discard?: boolean) => Promise<void>>(
    async () => undefined,
  );

  async function stop(discard = false) {
    if (lock.current || !running.current) return;
    lock.current = true;
    setBusy(true);
    if (timer.current) clearTimeout(timer.current);
    try {
      const seconds = Math.min(
        30,
        Math.max(0, recorder.getStatus().durationMillis / 1000),
      );
      await recorder.stop();
      running.current = false;
      const nextUri = recorder.uri;
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      if (!mounted.current || discard) {
        removeTake(nextUri);
        if (mounted.current)
          setError(
            "Gravação interrompida. Quando estiver pronto, tente novamente.",
          );
        return;
      }
      if (!nextUri || seconds < 0.5) {
        removeTake(nextUri);
        throw new Error(
          "Grave pelo menos um segundo para conseguir ouvir sua voz.",
        );
      }
      savedUri.current = nextUri;
      if (Platform.OS !== "web") player.replace(nextUri);
      setUri(nextUri);
      callbacks.current.onTake(seconds);
      callbacks.current.onUri?.(nextUri);
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível concluir a gravação. Tente novamente.",
        );
    } finally {
      running.current = false;
      lock.current = false;
      if (mounted.current) {
        setBusy(false);
        setRecording(false);
        callbacks.current.onBusy(false);
      }
    }
  }
  stopRef.current = stop;

  async function start() {
    if (lock.current || running.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    callbacks.current.onBusy(true);
    try {
      await Speech.stop();
      player.pause();
      const permission = await requestRecordingPermissionsAsync();
      if (!mounted.current) return;
      if (!permission.granted)
        throw new Error(
          "Para gravar sua voz, permita o acesso ao microfone nos ajustes do aparelho e tente novamente.",
        );
      if (AppState.currentState !== "active" && Platform.OS !== "web") return;
      removeTake(savedUri.current);
      savedUri.current = null;
      setUri(null);
      callbacks.current.onTake(0);
      callbacks.current.onUri?.(null);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
      await recorder.prepareToRecordAsync();
      if (
        !mounted.current ||
        (AppState.currentState !== "active" && Platform.OS !== "web")
      ) {
        await recorder.stop();
        removeTake(recorder.uri);
        await setAudioModeAsync({ allowsRecording: false });
        return;
      }
      recorder.record();
      running.current = true;
      setRecording(true);
      timer.current = setTimeout(() => {
        void stopRef.current();
      }, 30_000);
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível iniciar a gravação.",
        );
    } finally {
      lock.current = false;
      if (mounted.current) {
        setBusy(false);
        if (!running.current) callbacks.current.onBusy(false);
      }
    }
  }

  async function play() {
    setError("");
    try {
      await Speech.stop();
      await player.seekTo(0);
      player.play();
    } catch {
      setError("Não foi possível reproduzir. Tente gravar novamente.");
    }
  }

  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        try {
          player.pause();
        } catch {
          /* disposed player */
        }
        void Speech.stop();
        void stopRef.current(true);
      }
    });
    return () => {
      mounted.current = false;
      subscription.remove();
      if (timer.current) clearTimeout(timer.current);
      void Speech.stop();
      try {
        player.pause();
      } catch {
        /* hook releases native resources */
      }
      const oldUri = savedUri.current;
      if (running.current) {
        try {
          void recorder
            .stop()
            .then(() => removeTake(recorder.uri))
            .catch(() => undefined);
        } catch {
          /* already released by hook */
        }
      }
      removeTake(oldUri);
      void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    };
  }, [player, recorder]);

  return (
    <>
      <Text style={styles.small}>
        {recording
          ? `Gravando · ${Math.floor(recorderState.durationMillis / 1000)} de 30 segundos`
          : "Grave uma tentativa de até 30 segundos. Você poderá ouvi-la e repetir."}
      </Text>
      <Button
        label={
          recording
            ? "Parar gravação"
            : uri
              ? "Gravar novamente"
              : "Gravar minha voz"
        }
        onPress={() => {
          void (recording ? stop() : start());
        }}
        busy={busy}
        disabled={disabled}
      />
      {uri && !recording ? (
        Platform.OS === "web" ? (
          <AudioReview uri={uri} label={label} />
        ) : (
          <Button
            label="Ouvir minha gravação"
            onPress={() => void play()}
            secondary
            disabled={busy}
          />
        )
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Text style={styles.small}>
        Sua gravação fica temporariamente neste aparelho. Só é enviada se você
        escolher uma ação de análise.
      </Text>
    </>
  );
}
