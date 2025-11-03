function PublishPanel({ token }) {
  const [pkg, setPkg] = React.useState({ name: "", version: "", source: "", metadata: "" });
  const [result, setResult] = React.useState("");

  async function publish() {
    const res = await api.publish(token, {
      name: pkg.name,
      version: pkg.version,
      source: pkg.source,
      metadata: JSON.parse(pkg.metadata || "{}")
    });
    setResult(JSON.stringify(res));
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">📦 Publication</h2>
      <input className="w-full p-2 rounded bg-gray-700" placeholder="Nom" value={pkg.name} onChange={e => setPkg({ ...pkg, name: e.target.value })} />
      <input className="w-full p-2 rounded bg-gray-700" placeholder="Version" value={pkg.version} onChange={e => setPkg({ ...pkg, version: e.target.value })} />
      <input className="w-full p-2 rounded bg-gray-700" placeholder="Source" value={pkg.source} onChange={e => setPkg({ ...pkg, source: e.target.value })} />
      <textarea className="w-full p-2 rounded bg-gray-700" placeholder="Metadata (JSON)" value={pkg.metadata} onChange={e => setPkg({ ...pkg, metadata: e.target.value })}></textarea>
      <button className="w-full bg-purple-600 p-2 rounded" onClick={publish}>Publier</button>
      {result && <p className="text-indigo-400 break-words">📤 {result}</p>}
    </div>
  );
}
