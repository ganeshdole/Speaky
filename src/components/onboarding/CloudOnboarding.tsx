import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import HandyTextLogo from "../icons/HandyTextLogo";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select, type SelectOption } from "../ui/Select";
import { useSettings } from "../../hooks/useSettings";

interface CloudOnboardingProps {
  onComplete: () => void;
  onBack: () => void;
}

const GROQ_PROVIDER_ID = "groq";

const CloudOnboarding: React.FC<CloudOnboardingProps> = ({
  onComplete,
  onBack,
}) => {
  const { t } = useTranslation();
  const {
    settings,
    updateSetting,
    setTranscriptionProvider,
    updateTranscriptionApiKey,
    updateTranscriptionModel,
  } = useSettings();
  const [providerId, setProviderId] = useState(GROQ_PROVIDER_ID);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("whisper-large-v3-turbo");
  const [error, setError] = useState<string | null>(null);

  const providerOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: GROQ_PROVIDER_ID,
        label: "Groq",
      },
    ],
    [],
  );

  const modelOptions = useMemo<SelectOption[]>(
    () => [
      { value: "whisper-large-v3-turbo", label: "Whisper Large V3 Turbo" },
      { value: "whisper-large-v3", label: "Whisper Large V3" },
    ],
    [],
  );

  useEffect(() => {
    const selectedProvider =
      settings?.transcription_provider_id ?? GROQ_PROVIDER_ID;
    const savedApiKey =
      settings?.transcription_api_keys?.[selectedProvider] ?? "";
    const savedModel =
      settings?.transcription_models?.[selectedProvider] ??
      "whisper-large-v3-turbo";
    setProviderId(selectedProvider);
    setApiKey(savedApiKey);
    setModel(savedModel);
  }, [settings]);

  const handleContinue = async () => {
    setError(null);
    if (!apiKey.trim()) {
      setError(t("onboarding.cloud.errors.missingApiKey"));
      return;
    }
    if (!model.trim()) {
      setError(t("onboarding.cloud.errors.missingModel"));
      return;
    }

    await updateSetting("transcription_mode", "cloud");
    await setTranscriptionProvider(providerId);
    await updateTranscriptionApiKey(providerId, apiKey.trim());
    await updateTranscriptionModel(providerId, model.trim());
    onComplete();
  };

  return (
    <div className="h-screen w-screen flex flex-col p-6 gap-6 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <HandyTextLogo width={200} />
        <h2 className="text-xl font-semibold text-text">
          {t("onboarding.cloud.title")}
        </h2>
        <p className="text-text/70 max-w-md text-center">
          {t("onboarding.cloud.subtitle")}
        </p>
      </div>

      <div className="max-w-lg w-full flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-background border border-mid-gray/20 rounded-lg p-4 flex flex-col gap-3">
          <label className="text-sm font-medium text-text">
            {t("onboarding.cloud.provider")}
          </label>
          <Select
            value={providerId}
            options={providerOptions}
            onChange={(value) => {
              if (value) setProviderId(value);
            }}
            isClearable={false}
          />

          <label className="text-sm font-medium text-text">
            {t("onboarding.cloud.apiKey")}
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={t("onboarding.cloud.apiKeyPlaceholder")}
          />

          <label className="text-sm font-medium text-text">
            {t("onboarding.cloud.model")}
          </label>
          <Select
            value={model}
            options={modelOptions}
            onChange={(value) => {
              if (value) setModel(value);
            }}
            isClearable={false}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            {t("onboarding.cloud.back")}
          </Button>
          <Button onClick={handleContinue}>
            {t("onboarding.cloud.continue")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CloudOnboarding;
