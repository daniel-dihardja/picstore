// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { GoogleStrategy } from "remix-auth-google";
import { env } from "~/services/env.server";
import {
  upsertUser,
  createUser,
  getUser,
  createWelcomeBalance,
} from "~/services";

// Initialize the authenticator
const authenticator = new Authenticator(sessionStorage);

const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    console.log(profile);
    const email = profile.emails[0].value;
    const picture = profile.photos[0].value;
    const user = await getUser(email);
    if (!user) {
      const userId = await createUser({ email, picture });
      await createWelcomeBalance(userId as string);
      return { id: userId };
    }
    return { id: user._id.toString() };
  }
);

// Use the Google strategy with the authenticator
authenticator.use(googleStrategy);

export { authenticator };
