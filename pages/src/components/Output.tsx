type BlockProps = { title: string; content: string | undefined };
export function Block({ title, content }: BlockProps) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ margin: "8px 0" }}>{title}</h3>
      <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6, overflowX: "auto" }}>
        {content || ""}
      </pre>
    </div>
  );
}
