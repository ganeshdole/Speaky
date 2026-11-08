import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TranscriptionMode } from "@/bindings";
import { SettingContainer } from "../../ui/SettingContainer";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { Select, type SelectOption } from "../../ui/Select";
import { Input } from "../../ui/Input";
import { TranslateToEnglish } from "../TranslateToEnglish";
import { useSettings } from "../../../hooks/useSettings";
import {
  CLOUD_MODEL_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
  cloudConfig,
} from "@/lib/cloudTranscription";

/** Local or cloud transcription, and the cloud provider's key and model. */
export const TranscriptionModeSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    updateSetting,
    setTranscriptionProvider,
    updateTranscriptionApiKey,
    updateTranscriptionModel,
    isUpdating,
  } = useSettings();
  const transcriptionMode = settings?.transcription_mode ?? "local";
  const { providerId, apiKey: savedApiKey, model } = cloudConfig(settings);
  const [apiKey, setApiKey] = useState(savedApiKey);

  useEffect(() => {
    setApiKey(savedApiKey);
  }, [savedApiKey]);

  const modeOptions: SelectOption[] = [
    { value: "local", label: t("settings.transcription.mode.options.local") },
    { value: "cloud", label: t("settings.transcription.mode.options.cloud") },
  ];

  return (
    <SettingsGroup title={t("settings.transcription.title")}>
      <SettingContainer
        title={t("settings.transcription.mode.title")}
        description={t("settings.transcription.mode.description")}
        descriptionMode="tooltip"
        grouped={true}
        layout="horizontal"
      >
        <Select
          value={transcriptionMode}
          options={modeOptions}
          isClearable={false}
          onChange={(value) => {
            if (!value) return;
            void updateSetting(
              "transcription_mode",
              value as TranscriptionMode,
            );
          }}
          className="min-w-[220px]"
        />
      </SettingContainer>

      {transcriptionMode === "cloud" && (
        <>
          <SettingContainer
            title={t("settings.transcription.provider.title")}
            description={t("settings.transcription.provider.description")}
            descriptionMode="tooltip"
            grouped={true}
            layout="horizontal"
          >
            <Select
              value={providerId}
              options={CLOUD_PROVIDER_OPTIONS}
              isClearable={false}
              onChange={(value) => {
                if (!value) return;
                void setTranscriptionProvider(value);
              }}
              className="min-w-[220px]"
            />
          </SettingContainer>

          <SettingContainer
            title={t("settings.transcription.apiKey.title")}
            description={t("settings.transcription.apiKey.description")}
            descriptionMode="tooltip"
            grouped={true}
            layout="horizontal"
          >
            <Input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              onBlur={() => {
                const trimmed = apiKey.trim();
                if (trimmed !== savedApiKey)
                  void updateTranscriptionApiKey(providerId, trimmed);
              }}
              placeholder={t("settings.transcription.apiKey.placeholder")}
              disabled={isUpdating(`transcription_api_key:${providerId}`)}
              className="min-w-[320px]"
            />
          </SettingContainer>

          <SettingContainer
            title={t("settings.transcription.model.title")}
            description={t("settings.transcription.model.description")}
            descriptionMode="tooltip"
            grouped={true}
            layout="horizontal"
          >
            <Select
              value={model}
              options={CLOUD_MODEL_OPTIONS}
              isClearable={false}
              onChange={(value) => {
                if (!value) return;
                void updateTranscriptionModel(providerId, value);
              }}
              className="min-w-[260px]"
            />
          </SettingContainer>

          {/* The local model card (and its toggle) is hidden in cloud mode. */}
          <TranslateToEnglish descriptionMode="tooltip" grouped={true} />
        </>
      )}
    </SettingsGroup>
  );
};
