import useSWR from "swr";
import Link from "next/link";
import Nav from "../components/Nav";
import { api } from "../lib/api";

export default function Packages() {
  const { data, error, isLoading } = useSWR("/packages", () => api.packages());

  return (
    <>
      <Nav />
      <h1 style={{ marginTop: 16 }}>Paquets publiés</h1>
      {isLoading && <p>Chargement...</p>}
      {error && <p>Erreur: {(error as Error).message}</p>}
      {data && (
        <ul>
          {Object.entries<Record<string, string[]>>(data.packages).map(([name, versions]) =>
            versions.map((v) => (
              <li key={`${name}@${v}`}>
                <Link href={`/package/${encodeURIComponent(name)}/${encodeURIComponent(v)}`}>
                  {name}@{v}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </>
  );
}
