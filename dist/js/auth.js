function AuthPanel({ onToken }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");

  async function signup() {
    const res = await api.signup(email, password);
    if (res.ok) {
      setOtp(res.otp);
      setError("");
    } else {
      setError("Échec d'inscription");
    }
  }

  async function login() {
    const res = await api.login(email, password);
    if (res.token) {
      onToken(res.token);
      setError("");
    } else {
      setError("Échec de connexion");
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">🔐 Authentification</h2>
      <input className="w-full p-2 rounded bg-gray-700" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full p-2 rounded bg-gray-700" type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="flex space-x-2">
        <button className="flex-1 bg-green-600 p-2 rounded" onClick={signup}>S'inscrire</button>
        <button className="flex-1 bg-blue-600 p-2 rounded" onClick={login}>Connexion</button>
      </div>
      {otp && <p className="text-yellow-400">🔐 OTP : {otp}</p>}
      {error && <p className="text-red-400">❌ {error}</p>}
    </div>
  );
}
