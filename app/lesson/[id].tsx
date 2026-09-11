import { randomUUID } from "expo-crypto";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  Button,
  Card,
  colors,
  Loading,
  Screen,
  styles,
} from "../../src/components/ui";
import {
  findLesson,
  type Exercise,
  type Lesson,
} from "../../src/features/learning/lessons";
import { useLearning } from "../../src/features/learning/provider";
import { Recording } from "../../src/features/speaking/recording";
import { CoachPanel } from "../../src/features/conversation/coach-panel";
import { useAuth } from "../../src/features/auth/provider";
import { speakEnglish, stopEnglish } from "../../src/features/speaking/speech";

function ExerciseView({
  exercise,
  onNext,
  last,
  saving,
  error,
}: {
  exercise: Exercise;
  onNext: (seconds: number) => void;
  last: boolean;
  saving: boolean;
  error: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const { session } = useAuth();
  const [coachId] = useState(randomUUID);
  const [showCoach, setShowCoach] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speechError, setSpeechError] = useState("");
  useEffect(
    () => () => {
      stopEnglish();
    },
    [],
  );
  async function listen(rate: number) {
    try {
      setSpeaking(true);
      setSpeechError("");
      speakEnglish(exercise.phrase, {
        slow: rate < 0.9,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => {
          setSpeaking(false);
          setSpeechError(
            "Não foi possível reproduzir a frase. Confira o áudio do aparelho e tente novamente.",
          );
        },
      });
    } catch {
      setSpeaking(false);
      setSpeechError("Não foi possível iniciar o áudio. Tente novamente.");
    }
  }
  return (
    <>
      <Card dark>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>
          01 · Escute
        </Text>
        <Text style={[styles.heading, { color: colors.white }]}>
          {revealed ? exercise.phrase : "Primeiro, deixe seu ouvido tentar."}
        </Text>
        <Button
          label={speaking ? "Repetir a frase" : "Ouvir a frase"}
          onPress={() => void listen(0.9)}
          disabled={recordingBusy || saving || showCoach}
        />
        <Button
          label="Ouvir mais devagar · 0,5×"
          onPress={() => void listen(0.65)}
          secondary
          disabled={recordingBusy || saving || showCoach}
        />
        {!revealed ? (
          <Button
            label="Revelar a frase"
            onPress={() => setRevealed(true)}
            secondary
          />
        ) : (
          <Text style={[styles.body, { color: "#DDE5DF" }]}>
            {exercise.translation}
          </Text>
        )}
      </Card>
      {speechError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {speechError}
        </Text>
      ) : null}
      <Text style={styles.small}>
        Se o áudio não tocar, confira o volume e o modo silencioso do aparelho.
      </Text>
      {revealed ? (
        <>
          <Card>
            <Text style={styles.eyebrow}>02 · Entenda e repita</Text>
            <Text style={styles.body}>{exercise.tip}</Text>
            <Recording
              label={exercise.phrase}
              onTake={setSeconds}
              onBusy={setRecordingBusy}
              disabled={showCoach}
            />
          </Card>
          <Card>
            <Text style={styles.eyebrow}>03 · Traga para sua vida</Text>
            <Text style={styles.body}>{exercise.challenge}</Text>
            <Text style={styles.small}>
              Compare sua gravação com a frase de referência. Esta prática é
              guiada, sem correção automática.
            </Text>
          </Card>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {session ? (
            <>
              <Button
                label={
                  showCoach ? "Fechar coach" : "Praticar esta frase com o coach"
                }
                secondary
                onPress={() => setShowCoach(!showCoach)}
              />
              {showCoach ? (
                <CoachPanel
                  context={{
                    mode: "drill",
                    topic: "practice",
                    reference: exercise.phrase,
                    conversationId: coachId,
                  }}
                />
              ) : null}
            </>
          ) : null}
          <Button
            label={last ? "Concluir e salvar treino" : "Próxima frase →"}
            disabled={seconds <= 0 || recordingBusy || showCoach}
            busy={saving}
            onPress={() => onNext(seconds)}
          />
          {seconds <= 0 ? (
            <Text style={styles.small}>
              Grave uma tentativa para continuar.
            </Text>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function LessonPractice({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { complete } = useLearning();
  const [index, setIndex] = useState(0);
  const [sessionId] = useState(randomUUID);
  const [acceptedSeconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const exercise = lesson.exercises[index];
  async function next(seconds: number) {
    if (saving || seconds <= 0) return;
    if (index < lesson.exercises.length - 1) {
      setSeconds((previous) => previous + seconds);
      setIndex((previous) => previous + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await complete({
        id: sessionId,
        lessonId: lesson.id,
        completedAt: new Date().toISOString(),
        repetitions: lesson.exercises.length,
        recordingSeconds: acceptedSeconds + seconds,
      });
      router.replace("/(tabs)/progress");
    } catch {
      setError(
        "Não foi possível salvar seu treino. Tente novamente; sua tentativa continua nesta tela.",
      );
      setSaving(false);
    }
  }
  return (
    <Screen>
      <Button
        label="← Sair do treino"
        onPress={() => router.replace("/(tabs)/practice")}
        secondary
        disabled={saving}
      />
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.eyebrow}>{lesson.title}</Text>
        <Text style={styles.small}>
          {index + 1} / {lesson.exercises.length}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: lesson.exercises.length,
          now: index,
        }}
        style={{ height: 5, borderRadius: 5, backgroundColor: colors.border }}
      >
        <View
          style={{
            height: 5,
            borderRadius: 5,
            width: `${(index / lesson.exercises.length) * 100}%`,
            backgroundColor: colors.ink,
          }}
        />
      </View>
      {exercise ? (
        <ExerciseView
          key={index}
          exercise={exercise}
          onNext={(seconds) => void next(seconds)}
          last={index === lesson.exercises.length - 1}
          saving={saving}
          error={error}
        />
      ) : null}
    </Screen>
  );
}

export default function LessonPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, state, storageError } = useLearning();
  const router = useRouter();
  if (!ready) return <Loading />;
  if (storageError) return <Redirect href="/" />;
  if (!state.settings) return <Redirect href="/onboarding" />;
  const lesson = findLesson(id);
  if (!lesson)
    return (
      <Screen>
        <Text style={styles.title}>Treino não encontrado.</Text>
        <Button
          label="Escolher outro treino"
          onPress={() => router.replace("/(tabs)/practice")}
        />
      </Screen>
    );
  return <LessonPractice key={lesson.id} lesson={lesson} />;
}
