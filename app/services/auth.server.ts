// app/services/auth.server.ts
import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { GoogleStrategy } from "remix-auth-google";
import { env } from "~/services/env.server";

// Initialize the authenticator
const authenticator = new Authenticator(sessionStorage);

const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Your authentication logic here
    console.log(profile);
    return {};
  }
);

// Use the Google strategy with the authenticator
authenticator.use(googleStrategy);

export { authenticator };
