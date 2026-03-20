const BROWSER_MATCHERS = [
    { pattern: /Edg\/([\d.]+)/i, name: "Microsoft Edge" },
    { pattern: /OPR\/([\d.]+)/i, name: "Opera" },
    { pattern: /Chrome\/([\d.]+)/i, name: "Chrome" },
    { pattern: /Firefox\/([\d.]+)/i, name: "Firefox" },
    { pattern: /Version\/([\d.]+).*Safari/i, name: "Safari" }
];

const OS_MATCHERS = [
    { pattern: /Windows NT/i, name: "Windows" },
    { pattern: /Android/i, name: "Android" },
    { pattern: /iPhone|iPad|iPod/i, name: "iOS" },
    { pattern: /Mac OS X/i, name: "macOS" },
    { pattern: /Linux/i, name: "Linux" }
];

const normalizeIpAddress = (ipAddress = "") => ipAddress.replace(/^::ffff:/, "");

export const parseUserAgent = (userAgent = "") => {
    const browser = BROWSER_MATCHERS.find(({ pattern }) => pattern.test(userAgent))?.name || "Unknown Browser";
    const os = OS_MATCHERS.find(({ pattern }) => pattern.test(userAgent))?.name || "Unknown OS";
    const deviceType = /iPad|Tablet/i.test(userAgent)
        ? "Tablet"
        : /Android|iPhone|Mobile/i.test(userAgent)
            ? "Mobile"
            : "Desktop";

    return {
        browser,
        os,
        deviceType,
        deviceLabel: `${browser} on ${os}`
    };
};

export const getClientIp = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
        return normalizeIpAddress(forwardedFor.split(",")[0].trim());
    }

    return normalizeIpAddress(req.ip || req.socket?.remoteAddress || "");
};

export const buildSessionMetadata = (req) => {
    const userAgent = req.get("user-agent") || "";

    return {
        ...parseUserAgent(userAgent),
        userAgent,
        ipAddress: getClientIp(req)
    };
};
