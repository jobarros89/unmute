import test from "node:test";
import assert from "node:assert/strict";
import { speakEnglish } from "../src/features/speaking/speech.web.ts";

test("Slow speech interrupts the old utterance without losing the new completion callback", () => {
  const utterances: any[] = [];
  const events: string[] = [];
  class Utterance {
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  }
  Object.assign(globalThis, {
    SpeechSynthesisUtterance: Utterance,
    window: {
      SpeechSynthesisUtterance: Utterance,
      speechSynthesis: {
        cancel: () => events.push("cancel"),
        resume: () => {},
        getVoices: () => [{ lang: "en-US", localService: true }],
        speak: (value: unknown) => utterances.push(value),
      },
    },
  });
  let completed = 0;
  speakEnglish("First sentence", { onDone: () => completed++ });
  speakEnglish("First sentence", { slow: true, onDone: () => completed++ });
  assert.equal(utterances[0].rate, 1);
  assert.equal(utterances[1].rate, 0.5);
  utterances[0].onend();
  assert.equal(completed, 0);
  utterances[1].onend();
  assert.equal(completed, 1);
  assert.equal(events.length, 2);
});
