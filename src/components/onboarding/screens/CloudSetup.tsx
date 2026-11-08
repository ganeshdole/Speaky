import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { useSettings } from "@/hooks/useSettings";
import {
  CLOUD_MODEL_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
  cloudConfig,
} from "@/lib/cloudTranscription";
import { OnboardingShell, ScreenHeader, ScreenMain } from "../OnboardingShell";

interface CloudSetupProps {
  progress?: { index: number; count: number };
  /** Debug preview: nothing is saved. */
  preview: boolean;
  onBack?: () => void;
  onContinue: () => void;
}

/** In place of Model for cloud mode: the provider, its API key and model. */
export const CloudSetup: React.FC<CloudSetupProps> = ({
  progress,
  preview,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation();
  const {
    settings,
    updateSetting,
    setTranscriptionProvider,
    updateTranscriptionApiKey,
    updateTranscriptionModel,
  } = useSettings();
  const saved = cloudConfig(settings);
  const [providerId, setProviderId] = useState(saved.providerId);
  const [apiKey, setApiKey] = useState(saved.apiKey);
  const [model, setModel] = useState(saved.model);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fill in what's saved once settings load (a relaunch mid-onboarding).
  useEffect(() => {
    setProviderId(saved.providerId);
    setApiKey((current) => current || saved.apiKey);
    setModel(saved.model);
  }, [saved.providerId, saved.apiKey, saved.model]);

  const handleContinue = async () => {
    setError(null);
    const key = apiKey.trim();
    if (!key) {
      setError(t("onboarding.cloud.errors.missingApiKey"));
      return;
    }
    if (!model.trim()) {
      setError(t("onboarding.cloud.errors.missingModel"));
      return;
    }
    if (!preview) {
      setSaving(true);
      try {
        await updateSetting("transcription_mode", "cloud");
        await setTranscriptionProvider(providerId);
        await updateTranscriptionApiKey(providerId, key);
        await updateTranscriptionModel(providerId, model.trim());
      } finally {
        setSaving(false);
      }
    }
    onContinue();
  };

  const label = "text-small font-semibold text-text";

  return (
    <OnboardingShell
      progress={progress}
      onBack={onBack}
      hint={error ?? ""}
      hintTone={error ? "warning" : "quiet"}
      primary={
        <Button
          variant="primary"
          size="lg"
          disabled={saving}
          onClick={handleContinue}
        >
          {t("onboarding.cloud.continue")}
        </Button>
      }
    >
      <ScreenMain
        align="stretch"
        header={
          <ScreenHeader
            title={t("onboarding.cloud.title")}
            sub={t("onboarding.cloud.subtitle")}
          />
        }
      >
        <div className="flex w-full flex-col gap-[10px] rounded-panel border border-line-strong px-[22px] py-[18px] text-start">
          <label className={label} htmlFor="cloud-provider">
            {t("onboarding.cloud.provider")}
          </label>
          <Select
            value={providerId}
            options={CLOUD_PROVIDER_OPTIONS}
            onChange={(value) => {
              if (value) setProviderId(value);
            }}
            isClearable={false}
          />

          <label className={label} htmlFor="cloud-api-key">
            {t("onboarding.cloud.apiKey")}
          </label>
          <Input
            id="cloud-api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleContinue();
            }}
            placeholder={t("onboarding.cloud.apiKeyPlaceholder")}
          />

          <label className={label} htmlFor="cloud-model">
            {t("onboarding.cloud.model")}
          </label>
          <Select
            value={model}
            options={CLOUD_MODEL_OPTIONS}
            onChange={(value) => {
              if (value) setModel(value);
            }}
            isClearable={false}
          />
        </div>
      </ScreenMain>
    </OnboardingShell>
  );
};
