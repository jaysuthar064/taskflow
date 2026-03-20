import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import { buildSessionMetadata } from "./deviceInfo.js";

const ACCESS_TOKEN_EXPIRE = process.env.JWT_EXPIRE || "7d";
const TWO_FACTOR_CHALLENGE_EXPIRE = process.env.TWO_FACTOR_CHALLENGE_EXPIRE || "5m";

const parseDurationToMs = (value) => {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue) && numericValue > 0) {
        return numericValue * 1000;
    }

    const match = String(value || "").trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
        return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
};

const createExpiryDate = (value) => new Date(Date.now() + parseDurationToMs(value));

export const issueAccessToken = ({ userId, sessionId }) =>
    jwt.sign(
        {
            id: userId,
            sessionId,
            type: "access"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRE
        }
    );

export const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "access" || !decoded.sessionId) {
        throw new Error("Invalid access token.");
    }

    return decoded;
};

export const createTwoFactorChallengeToken = ({ userId, loginMethod }) =>
    jwt.sign(
        {
            id: userId,
            loginMethod,
            nonce: crypto.randomUUID(),
            type: "two_factor_challenge"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: TWO_FACTOR_CHALLENGE_EXPIRE
        }
    );

export const verifyTwoFactorChallengeToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "two_factor_challenge" || !decoded.id) {
        throw new Error("Invalid two-factor challenge token.");
    }

    return decoded;
};

export const createAuthenticatedSession = async ({
    user,
    req,
    loginMethod,
    twoFactorVerified = false
}) => {
    const sessionTokenId = crypto.randomUUID();
    const session = await Session.create({
        user: user._id,
        sessionTokenId,
        loginMethod,
        ...buildSessionMetadata(req),
        lastActiveAt: new Date(),
        expiresAt: createExpiryDate(ACCESS_TOKEN_EXPIRE),
        twoFactorVerifiedAt: twoFactorVerified ? new Date() : null
    });

    const token = issueAccessToken({
        userId: user._id.toString(),
        sessionId: sessionTokenId
    });

    return {
        session,
        token
    };
};

export const getTwoFactorChallengeLifetimeSeconds = () =>
    Math.round(parseDurationToMs(TWO_FACTOR_CHALLENGE_EXPIRE) / 1000);
