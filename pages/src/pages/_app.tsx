import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <Component {...pageProps} />
    </div>
  );
}
