export type Clip = {
  id: string;
  owner: string;
  date: string;
  label: string;
  blob: Blob;
};
type StoredClip = Omit<Clip, "blob"> & { data: ArrayBuffer; mime: string };
export class RecordingLimitError extends Error {}
export function recordingStorageMessage(error: unknown): string {
  if (error instanceof RecordingLimitError)
    return "Você já tem 20 gravações salvas. Exclua uma em Meu progresso para salvar outra.";
  if (error instanceof Error && error.name === "QuotaExceededError")
    return "O navegador está sem espaço para salvar. Baixe esta gravação antes de liberar espaço.";
  return "Este navegador não conseguiu salvar a gravação. Você ainda pode ouvi-la e baixá-la nesta tela. Tente abrir o app diretamente no Safari ou Chrome. Não limpe os dados do navegador: isso apaga gravações anteriores.";
}
export async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("unmute-recordings", 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore("clips", {
        keyPath: "id",
      });
      store.createIndex("owner", "owner");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function clipsFor(owner: string): Promise<Clip[]> {
  const db = await database();
  try {
    const rows = await new Promise<(StoredClip | Clip)[]>((resolve, reject) => {
      const request = db
        .transaction("clips")
        .objectStore("clips")
        .index("owner")
        .getAll(owner);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return rows.map((row) =>
      "blob" in row
        ? row
        : {
            id: row.id,
            owner: row.owner,
            date: row.date,
            label: row.label,
            blob: new Blob([row.data], { type: row.mime }),
          },
    );
  } finally {
    db.close();
  }
}
export async function saveClip(clip: Clip) {
  // Convert before opening the transaction; awaiting inside it can make it inactive.
  const { blob, ...metadata } = clip;
  const stored: StoredClip = {
    ...metadata,
    data: await blob.arrayBuffer(),
    mime: blob.type,
  };
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("clips", "readwrite");
      const store = tx.objectStore("clips");
      let failure: unknown;
      const count = store.index("owner").count(clip.owner);
      count.onsuccess = () => {
        if (count.result >= 20) {
          failure = new RecordingLimitError();
          tx.abort();
          return;
        }
        try {
          store.put(stored);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(failure ?? tx.error ?? new Error("Storage transaction aborted"));
    });
  } finally {
    db.close();
  }
}
