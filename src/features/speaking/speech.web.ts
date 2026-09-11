import type { SpeakOptions } from "./speech";

let current: SpeechSynthesisUtterance | null = null;
export function stopEnglish() {
  current = null;
  window.speechSynthesis?.cancel();
}
export function speakEnglish(text: string, options: SpeakOptions = {}) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    options.onError?.();
    return;
  }
  stopEnglish();
  const utterance = new SpeechSynthesisUtterance(text);
  current = utterance;
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => v.lang.startsWith("en") && v.localService) ??
    voices.find((v) => v.lang.startsWith("en"));
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = options.slow ? 0.5 : 1;
  utterance.onend = () => {
    if (current === utterance) {
      current = null;
      options.onDone?.();
    }
  };
  utterance.onerror = (event) => {
    if (current !== utterance) return;
    current = null;
    if (event.error === "canceled" || event.error === "interrupted")
      options.onStopped?.();
    else options.onError?.();
  };
  // Start in the click handler to preserve browser playback permission.
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}
