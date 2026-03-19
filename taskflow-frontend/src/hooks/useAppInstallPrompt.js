import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const detectInstalledState = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return Boolean(
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator.standalone
    );
};

const detectPlatform = () => {
    if (typeof navigator === "undefined") {
        return "unknown";
    }

    const userAgent = navigator.userAgent || "";

    if (/Android/i.test(userAgent)) {
        return "android";
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return "ios";
    }

    if (/Mac|Win|Linux/i.test(userAgent)) {
        return "desktop";
    }

    return "unknown";
};

export const useAppInstallPrompt = () => {
    const deferredPromptRef = useRef(null);
    const [platform, setPlatform] = useState(detectPlatform);
    const [isInstalled, setIsInstalled] = useState(detectInstalledState);
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        setPlatform(detectPlatform());

        const displayModeMediaQuery = window.matchMedia?.("(display-mode: standalone)");

        const syncInstalledState = () => {
            setIsInstalled(detectInstalledState());
        };

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            deferredPromptRef.current = event;
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            deferredPromptRef.current = null;
            setCanInstall(false);
            setIsInstalling(false);
            setIsInstalled(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        displayModeMediaQuery?.addEventListener?.("change", syncInstalledState);

        syncInstalledState();

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
            displayModeMediaQuery?.removeEventListener?.("change", syncInstalledState);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPromptRef.current) {
            return {
                outcome: "unavailable"
            };
        }

        setIsInstalling(true);

        try {
            await deferredPromptRef.current.prompt();
            const choice = await deferredPromptRef.current.userChoice;

            deferredPromptRef.current = null;
            setCanInstall(false);

            if (choice?.outcome === "accepted") {
                setIsInstalled(true);
            }

            return choice || { outcome: "unknown" };
        } finally {
            setIsInstalling(false);
        }
    }, []);

    const installHint = useMemo(() => {
        if (isInstalled) {
            return "TaskFlow is already installed on this device.";
        }

        if (canInstall) {
            return "Install TaskFlow for a full-screen app experience and quicker access from your home screen.";
        }

        if (platform === "android" || platform === "desktop") {
            return "If the browser doesn't show the install button yet, open the browser menu and choose Install app.";
        }

        if (platform === "ios") {
            return "Open the browser share menu and choose Add to Home Screen.";
        }

        return "This browser may still let you install the app from its menu.";
    }, [canInstall, isInstalled, platform]);

    return {
        platform,
        isInstalled,
        canInstall,
        isInstalling,
        installApp,
        installHint
    };
};
