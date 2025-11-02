import { useState } from "react";
import Nav from "../components/Nav";
import Editor from "../components/Editor";
import { Block } from "../components/Output";
import { api } from "../lib/api";

export default function Publish() {
  const [name, setName] = useState("gopu-core");
  const [version, setVersion] = useState("0.1.0");
  const [source, setSource] = useState("");
  const [meta, setMeta] = useState("{}");
  const [result, setResult] = useState("");

  async function onPublish() {
    const metadata = safeJson(meta);
    const res = await api.publish(name, version, source, metadata);
    setResult(JSON.stringify(res, null, 2));
  }

  function safeJson(val: string) {
    try {
      return JSON.parse(val || "{}");
    } catch {
      return {};
    }
  }

  return (
    <>
      <Nav />
      <h1 style={{ marginTop: 16 }}>Publier un module RA</h1>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label>Version</label>
          <input value={version} onChange={(e) => setVersion(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Métadonnées (JSON)</label>
        <textarea value={meta} onChange={(e) => setMeta(e.target.value)} rows={6} style={{ width: "100%" }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <label>Source RA</label>
        <Editor onChange={setSource} />
      </div>
      <button onClick={onPublish}>Publier</button>
      <Block title="Résultat" content={result} />
    </>
  );
}
