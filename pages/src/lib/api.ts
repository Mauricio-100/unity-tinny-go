const BASE = process.env.NEXT_PUBLIC_API_BASE;

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  health: () => jsonFetch("/health"),
  version: () => jsonFetch("/version"),

  // Auth
  signup: (email: string, password: string) =>
    jsonFetch("/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    jsonFetch("/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  verifyEmail: (email: string, otp: string) =>
    jsonFetch("/verify-email", { method: "POST", body: JSON.stringify({ email, otp }) }),
  recover: (email: string) =>
    jsonFetch("/recover", { method: "POST", body: JSON.stringify({ email }) }),

  // Paquets
  publish: (name: string, version: string, source: string, metadata: any) =>
    jsonFetch("/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEPLOY_TOKEN}` },
      body: JSON.stringify({ name, version, source, metadata })
    }),
  packages: () => jsonFetch("/packages"),
  packageInfo: (name: string, version: string) =>
    jsonFetch(`/package/${name}/${version}`),
  download: (name: string, version: string) =>
    jsonFetch(`/package/${name}/${version}/download`),
  stats: () => jsonFetch("/stats/downloads"),

  // Transpileur
  transpile: (source: string) =>
    jsonFetch("/transpile", { method: "POST", body: JSON.stringify({ source }) }),
  run: (source: string) =>
    jsonFetch("/run", { method: "POST", body: JSON.stringify({ source }) }),
  build: (source: string, filename = "out.py") =>
    jsonFetch("/build", { method: "POST", body: JSON.stringify({ source, filename }) }),

  // Terminal + Mascotte
  terminal: () => jsonFetch("/terminal"),
  mascot: () => jsonFetch("/mascot")
};
