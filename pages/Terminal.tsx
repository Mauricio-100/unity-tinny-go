import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function TerminalPage() {
  const [term, setTerm] = useState<any>(null);
  const [output, setOutput] = useState("");

  useEffect(() => {
    api.terminal().then(setTerm).catch(console.error);
  }, []);

  function handleCommand(cmd: string) {
    const res = term?.commands?.[cmd] || "Commande inconnue";
    setOutput(res);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{term?.welcome}</h1>
      <input
        placeholder={term?.prompt || "gopu >"}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCommand((e.target as HTMLInputElement).value);
        }}
      />
      <pre>{output}</pre>
    </div>
  );
}
