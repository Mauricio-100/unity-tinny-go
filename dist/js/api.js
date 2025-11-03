const api = {
  async signup(email, password) {
    const res = await fetch("https://lod-backend.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async login(email, password) {
    const res = await fetch("https://lod-backend.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async publish(token, pkg) {
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
