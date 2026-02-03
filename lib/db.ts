import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type StoredToken = {
  spotifyUserId: string;
  refreshToken: string;
};

export async function ensureTokensTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS spotify_tokens (
      spotify_user_id TEXT PRIMARY KEY,
      refresh_token TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function upsertRefreshToken({
  spotifyUserId,
  refreshToken,
}: StoredToken) {
  await ensureTokensTable();
  await pool.query(
    `
      INSERT INTO spotify_tokens (spotify_user_id, refresh_token, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (spotify_user_id)
      DO UPDATE SET refresh_token = EXCLUDED.refresh_token, updated_at = NOW();
    `,
    [spotifyUserId, refreshToken],
  );
}

export async function getRefreshToken(spotifyUserId: string) {
  await ensureTokensTable();
  const result = await pool.query(
    `
      SELECT refresh_token
      FROM spotify_tokens
      WHERE spotify_user_id = $1;
    `,
    [spotifyUserId],
  );
  return result.rows[0]?.refresh_token as string | undefined;
}
