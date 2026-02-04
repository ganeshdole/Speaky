import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MicrophoneSelector } from "../MicrophoneSelector";
import { LanguageSelector } from "../LanguageSelector";
import { ShortcutInput } from "../ShortcutInput";
import { SettingContainer } from "../../ui/SettingContainer";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { Select, type SelectOption } from "../../ui/Select";
import type { TranscriptionMode } from "@/bindings";
import { Input } from "../../ui/Input";
import { OutputDeviceSelector } from "../OutputDeviceSelector";
import { PushToTalk } from "../PushToTalk";
import { AudioFeedback } from "../AudioFeedback";
import { useSettings } from "../../../hooks/useSettings";
import { useModelStore } from "../../../stores/modelStore";
import { VolumeSlider } from "../VolumeSlider";
import { MuteWhileRecording } from "../MuteWhileRecording";

export const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    audioFeedbackEnabled,
    settings,
    updateSetting,
    setTranscriptionProvider,
    updateTranscriptionApiKey,
    updateTranscriptionModel,
    isUpdating,
  } = useSettings();
  const { currentModel, getModelInfo } = useModelStore();
  const currentModelInfo = getModelInfo(currentModel);
  const showLanguageSelector = currentModelInfo?.engine_type === "Whisper";
  const transcriptionMode = settings?.transcription_mode ?? "local";
  const transcriptionProviderId =
    settings?.transcription_provider_id ?? "groq";
  const transcriptionApiKey =
    settings?.transcription_api_keys?.[transcriptionProviderId] ?? "";
  const transcriptionModel =
    settings?.transcription_models?.[transcriptionProviderId] ??
    "whisper-large-v3-turbo";

  const transcriptionModeOptions: SelectOption[] = [
    { value: "local", label: t("settings.transcription.mode.options.local") },
    { value: "cloud", label: t("settings.transcription.mode.options.cloud") },
  ];

  const providerOptions: SelectOption[] = [
    { value: "groq", label: "Groq" },
  ];

  const modelOptions: SelectOption[] = [
    {
      value: "whisper-large-v3-turbo",
      label: "Whisper Large V3 Turbo",
    },
    {
      value: "whisper-large-v3",
      label: "Whisper Large V3",
    },
  ];
  const [localApiKey, setLocalApiKey] = useState(transcriptionApiKey);

  useEffect(() => {
    setLocalApiKey(transcriptionApiKey);
  }, [transcriptionApiKey]);

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
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
            options={transcriptionModeOptions}
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
                value={transcriptionProviderId}
                options={providerOptions}
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
                value={localApiKey}
                onChange={(event) => setLocalApiKey(event.target.value)}
                onBlur={() =>
                  void updateTranscriptionApiKey(
                    transcriptionProviderId,
                    localApiKey,
                  )
                }
                placeholder={t("settings.transcription.apiKey.placeholder")}
                disabled={isUpdating(
                  `transcription_api_key:${transcriptionProviderId}`,
                )}
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
                value={transcriptionModel}
                options={modelOptions}
                isClearable={false}
                onChange={(value) => {
                  if (!value) return;
                  void updateTranscriptionModel(
                    transcriptionProviderId,
                    value,
                  );
                }}
                className="min-w-[260px]"
              />
            </SettingContainer>
          </>
        )}
      </SettingsGroup>

      <SettingsGroup title={t("settings.general.title")}>
        <ShortcutInput shortcutId="transcribe" grouped={true} />
        {showLanguageSelector && (
          <LanguageSelector descriptionMode="tooltip" grouped={true} />
        )}
        <PushToTalk descriptionMode="tooltip" grouped={true} />
      </SettingsGroup>
      <SettingsGroup title={t("settings.sound.title")}>
        <MicrophoneSelector descriptionMode="tooltip" grouped={true} />
        <MuteWhileRecording descriptionMode="tooltip" grouped={true} />
        <AudioFeedback descriptionMode="tooltip" grouped={true} />
        <OutputDeviceSelector
          descriptionMode="tooltip"
          grouped={true}
          disabled={!audioFeedbackEnabled}
        />
        <VolumeSlider disabled={!audioFeedbackEnabled} />
      </SettingsGroup>
    </div>
  );
};
