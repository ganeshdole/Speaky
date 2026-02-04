import React from "react";
import { useTranslation } from "react-i18next";
import HandyTextLogo from "../icons/HandyTextLogo";
import { Button } from "../ui/Button";

interface TranscriptionModeOnboardingProps {
  onSelectLocal: () => void;
  onSelectCloud: () => void;
}

const TranscriptionModeOnboarding: React.FC<TranscriptionModeOnboardingProps> = ({
  onSelectLocal,
  onSelectCloud,
}) => {
  const { t } = useTranslation();

  return (
    <div className="h-screen w-screen flex flex-col p-6 gap-6 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <HandyTextLogo width={200} />
        <h2 className="text-xl font-semibold text-text">
          {t("onboarding.mode.title")}
        </h2>
        <p className="text-text/70 max-w-md text-center">
          {t("onboarding.mode.subtitle")}
        </p>
      </div>

      <div className="max-w-xl w-full flex flex-col gap-4">
        <div className="bg-background border border-mid-gray/20 rounded-lg p-4 flex flex-col gap-2">
          <h3 className="text-base font-medium text-text">
            {t("onboarding.mode.local.title")}
          </h3>
          <p className="text-sm text-text/70">
            {t("onboarding.mode.local.description")}
          </p>
          <div className="pt-2">
            <Button onClick={onSelectLocal}>
              {t("onboarding.mode.local.cta")}
            </Button>
          </div>
        </div>

        <div className="bg-background border border-mid-gray/20 rounded-lg p-4 flex flex-col gap-2">
          <h3 className="text-base font-medium text-text">
            {t("onboarding.mode.cloud.title")}
          </h3>
          <p className="text-sm text-text/70">
            {t("onboarding.mode.cloud.description")}
          </p>
          <div className="pt-2">
            <Button variant="secondary" onClick={onSelectCloud}>
              {t("onboarding.mode.cloud.cta")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionModeOnboarding;
