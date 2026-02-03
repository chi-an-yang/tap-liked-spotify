# Back Tap + Spotify Like: Vercel MVP Service Plan

This plan targets a simple, shareable MVP that lets anyone who knows the URL log in with Spotify, obtain a token, and trigger a “like current track” API endpoint that you can call from iOS Shortcuts. It avoids a full member system for now, but leaves room to evolve.

## Recommendations (based on your constraints)

### Hosting
- **Vercel** for both the UI and API routes (Next.js).

### Data store
- **Vercel Postgres** as the default recommendation because it is first‑party on Vercel, easy to provision, and integrates well with serverless API routes.
- **Supabase** is a good alternative if you want a fuller dashboard and more control; it requires extra setup but is also suitable.

### Authentication approach (no “accounts” for now)
- **Spotify OAuth login only**: users visit a single URL, authenticate with Spotify, and the service stores their refresh token keyed by their Spotify user ID.
- No internal “member” accounts yet; the OAuth user acts as the identity.
- For iOS Shortcuts, use a **short secret key** (query param or header) so only your shortcut calls can trigger the action, even if the endpoint is public.

## Proposed MVP flow

1. **User visits `/login`** and authenticates with Spotify.
2. The server exchanges the OAuth code for `access_token` + `refresh_token`.
3. The server **stores refresh_token** keyed by the Spotify user ID.
4. iOS Shortcuts calls `/api/like?key=YOUR_SECRET` (or with a header).
5. The API:
   - Uses stored refresh token to mint a fresh access token.
   - Calls Spotify “currently playing” API to get the track ID.
   - Calls Spotify “save track” API to like the track.

## Spotify setup steps (for you)

1. Create a Spotify Developer App.
2. Set a redirect URI (example: `https://your-domain.com/api/auth/callback`).
3. Note `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` for Vercel environment variables.

## Security notes

- Add a **secret key** to the `/api/like` endpoint for basic protection.
- Store tokens in the database (never inside iOS Shortcuts).
- Use HTTPS only (Vercel handles this automatically).

## Future upgrades

- Add “real” accounts if you want a user dashboard and per‑user settings.
- Add rate limiting or IP throttling for the API endpoint.
- Add a simple UI page to confirm “Like successful” or show status.
