import { useEffect, useState } from "react";
import Head from "next/head";
import { api } from "../lib/api";
import Mascot from "../components/Mascot";

export default function DashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>(process.env.NEXT_PUBLIC_DEPLOY_TOKEN || "");
  const [packages, setPackages] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api.packages()
      .then((res) => setPackages(res.packages))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <Head>
        <title>Mon tableau de bord | Gopu.gp</title>
      </Head>
      <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>🧑‍💻 Mon tableau de bord</h1>
        <p>Visualise les paquets que tu as publiés avec ton token de déploiement.</p>

        <div style={{ marginBottom: 16 }}>
          <label>Email (optionnel)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Token Bearer</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: "100%" }} />
        </div>

        {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(packages).map(([name, versions]) =>
            versions.map((version) => (
              <li key={`${name}@${version}`} style={{ marginBottom: 8 }}>
                <strong>{name}@{version}</strong>
                <span style={{ marginLeft: 8 }}>
                  <a href={`/package/${encodeURIComponent(name)}/${encodeURIComponent(version)}`}>🔍 Voir</a>
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <Mascot />
    </>
  );
}
