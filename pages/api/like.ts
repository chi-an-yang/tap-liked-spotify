import type { NextApiRequest, NextApiResponse } from "next";
import { getRefreshToken } from "../../lib/db";
import {
  fetchCurrentTrackId,
  refreshAccessToken,
  saveTrack,
} from "../../lib/spotify";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const secret = process.env.SHORTCUT_SECRET;
    const provided =
      req.headers["x-shortcut-key"] ??
      (req.query.key as string | undefined);

    if (!secret || provided !== secret) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const spotifyUserId =
      req.headers["x-spotify-user-id"] ??
      (req.query.user as string | undefined);

    if (!spotifyUserId || typeof spotifyUserId !== "string") {
      res.status(400).json({ error: "Missing spotify user id" });
      return;
    }

    const refreshToken = await getRefreshToken(spotifyUserId);
    if (!refreshToken) {
      res.status(404).json({ error: "Spotify user not connected" });
      return;
    }

    const refreshed = await refreshAccessToken(refreshToken);
    const accessToken = refreshed.access_token;

    const trackId = await fetchCurrentTrackId(accessToken);
    if (!trackId) {
      res.status(200).json({ status: "no-track-playing" });
      return;
    }

    await saveTrack(accessToken, trackId);
    res.status(200).json({ status: "liked", trackId });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
