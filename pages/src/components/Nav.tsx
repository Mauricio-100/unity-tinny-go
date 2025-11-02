import Link from "next/link";

export default function Nav() {
  return (
    <nav style={{ padding: "12px", borderBottom: "1px solid #eee", display: "flex", gap: "16px" }}>
      <Link href="/">Playground</Link>
      <Link href="/publish">Publier</Link>
      <Link href="/packages">Paquets</Link>
    </nav>
  );
}
