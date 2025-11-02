import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Editor from "../components/Editor";
import { Block } from "../components/Output";
import { api } from "../lib/api";

export default function Home() {
  const [source, setSource] = useState<string>("");
  const [python, setPython] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [mapping, setMapping] = useState<string>("");

  useEffect(() => {
    // Ping API
    api.health().catch(() => {});
  }, []);

  async function doTranspile() {
    const res = await api.transpile(source);
    setPython(res.python);
    setMapping(JSON.stringify(res.mapping));
  }

  async function doExplain() {
    const res = await api.explain(source);
    setPython(res.python);
    setMapping(JSON.stringify(res.mapping) + "\nmacros: " + JSON.stringify(res.macros));
  }

  async function doRun() {
    const res = await api.run(source, true, ["print", "range"]);
    setStdout(res.stdout);
    setStderr(res.stderr);
  }

  async function doBuild() {
    const res = await api.build(source, "out.py");
    setStdout(JSON.stringify(res, null, 2));
    setStderr("");
  }

  return (
    <>
      <Nav />
      <h1 style={{ marginTop: 16 }}>Gopu.gp Playground</h1>
      <p style={{ color: "#666" }}>
        Transpile, explique et exécute du RA. Backend: {process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}
      </p>
      <Editor onChange={setSource} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={doTranspile}>Transpiler</button>
        <button onClick={doExplain}>Expliquer</button>
        <button onClick={doRun}>Exécuter (sandbox)</button>
        <button onClick={doBuild}>Build → out.py</button>
      </div>
      <Block title="Python généré" content={python} />
      <Block title="Mapping / macros" content={mapping} />
      <Block title="Stdout" content={stdout} />
      <Block title="Stderr" content={stderr} />
    </>
  );
}
