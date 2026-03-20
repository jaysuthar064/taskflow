import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET_KEY || process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || (process.env.BACKEND_URL 
        ? `${process.env.BACKEND_URL.replace(/\/+$/, "")}/api/v1/auth/google/callback`
        : "/api/v1/auth/google/callback"),
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;

      try {
        const normalizedEmail = email.toLowerCase();
        let user = await User.findOne({ 
            $or: [{ googleId: id }, { email: normalizedEmail }] 
        });

        if (user) {
          const wasPasswordOnlyAccount = !user.googleId;

          if (!user.googleId) {
            user.googleId = id;
          }

          if (user.passwordConfigured === undefined && wasPasswordOnlyAccount) {
            user.passwordConfigured = true;
          }

          if (user.isModified()) {
            await user.save();
          }

          return done(null, user);
        }

        user = await User.create({
          name: displayName,
          email: normalizedEmail,
          googleId: id,
          passwordConfigured: false
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
