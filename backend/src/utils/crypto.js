import crypto from "crypto";

const getEncryptionKey = () => {
    const seed =
        process.env.TWO_FACTOR_ENCRYPTION_KEY ||
        process.env.JWT_SECRET ||
        "taskflow-dev-encryption-key";

    return crypto.createHash("sha256").update(seed).digest();
};

export const encryptValue = (value) => {
    if (!value) {
        return "";
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv, authTag, encrypted]
        .map((part) => part.toString("base64url"))
        .join(".");
};

export const decryptValue = (payload) => {
    if (!payload) {
        return "";
    }

    const [ivPart, authTagPart, encryptedPart] = payload.split(".");

    if (!ivPart || !authTagPart || !encryptedPart) {
        throw new Error("Invalid encrypted payload.");
    }

    const iv = Buffer.from(ivPart, "base64url");
    const authTag = Buffer.from(authTagPart, "base64url");
    const encrypted = Buffer.from(encryptedPart, "base64url");

    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};
