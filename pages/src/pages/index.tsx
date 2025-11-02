import { useEffect, useState } from "react";
import Head from "next/head";
import { api } from "../lib/api";
import Editor from "../components/Editor";
import Mascot from "../components/Mascot";

export default function Home() {
  const [source, setSource] = useState<string>("say: \"Bonjour Gopu.gp 🐨\"");
  const [python, setPython] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [terminal, setTerminal] = useState<any>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>("");

  useEffect(() => {
    api.terminal().then(setTerminal).catch(console.error);
  }, []);

  const handleCommand = (cmd: string) => {
    const out = terminal?.commands?.[cmd] || "Commande inconnue";
    setTerminalOutput((prev) => `${prev}\n${terminal?.prompt || ">"} ${cmd}\n${out}`);
  };

  return (
    <>
      <Head>
        <title>Gopu.gp Playground</title>
      </Head>
      <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>🧪 Gopu.gp Playground</h1>
        <p>Écris du code RA, transpile-le, exécute-le, et explore ton système agentique.</p>

        <Editor initial={source} onChange={setSource} />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={async () => {
            const res = await api.transpile(source);
            setPython(res.python);
          }}>Transpiler</button>

          <button onClick={async () => {
            const res = await api.run(source);
            setStdout(res.stdout);
            setStderr(res.stderr);
          }}>Exécuter</button>

          <button onClick={async () => {
            const res = await api.build(source);
            setStdout(`Fichier généré : ${res.file}`);
          }}>Build</button>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>🧬 Python généré</h3>
          <pre style={{ background: "#f7f7f7", padding: 12 }}>{python}</pre>

          <h3>📤 Sortie (stdout)</h3>
          <pre style={{ background: "#f0fff0", padding: 12 }}>{stdout}</pre>

          <h3>⚠️ Erreurs (stderr)</h3>
          <pre style={{ background: "#fff0f0", padding: 12 }}>{stderr}</pre>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2>🖥️ Terminal Gopu.gp</h2>
          <p>{terminal?.welcome}</p>
          <input
            placeholder={terminal?.prompt || "gopu >"}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommand((e.target as HTMLInputElement).value);
            }}
            style={{ width: "100%", padding: 8, fontFamily: "monospace" }}
          />
          <pre style={{ background: "#111", color: "#0f0", padding: 12, minHeight: 120 }}>
            {terminalOutput}
          </pre>
        </div>
      </div>

      <Mascot />
    </>
  );
}
