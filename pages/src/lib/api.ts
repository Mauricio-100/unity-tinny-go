const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init && init.headers)
    }
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }
  return res.json();
}

export const api = {
  health: () => jsonFetch("/health"),
  version: () => jsonFetch("/version"),
  transpile: (source: string) =>
    jsonFetch("/transpile", { method: "POST", body: JSON.stringify({ source }) }),
  explain: (source: string) =>
    jsonFetch("/explain", { method: "POST", body: JSON.stringify({ source }) }),
  run: (source: string, sandbox = true, allow: string[] = ["print"]) =>
    jsonFetch("/run", { method: "POST", body: JSON.stringify({ source, sandbox, allow }) }),
  build: (source: string, filename = "out.py") =>
    jsonFetch("/build", { method: "POST", body: JSON.stringify({ source, filename }) }),
  publish: (name: string, version: string, source: string, metadata: Record<string, any> = {}) =>
    jsonFetch("/publish", { method: "POST", body: JSON.stringify({ name, version, source, metadata }) }),
  packages: () => jsonFetch("/packages"),
  packageInfo: (name: string, version: string) =>
    jsonFetch(`/package/${encodeURIComponent(name)}/${encodeURIComponent(version)}`),
  packageSource: (name: string, version: string) =>
    jsonFetch(`/package/${encodeURIComponent(name)}/${encodeURIComponent(version)}/source`),
  packagePython: (name: string, version: string) =>
    jsonFetch(`/package/${encodeURIComponent(name)}/${encodeURIComponent(version)}/python`)
};
