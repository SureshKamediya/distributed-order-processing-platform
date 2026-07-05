import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

const publicIssuer = process.env.KEYCLOAK_ISSUER ?? "";
const internalIssuer = process.env.KEYCLOAK_ISSUER_INTERNAL ?? "";
const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "";
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? "";

const REFRESH_SAFETY_MARGIN_MS = 10_000;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }

    // server-side call — must use internal (container-reachable) issuer
    const response = await fetch(`${internalIssuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    const expiresInSeconds =typeof refreshed.expires_in === "number" ? refreshed.expires_in : 300;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    console.log("[auth] token refreshed", {
      accessToken: refreshed.access_token,
      rawExpiresIn: refreshed.expires_in,
      expiresAt: Number.isFinite(expiresAt) ? new Date(expiresAt).toISOString() : "INVALID",
    });

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("[auth] failed to refresh access token", err);
    // Clear the stale token so it can never be forwarded as if valid.
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId,
      clientSecret,
      issuer: publicIssuer, // http://localhost:9191/realms/bookstore — used for iss-claim validation
      wellKnown: `${internalIssuer}/.well-known/openid-configuration`, // fetched server-side, reachable
      authorization: {
        params: { scope: "openid profile email offline_access" },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },

    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        const expiresInSeconds = typeof account.expires_in === "number" ? account.expires_in : 300; // fallback: 5 min
        const expiresAt = Date.now() + expiresInSeconds * 1000;

        console.log("[auth] initial sign-in", {
          accessToken: account.access_token,
          rawExpiresIn: account.expires_in,
          expiresAt: Number.isFinite(expiresAt) ? new Date(expiresAt).toISOString() : "INVALID",
        });

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt,
          error: undefined,
        };
      }

      // Still valid
      if (token.expiresAt && Date.now() < token.expiresAt - REFRESH_SAFETY_MARGIN_MS) {
        console.log("[auth] token still valid", {
          accessToken: token.accessToken,
          expiresAt: new Date(token.expiresAt).toISOString(),
          now: new Date().toISOString(),
        });
        return token;
      }

      // Expired — attempt refresh
      console.log("[auth] token expired, attempting refresh", {
        expiresAt: token.expiresAt ? new Date(token.expiresAt).toISOString() : undefined,
        now: new Date().toISOString(),
      });
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;

      console.log("[auth] session built", {
        accessToken: session.accessToken,
        expiresAt: session.expiresAt ? new Date(session.expiresAt).toISOString() : undefined,
        error: session.error,
      });

      return session;
    },
  },
};