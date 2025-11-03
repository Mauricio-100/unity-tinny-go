function App() {
  const [token, setToken] = React.useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">🌀 GopuOS</h1>
      <AuthPanel onToken={setToken} />
      {token && <PublishPanel token={token} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
