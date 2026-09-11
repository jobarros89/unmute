import { test } from "node:test";
import assert from "node:assert/strict";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import {
  database,
  clipsFor,
  saveClip,
  recordingStorageMessage,
  RecordingLimitError,
} from "../src/features/speaking/recording-storage.ts";

test("audio storage preserves bytes, MIME and owner isolation, including legacy recordings", async () => {
  globalThis.indexedDB = new IDBFactory();
  const clip = {
    id: "new",
    owner: "alice",
    date: "2026-09-11",
    label: "Practice",
    blob: new Blob([new Uint8Array([0, 255, 17, 42])], { type: "audio/mp4" }),
  };
  await saveClip(clip);
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").put({ ...clip, id: "legacy" });
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
  db.close();
  assert.deepEqual(await clipsFor("bob"), []);
  const rows = await clipsFor("alice");
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.equal(row.blob.type, "audio/mp4");
    assert.deepEqual(
      new Uint8Array(await row.blob.arrayBuffer()),
      new Uint8Array([0, 255, 17, 42]),
    );
  }
});

test("concurrent saves enforce 20 per owner without overwriting saved audio", async () => {
  globalThis.indexedDB = new IDBFactory();
  const results = await Promise.allSettled(
    Array.from({ length: 21 }, (_, i) =>
      saveClip({
        id: String(i),
        owner: "alice",
        date: "2026-09-11",
        label: "Practice",
        blob: new Blob(["audio"]),
      }),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 20);
  const failure = results.find((r) => r.status === "rejected");
  assert.ok(
    failure?.status === "rejected" &&
      failure.reason instanceof RecordingLimitError,
  );
  assert.equal((await clipsFor("alice")).length, 20);
  await saveClip({
    id: "bob",
    owner: "bob",
    date: "2026-09-11",
    label: "Practice",
    blob: new Blob(["audio"]),
  });
  assert.equal((await clipsFor("bob")).length, 1);
});

test("a synchronous storage failure rejects without claiming the recording limit was reached", async () => {
  globalThis.indexedDB = new IDBFactory();
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = () => {
    throw new DOMException("No space", "QuotaExceededError");
  };
  try {
    await assert.rejects(
      saveClip({
        id: "failure",
        owner: "alice",
        date: "2026-09-11",
        label: "Practice",
        blob: new Blob(["audio"]),
      }),
      { name: "QuotaExceededError" },
    );
    assert.equal((await clipsFor("alice")).length, 0);
    assert.match(
      recordingStorageMessage(
        new DOMException("No space", "QuotaExceededError"),
      ),
      /sem espaço/,
    );
    assert.doesNotMatch(
      recordingStorageMessage(new DOMException("Denied", "SecurityError")),
      /20 gravações/,
    );
  } finally {
    IDBObjectStore.prototype.put = original;
  }
});
