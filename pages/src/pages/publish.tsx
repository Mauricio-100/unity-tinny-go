import { useState } from "react";
import Head from "next/head";
import { api } from "../lib/api";
import Editor from "../components/Editor";
import Mascot from "../components/Mascot";

export default function PublishPage() {
  const [name, setName] = useState("gopu-core");
  const [version, setVersion] = useState("0.1.0");
  const [metadata, setMetadata] = useState<string>('{"author": "Ceose", "license": "gopu.v1.0"}');
  const [source, setSource] = useState<string>("ritual: add(a, b)\n    bless: a + b");
  const [result, setResult] = useState<string>("");

  async function handlePublish() {
    try {
      const meta = JSON.parse(metadata);
      const res = await api.publish(name, version, source, meta);
      setResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResult(`Erreur : ${err.message}`);
    }
  }

  return (
    <>
      <Head>
        <title>Publier un paquet RA | Gopu.gp</title>
      </Head>
      <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>📦 Publier un paquet RA</h1>
        <p>Déclare ton module RA, ajoute ses métadonnées, et publie-le dans le registre Gopu.gp.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Nom du paquet</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div>
            <label>Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Métadonnées (JSON)</label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={4}
            style={{ width: "100%", fontFamily: "monospace" }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Code source RA</label>
          <Editor initial={source} onChange={setSource} />
        </div>

        <button onClick={handlePublish} style={{ marginTop: 16 }}>🚀 Publier</button>

        <div style={{ marginTop: 24 }}>
          <h3>🧾 Résultat</h3>
          <pre style={{ background: "#f7f7f7", padding: 12 }}>{result}</pre>
        </div>
      </div>

      <Mascot />
    </>
  );
}
