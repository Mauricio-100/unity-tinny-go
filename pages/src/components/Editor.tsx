import { useState } from "react";

type Props = {
  initial?: string;
  onChange?: (val: string) => void;
};

export default function Editor({ initial, onChange }: Props) {
  const [val, setVal] = useState(
    initial ||
      `gop .. up math\n\ntehet x = 10\nsoulbind: y -> int\ntehet y = 20\n\nritual: add(a, b)\n    bless: a + b\n\nsay: invoke ritual add(x, y)\n`
  );

  return (
    <textarea
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        onChange?.(e.target.value);
      }}
      rows={14}
      style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
    />
  );
}
