# tap-liked-spotify

MVP service that lets you connect Spotify via OAuth and trigger “like current
track” from iOS Shortcuts.

## Setup

1. Create a Spotify Developer App and set a redirect URI:
   - `http://localhost:3000/api/auth/callback` for local dev.
2. Create a Vercel Postgres database and copy the `DATABASE_URL`.
3. Create a `.env.local` file with:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
SHORTCUT_SECRET=your_shortcut_secret
DATABASE_URL=your_postgres_connection
```

## Run locally

```bash
npm install
npm run dev
```

## Testing the flow

1. Visit `http://localhost:3000` and click **Connect Spotify**.
2. Approve the OAuth request.
3. Find your Spotify user id by visiting `https://api.spotify.com/v1/me` with a
   valid access token, or read it from the `spotify_tokens` table.
4. Trigger the like endpoint with your Shortcut secret and Spotify user id:

```bash
curl -X POST "http://localhost:3000/api/like" \
  -H "x-shortcut-key: $SHORTCUT_SECRET" \
  -H "x-spotify-user-id: YOUR_SPOTIFY_USER_ID"
```

You should see `{ "status": "liked", "trackId": "..." }` when a track is
playing.
