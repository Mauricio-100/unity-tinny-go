import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { api } from "../../../lib/api";
import Mascot from "../../../components/Mascot";

export default function PackageDetail() {
  const router = useRouter();
  const { name, version } = router.query as { name: string; version: string };

  const [info, setInfo] = useState<any>(null);
  const [source, setSource] = useState<string>("");
  const [python, setPython] = useState<string>("");
  const [downloads, setDownloads] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!name || !version) return;

    api.packageInfo(name, version).then(setInfo).catch((err) => setError(err.message));
    api.download(name, version).then((res) => setDownloads(res.downloads)).catch(() => {});
    api.packageInfo(name, version).then((res) => {
      setSource(res.metadata?.source || "");
      setPython(res.metadata?.python || "");
    });
  }, [name, version]);

  return (
    <>
      <Head>
        <title>{name}@{version} | Gopu.gp</title>
      </Head>
      <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>📦 {name}@{version}</h1>
        {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
        {info && (
          <>
            <h3>🧾 Métadonnées</h3>
            <pre style={{ background: "#f7f7f7", padding: 12 }}>
              {JSON.stringify(info.metadata, null, 2)}
            </pre>

            <h3>📜 Code RA</h3>
            <pre style={{ background: "#f0fff0", padding: 12 }}>{source}</pre>

            <h3>🧬 Python généré</h3>
            <pre style={{ background: "#fff0f0", padding: 12 }}>{python}</pre>

            <h3>📥 Téléchargements</h3>
            <p>{downloads !== null ? `${downloads} téléchargement(s)` : "Chargement..."}</p>
          </>
        )}
      </div>

      <Mascot />
    </>
  );
}
