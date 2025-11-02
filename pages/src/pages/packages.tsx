import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { api } from "../lib/api";
import Mascot from "../components/Mascot";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Record<string, string[]>>({});
  const [downloads, setDownloads] = useState<Record<string, Record<string, number>>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api.packages()
      .then((res) => setPackages(res.packages))
      .catch((err) => setError(err.message));

    api.stats()
      .then(setDownloads)
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Paquets publiés | Gopu.gp</title>
      </Head>
      <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>📦 Paquets publiés</h1>
        <p>Explore les modules RA disponibles dans le registre Gopu.gp.</p>

        {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(packages).map(([name, versions]) =>
            versions.map((version) => (
              <li key={`${name}@${version}`} style={{ marginBottom: 8 }}>
                <Link href={`/package/${encodeURIComponent(name)}/${encodeURIComponent(version)}`}>
                  <strong>{name}@{version}</strong>
                </Link>
                {downloads[name]?.[version] !== undefined && (
                  <span style={{ marginLeft: 8, color: "#666" }}>
                    — {downloads[name][version]} téléchargement(s)
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <Mascot />
    </>
  );
}
