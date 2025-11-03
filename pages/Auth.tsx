import { useState } from "react";
import { api } from "../lib/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  async function login() {
    const res = await api.login(email, password);
    setToken(res.token);
  }

  return (
    <div>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Mot de passe" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Connexion</button>
      <p>Token : {token}</p>
    </div>
  );
}
