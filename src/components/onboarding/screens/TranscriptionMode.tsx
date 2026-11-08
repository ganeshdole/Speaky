import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button";
import { Radio } from "../../ui/Radio";
import { OnboardingShell, ScreenHeader, ScreenMain } from "../OnboardingShell";
import type { OnboardingMode } from "../onboardingStore";

interface TranscriptionModeProps {
  progress?: { index: number; count: number };
  mode: OnboardingMode;
  onChange: (mode: OnboardingMode) => void;
  onBack?: () => void;
  onContinue: () => void;
}

const MODES: OnboardingMode[] = ["local", "cloud"];

/** Before Model: transcribe on this computer, or with a cloud provider. */
export const TranscriptionMode: React.FC<TranscriptionModeProps> = ({
  progress,
  mode,
  onChange,
  onBack,
  onContinue,
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingShell
      progress={progress}
      onBack={onBack}
      primary={
        <Button variant="primary" size="lg" onClick={onContinue}>
          {t(`onboarding.mode.${mode}.cta`)}
        </Button>
      }
    >
      <ScreenMain
        align="stretch"
        header={
          <ScreenHeader
            title={t("onboarding.mode.title")}
            sub={t("onboarding.mode.subtitle")}
          />
        }
      >
        <div
          role="radiogroup"
          aria-label={t("onboarding.mode.title")}
          className="flex w-full flex-col gap-[8px] text-start"
        >
          {MODES.map((m) => {
            const on = m === mode;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(m)}
                onDoubleClick={() => {
                  onChange(m);
                  onContinue();
                }}
                className={`flex cursor-pointer items-start gap-[14px] rounded-card border-[1.5px] px-[20px] py-[16px] text-start transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-logo-primary ${
                  on
                    ? "border-control-on bg-wash"
                    : "border-line-strong hover:bg-wash"
                }`}
              >
                <Radio checked={on} className="mt-[3px]" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold text-text">
                    {t(`onboarding.mode.${m}.title`)}
                  </span>
                  <span className="text-small text-ink-2">
                    {t(`onboarding.mode.${m}.description`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </ScreenMain>
    </OnboardingShell>
  );
};
