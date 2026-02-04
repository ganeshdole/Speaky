import { useEffect, useState, useRef } from "react";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import { platform } from "@tauri-apps/plugin-os";
import {
  checkAccessibilityPermission,
  checkMicrophonePermission,
} from "tauri-plugin-macos-permissions-api";
import "./App.css";
import AccessibilityPermissions from "./components/AccessibilityPermissions";
import Footer from "./components/footer";
import Onboarding, {
  AccessibilityOnboarding,
  CloudOnboarding,
  TranscriptionModeOnboarding,
} from "./components/onboarding";
import { Sidebar, SidebarSection, SECTIONS_CONFIG } from "./components/Sidebar";
import { useSettings } from "./hooks/useSettings";
import { useSettingsStore } from "./stores/settingsStore";
import { commands } from "@/bindings";
import { getLanguageDirection, initializeRTL } from "@/lib/utils/rtl";

type OnboardingStep = "accessibility" | "mode" | "model" | "cloud" | "done";

const renderSettingsContent = (section: SidebarSection) => {
  const ActiveComponent =
    SECTIONS_CONFIG[section]?.component || SECTIONS_CONFIG.general.component;
  return <ActiveComponent />;
};

function App() {
  const { i18n } = useTranslation();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep | null>(
    null,
  );
  const [postAccessibilityStep, setPostAccessibilityStep] =
    useState<OnboardingStep>("mode");
  const [currentSection, setCurrentSection] =
    useState<SidebarSection>("general");
  const { settings, updateSetting } = useSettings();
  const direction = getLanguageDirection(i18n.language);
  const refreshAudioDevices = useSettingsStore(
    (state) => state.refreshAudioDevices,
  );
  const refreshOutputDevices = useSettingsStore(
    (state) => state.refreshOutputDevices,
  );
  const hasCompletedPostOnboardingInit = useRef(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Initialize RTL direction when language changes
  useEffect(() => {
    initializeRTL(i18n.language);
  }, [i18n.language]);

  // Initialize Enigo, shortcuts, and refresh audio devices when main app loads
  useEffect(() => {
    if (onboardingStep === "done" && !hasCompletedPostOnboardingInit.current) {
      hasCompletedPostOnboardingInit.current = true;
      Promise.all([
        commands.initializeEnigo(),
        commands.initializeShortcuts(),
      ]).catch((e) => {
        console.warn("Failed to initialize:", e);
      });
      refreshAudioDevices();
      refreshOutputDevices();
    }
  }, [onboardingStep, refreshAudioDevices, refreshOutputDevices]);

  // Handle keyboard shortcuts for debug mode toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+D (Windows/Linux) or Cmd+Shift+D (macOS)
      const isDebugShortcut =
        event.shiftKey &&
        event.key.toLowerCase() === "d" &&
        (event.ctrlKey || event.metaKey);

      if (isDebugShortcut) {
        event.preventDefault();
        const currentDebugMode = settings?.debug_mode ?? false;
        updateSetting("debug_mode", !currentDebugMode);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settings?.debug_mode, updateSetting]);

  const checkOnboardingStatus = async () => {
    try {
      const settingsResult = await commands.getAppSettings();
      const settingsData =
        settingsResult.status === "ok" ? settingsResult.data : null;
      const transcriptionMode =
        settingsData?.transcription_mode ?? "local";
      const providerId =
        settingsData?.transcription_provider_id ?? "groq";
      const apiKey =
        settingsData?.transcription_api_keys?.[providerId] ?? "";
      const model =
        settingsData?.transcription_models?.[providerId] ?? "";

      const cloudReady =
        transcriptionMode === "cloud" &&
        apiKey.trim().length > 0 &&
        model.trim().length > 0;

      // Check if they have any models available
      const result = await commands.hasAnyModelsAvailable();
      const hasModels = result.status === "ok" && result.data;
      const returningReady =
        transcriptionMode === "cloud" ? cloudReady : hasModels;
      const nextStep: OnboardingStep = returningReady ? "done" : "mode";

      // Returning user - but check if they need to grant permissions on macOS
      if (platform() === "macos") {
        try {
          const [hasAccessibility, hasMicrophone] = await Promise.all([
            checkAccessibilityPermission(),
            checkMicrophonePermission(),
          ]);
          if (!hasAccessibility || !hasMicrophone) {
            // Missing permissions - show accessibility onboarding
            setPostAccessibilityStep(nextStep);
            setOnboardingStep("accessibility");
            return;
          }
        } catch (e) {
          console.warn("Failed to check permissions:", e);
          // If we can't check, proceed to main app and let them fix it there
        }
      }

      setOnboardingStep(nextStep);
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setPostAccessibilityStep("mode");
      setOnboardingStep("accessibility");
    }
  };

  const handleAccessibilityComplete = () => {
    setOnboardingStep(postAccessibilityStep);
  };

  const handleModelSelected = () => {
    // Transition to main app - user has started a download
    setOnboardingStep("done");
  };

  const handleSelectLocal = async () => {
    await updateSetting("transcription_mode", "local");
    setOnboardingStep("model");
  };

  const handleSelectCloud = async () => {
    await updateSetting("transcription_mode", "cloud");
    setOnboardingStep("cloud");
  };

  // Still checking onboarding status
  if (onboardingStep === null) {
    return null;
  }

  if (onboardingStep === "accessibility") {
    return <AccessibilityOnboarding onComplete={handleAccessibilityComplete} />;
  }

  if (onboardingStep === "model") {
    return (
      <Onboarding
        onModelSelected={handleModelSelected}
        onUseCloud={handleSelectCloud}
      />
    );
  }

  if (onboardingStep === "mode") {
    return (
      <TranscriptionModeOnboarding
        onSelectLocal={handleSelectLocal}
        onSelectCloud={handleSelectCloud}
      />
    );
  }

  if (onboardingStep === "cloud") {
    return (
      <CloudOnboarding
        onComplete={handleModelSelected}
        onBack={() => setOnboardingStep("mode")}
      />
    );
  }

  return (
    <div
      dir={direction}
      className="h-screen flex flex-col select-none cursor-default"
    >
      <Toaster
        theme="system"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "bg-background border border-mid-gray/20 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 text-sm",
            title: "font-medium",
            description: "text-mid-gray",
          },
        }}
      />
      {/* Main content area that takes remaining space */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeSection={currentSection}
          onSectionChange={setCurrentSection}
        />
        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center p-4 gap-4">
              <AccessibilityPermissions />
              {renderSettingsContent(currentSection)}
            </div>
          </div>
        </div>
      </div>
      {/* Fixed footer at bottom */}
      <Footer />
    </div>
  );
}

export default App;
