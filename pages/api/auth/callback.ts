import type { NextApiRequest, NextApiResponse } from "next";
import { upsertRefreshToken } from "../../../lib/db";
import { exchangeCodeForToken } from "../../../lib/spotify";

type SpotifyProfile = {
  id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).send("Missing code");
      return;
    }

    const redirectUri =
      process.env.SPOTIFY_REDIRECT_URI ??
      `${getBaseUrl(req)}/api/auth/callback`;
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);
    const accessToken = tokenResponse.access_token;
    const refreshToken = tokenResponse.refresh_token;

    if (!refreshToken) {
      res.status(400).send("Missing refresh token from Spotify");
      return;
    }

    const profile = await fetchSpotifyProfile(accessToken);
    await upsertRefreshToken({
      spotifyUserId: profile.id,
      refreshToken,
    });

    res.redirect("/?connected=true");
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : "Unknown error");
  }
}

async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfile> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify profile failed: ${text}`);
  }

  return (await response.json()) as SpotifyProfile;
}

function getBaseUrl(req: NextApiRequest) {
  const protocol =
    (req.headers["x-forwarded-proto"] as string) ?? "http";
  const host = req.headers.host ?? "localhost:3000";
  return `${protocol}://${host}`;
}
