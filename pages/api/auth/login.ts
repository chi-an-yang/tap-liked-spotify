import type { NextApiRequest, NextApiResponse } from "next";
import { getSpotifyAuthUrl } from "../../../lib/spotify";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ??
    `${getBaseUrl(req)}/api/auth/callback`;
  const state = crypto.randomUUID();
  const url = getSpotifyAuthUrl(redirectUri, state);

  res.redirect(url);
}

function getBaseUrl(req: NextApiRequest) {
  const protocol =
    (req.headers["x-forwarded-proto"] as string) ?? "http";
  const host = req.headers.host ?? "localhost:3000";
  return `${protocol}://${host}`;
}
