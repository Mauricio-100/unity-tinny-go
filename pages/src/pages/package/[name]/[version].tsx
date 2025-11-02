import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Nav from "../../../components/Nav";
import { Block } from "../../../components/Output";
import { api } from "../../../lib/api";

export default function PackageView() {
  const router = useRouter();
  const { name, version } = router.query as { name: string; version: string };
  const [info, setInfo] = useState<any>(null);
  const [source, setSource] = useState<string>("");
  const [python, setPython] = useState<string>("");

  useEffect(() => {
    if (!name || !version) return;
    api.packageInfo(name, version).then(setInfo).catch(console.error);
    api.packageSource(name, version).then((d) => setSource(d.source)).catch(console.error);
    api.packagePython(name, version).then((d) => setPython(d.python)).catch(console.error);
  }, [name, version]);

  return (
    <>
      <Nav />
      <h1 style={{ marginTop: 16 }}>
        Paquet {name}@{version}
      </h1>
      <Block title="Metadata" content={JSON.stringify(info, null, 2)} />
      <Block title="Source RA" content={source} />
      <Block title="Python généré" content={python} />
    </>
  );
}
