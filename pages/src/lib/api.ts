export const api = {
  async signup(email: string, password: string) {
    const res = await fetch("https://lod-backend.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch("https://lod-backend.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async publish(token: string, pkg: {
    name: string;
    version: string;
    source: string;
    metadata: Record<string, any>;
  }) {
    const res = await fetch("https://lod-backend.onrender.com/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(pkg)
    });
    return res.json();
  }
};
