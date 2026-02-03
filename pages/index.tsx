import type { GetServerSideProps } from "next";

type HomeProps = {
  baseUrl: string;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
}) => {
  const protocol =
    (req.headers["x-forwarded-proto"] as string) ?? "http";
  const host = req.headers.host ?? "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  return { props: { baseUrl } };
};

export default function Home({ baseUrl }: HomeProps) {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>Back Tap + Spotify Like</h1>
      <p>
        Use the button below to connect your Spotify account. After that, you
        can call the API from iOS Shortcuts to like the currently playing track.
      </p>
      <a
        href="/api/auth/login"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          background: "#1db954",
          color: "#fff",
          borderRadius: "999px",
          textDecoration: "none",
        }}
      >
        Connect Spotify
      </a>
      <section style={{ marginTop: "2rem" }}>
        <h2>Shortcut endpoint</h2>
        <p>Send a POST request to:</p>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {`${baseUrl}/api/like`}
        </pre>
        <p>
          Include the <code>x-shortcut-key</code> header that matches your{" "}
          <code>SHORTCUT_SECRET</code>.
        </p>
      </section>
    </main>
  );
}
