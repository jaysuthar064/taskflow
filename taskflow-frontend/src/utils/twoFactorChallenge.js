const STORAGE_KEY = "taskflow.pendingTwoFactorChallenge";

export const savePendingTwoFactorChallenge = (challenge) => {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
    } catch (error) {
        console.error("Unable to store pending two-factor challenge", error);
    }
};

export const getPendingTwoFactorChallenge = () => {
    try {
        const storedValue = sessionStorage.getItem(STORAGE_KEY);
        return storedValue ? JSON.parse(storedValue) : null;
    } catch (error) {
        console.error("Unable to read pending two-factor challenge", error);
        return null;
    }
};

export const clearPendingTwoFactorChallenge = () => {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Unable to clear pending two-factor challenge", error);
    }
};
