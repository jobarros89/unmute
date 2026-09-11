import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Text } from "react-native";
import { Button, Card, styles } from "../../components/ui";
import { useAuth } from "../auth/provider";
import { stopEnglish } from "./speech";

import {
  type Clip,
  database,
  clipsFor,
  saveClip,
  recordingStorageMessage,
} from "./recording-storage";

export function AudioReview({
  uri,
  label = "Minha tentativa",
}: {
  uri: string;
  label?: string;
}) {
  const { session } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(false);
    setMessage("");
  }, [uri]);
  return (
    <>
      <audio
        key={uri}
        controls
        preload="metadata"
        src={uri}
        aria-label="Ouvir minha gravação"
        style={{ width: "100%" }}
        onPlay={(event) => {
          stopEnglish();
          document.querySelectorAll("audio").forEach((audio) => {
            if (audio !== event.currentTarget) audio.pause();
          });
        }}
        onError={() =>
          setMessage(
            "Não foi possível abrir este áudio. Baixe a gravação ou grave novamente.",
          )
        }
      />
      <a
        href={uri}
        download="unmute-gravacao"
        style={{ color: "#17332e", fontSize: 16 }}
      >
        Baixar minha gravação
      </a>
      {session && (
        <Button
          label={
            saved
              ? "Gravação salva neste navegador"
              : "Salvar para revisar depois"
          }
          secondary
          disabled={saved || busy}
          onPress={() => {
            setBusy(true);
            setMessage("");
            void fetch(uri)
              .then((r) => r.blob())
              .then((blob) => {
                if (!blob.size || blob.size > 4 * 1024 * 1024)
                  throw new Error("Gravação vazia ou maior que 4 MB.");
                return saveClip({
                  id: crypto.randomUUID(),
                  owner: session.user.id,
                  date: new Date().toISOString(),
                  label,
                  blob,
                });
              })
              .then(() => setSaved(true))
              .catch((e) => setMessage(recordingStorageMessage(e)))
              .finally(() => setBusy(false));
          }}
        />
      )}
      {message && (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      )}
    </>
  );
}
function SavedClip({ clip, onDelete }: { clip: Clip; onDelete: () => void }) {
  const [uri, setUri] = useState("");
  useEffect(() => {
    const value = URL.createObjectURL(clip.blob);
    setUri(value);
    return () => URL.revokeObjectURL(value);
  }, [clip.blob]);
  return (
    <Card>
      <Text style={styles.heading}>{clip.label}</Text>
      <Text style={styles.small}>
        {new Date(clip.date).toLocaleString("pt-BR")}
      </Text>
      <audio
        controls
        src={uri}
        aria-label="Revisar gravação salva"
        style={{ width: "100%" }}
        onPlay={() => stopEnglish()}
      />
      <a href={uri} download="unmute-gravacao">
        Baixar gravação
      </a>
      <Button label="Excluir esta gravação" secondary onPress={onDelete} />
    </Card>
  );
}
export function SavedRecordings() {
  const { session } = useAuth();
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState("");
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setClips([]);
      setError("");
      if (session)
        void clipsFor(session.user.id)
          .then((rows) => {
            if (active)
              setClips(rows.sort((a, b) => b.date.localeCompare(a.date)));
          })
          .catch(() => {
            if (active)
              setError("Não foi possível abrir as gravações deste navegador.");
          });
      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );
  return (
    <>
      <Text style={styles.heading}>Minhas gravações</Text>
      <Text style={styles.small}>
        Até 20 gravações salvas por conta neste navegador. Elas não sincronizam
        entre aparelhos e podem ser removidas ao limpar os dados do navegador.
        Baixe as que quiser manter.
      </Text>
      {!clips.length && (
        <Text style={styles.body}>
          Após gravar, escolha Salvar para revisar depois.
        </Text>
      )}
      {clips.map((clip) => (
        <SavedClip
          key={clip.id}
          clip={clip}
          onDelete={() => {
            if (!window.confirm("Excluir esta gravação deste navegador?"))
              return;
            void database()
              .then(
                (db) =>
                  new Promise<void>((resolve, reject) => {
                    const tx = db.transaction("clips", "readwrite");
                    tx.objectStore("clips").delete(clip.id);
                    tx.oncomplete = () => {
                      db.close();
                      resolve();
                    };
                    tx.onerror = () => {
                      db.close();
                      reject(tx.error);
                    };
                  }),
              )
              .then(() =>
                setClips((rows) => rows.filter((row) => row.id !== clip.id)),
              )
              .catch(() => setError("Não foi possível excluir a gravação."));
          }}
        />
      ))}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </>
  );
}
