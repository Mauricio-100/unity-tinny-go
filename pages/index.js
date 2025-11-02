import { useState } from "react";

export default function Home() {
  const [ra, setRa] = useState("say: \"Hello RA\"");
  const [py, setPy] = useState("");
  const [out, setOut] = useState("");

  async function transpile() {
    const res = await fetch("https://post-backend.onrender.com/transpile", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({source: ra})
    });
    const data = await res.json();
    setPy(data.python);
  }

  async function run() {
    const res = await fetch("https://ton-backend.onrender.com/run", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({source: ra})
    });
    const data = await res.json();
    setOut(data.output);
  }

  return (
    <div style={{padding: 20}}>
      <h1>GopuLangEN Playground</h1>
      <textarea value={ra} onChange={e => setRa(e.target.value)} rows={6} cols={60}/>
      <div>
        <button onClick={transpile}>Transpiler</button>
        <button onClick={run}>Exécuter</button>
      </div>
      <h2>Python généré</h2>
      <pre>{py}</pre>
      <h2>Sortie</h2>
      <pre>{out}</pre>
    </div>
  );
}
