import { useState } from "react";
import { api } from "./lib/api.ts";


export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function login() {
    try {
      const res = await api.login(email, password);
      if (res.token) {
        setToken(res.token);
        setError("");
      } else {
        setError("Échec de connexion");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  }

  return (
    <div>
      <h2>Connexion</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Se connecter</button>
      {token && <p>✅ Token : {token}</p>}
      {error && <p>❌ {error}</p>}
    </div>
  );
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  async function signup() {
    try {
      const res = await api.signup(email, password);
      if (res.ok) {
        setOtp(res.otp);
        setError("");
      } else {
        setError("Échec d'inscription");
      }
    } catch (err) {
      setError("Erreur serveur");
    }
  }

  return (
    <div>
      <h2>Inscription</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signup}>S'inscrire</button>
      {otp && <p>🔐 OTP : {otp}</p>}
      {error && <p>❌ {error}</p>}
    </div>
  );
}
