import type { AppSettings } from "@/bindings";

/** The built-in cloud speech-to-text provider (see settings.rs). */
export const GROQ_PROVIDER_ID = "groq";
export const GROQ_DEFAULT_MODEL = "whisper-large-v3-turbo";

/** Provider names are brand names, so they aren't translated. */
export const CLOUD_PROVIDER_OPTIONS = [
  { value: GROQ_PROVIDER_ID, label: "Groq" },
];

export const CLOUD_MODEL_OPTIONS = [
  { value: "whisper-large-v3-turbo", label: "Whisper Large V3 Turbo" },
  { value: "whisper-large-v3", label: "Whisper Large V3" },
];

/** The saved cloud provider, key and model, with defaults filled in. */
export const cloudConfig = (settings: AppSettings | null | undefined) => {
  const providerId = settings?.transcription_provider_id ?? GROQ_PROVIDER_ID;
  return {
    providerId,
    apiKey: settings?.transcription_api_keys?.[providerId] ?? "",
    model: settings?.transcription_models?.[providerId] || GROQ_DEFAULT_MODEL,
  };
};

/** What Try it and All set call the "model" when transcribing in the cloud. */
export const cloudModelName = (settings: AppSettings | null | undefined) => {
  const { providerId, model } = cloudConfig(settings);
  const provider =
    CLOUD_PROVIDER_OPTIONS.find((p) => p.value === providerId)?.label ??
    providerId;
  const modelLabel =
    CLOUD_MODEL_OPTIONS.find((m) => m.value === model)?.label ?? model;
  return `${provider} · ${modelLabel}`;
};
