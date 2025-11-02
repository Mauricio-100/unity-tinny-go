import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Mascot() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.mascot().then(setData).catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <img src={data.image_url} alt={data.name} width={80} />
      <p style={{ fontSize: 12 }}>{data.message}</p>
    </div>
  );
}
