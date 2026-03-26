import User from "../models/User.js";
import Session from "../models/Session.js";
import { buildSessionMetadata } from "../utils/deviceInfo.js";
import { verifyAccessToken } from "../utils/authTokens.js";

export const protect = async (req, res, next) => {
    let token;
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
            const decoded = verifyAccessToken(token);
            const [user, session] = await Promise.all([
                User.findById(decoded.id)
                    .select("_id name email role passwordConfigured googleId twoFactorEnabled createdAt updatedAt")
                    .lean(),
                Session.findOne({
                    user: decoded.id,
                    sessionTokenId: decoded.sessionId
                })
            ]);

            if (!user || !session) {
                return res.status(401).json({
                    message: "Not authorized, session not found."
                });
            }

            if (session.revokedAt || (session.expiresAt && session.expiresAt <= new Date())) {
                return res.status(401).json({
                    message: "Session has expired or was revoked."
                });
            }

            req.user = user;
            req.session = session;

            if (!session.lastActiveAt || Date.now() - new Date(session.lastActiveAt).getTime() > 60 * 1000) {
                const metadata = buildSessionMetadata(req);
                session.lastActiveAt = new Date();
                session.ipAddress = metadata.ipAddress;
                session.userAgent = metadata.userAgent;
                session.browser = metadata.browser;
                session.os = metadata.os;
                session.deviceType = metadata.deviceType;
                session.deviceLabel = metadata.deviceLabel;
                session.save().catch(() => {});
            }

            next();
        } else {
            return res.status(401).json({
                message: `Not authorized, no token`
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: `Token Failed`
        });
    }
}
