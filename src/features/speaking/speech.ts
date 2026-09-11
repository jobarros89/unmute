import * as Speech from "expo-speech";

export type SpeakOptions = {
  slow?: boolean;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: () => void;
};
export function stopEnglish() {
  void Speech.stop();
}
export function speakEnglish(text: string, options: SpeakOptions = {}) {
  void Speech.stop()
    .then(() =>
      Speech.speak(text, {
        language: "en-US",
        rate: options.slow ? 0.5 : 0.9,
        onDone: options.onDone,
        onStopped: options.onStopped,
        onError: options.onError,
      }),
    )
    .catch(() => options.onError?.());
}
