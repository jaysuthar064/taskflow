import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DEFAULT_PERIOD_SECONDS = 30;
const DEFAULT_DIGITS = 6;

const normalizeBase32Secret = (secret = "") =>
    secret.toUpperCase().replace(/[^A-Z2-7]/g, "");

const encodeBase32 = (buffer) => {
    let bits = 0;
    let value = 0;
    let output = "";

    for (const byte of buffer) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
};

const decodeBase32 = (input) => {
    const normalized = normalizeBase32Secret(input);
    let bits = 0;
    let value = 0;
    const output = [];

    for (const character of normalized) {
        const index = BASE32_ALPHABET.indexOf(character);

        if (index === -1) {
            throw new Error("Invalid base32 secret.");
        }

        value = (value << 5) | index;
        bits += 5;

        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }

    return Buffer.from(output);
};

const generateHotp = ({ secret, counter, digits = DEFAULT_DIGITS }) => {
    const key = decodeBase32(secret);
    const counterBuffer = Buffer.alloc(8);
    const high = Math.floor(counter / 0x100000000);
    const low = counter % 0x100000000;

    counterBuffer.writeUInt32BE(high >>> 0, 0);
    counterBuffer.writeUInt32BE(low >>> 0, 4);

    const digest = crypto.createHmac("sha1", key).update(counterBuffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const code =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

    return String(code % (10 ** digits)).padStart(digits, "0");
};

export const generateTwoFactorSecret = () => encodeBase32(crypto.randomBytes(20));

export const formatSecretForDisplay = (secret) =>
    normalizeBase32Secret(secret)
        .match(/.{1,4}/g)
        ?.join(" ") || normalizeBase32Secret(secret);

export const createTotpUri = ({
    secret,
    email,
    issuer = "TaskFlow",
    period = DEFAULT_PERIOD_SECONDS,
    digits = DEFAULT_DIGITS
}) => {
    const normalizedSecret = normalizeBase32Secret(secret);
    const label = encodeURIComponent(`${issuer}:${email}`);
    const encodedIssuer = encodeURIComponent(issuer);

    return `otpauth://totp/${label}?secret=${normalizedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${digits}&period=${period}`;
};

export const verifyTotpToken = ({
    secret,
    token,
    window = 1,
    period = DEFAULT_PERIOD_SECONDS,
    digits = DEFAULT_DIGITS
}) => {
    const normalizedToken = String(token || "").replace(/\s+/g, "");

    if (!/^\d{6}$/.test(normalizedToken)) {
        return false;
    }

    const counter = Math.floor(Date.now() / 1000 / period);

    for (let offset = -window; offset <= window; offset += 1) {
        const expected = generateHotp({
            secret,
            counter: counter + offset,
            digits
        });

        if (expected === normalizedToken) {
            return true;
        }
    }

    return false;
};
