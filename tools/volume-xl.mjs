// HCP-314: made-up volume for the Pipeline's run-tracking proof at 30,000+ products, on the
// hco-test client only (never ACME: volume/products.csv stays ACME's). Four made-up suppliers
// ("Volume XL 1" to "Volume XL 4"), 7,650 products each (30,600), like splendid's 30,079
// across 9 suppliers. Every product is invented.
// Run: node tools/volume-xl.mjs [per-file count]   (default 7650; a small count trims the files)
import { writeFileSync, mkdirSync } from "node:fs";

const count = Number(process.argv[2] ?? 7650);
const KINDS = [
  ["Kitchen", "Kettle 1.7 L", "kettle"], ["Kitchen", "Ceramic mixing bowl", "mixing bowl"], ["Kitchen", "Saucepan 18 cm", "saucepan"],
  ["Lighting", "Brass desk lamp", "desk lamp"], ["Lighting", "LED strip light 2 m", "strip light"],
  ["Garden", "Hand trowel", "trowel"], ["Garden", "Rubber garden hose 15 m", "garden hose"],
];
mkdirSync("volume-xl", { recursive: true });
for (let f = 1; f <= 4; f++) {
  const rows = [["sku", "name", "brand", "category", "price", "currency", "description"]];
  for (let i = 1; i <= count; i++) {
    const [category, base, noun] = KINDS[(i + f) % KINDS.length];
    rows.push([`VX${f}-${String(i).padStart(5, "0")}`, `${base} ${f}-${i}`, `Volume XL ${f}`, category, (2 + ((i * f) % 97) + 0.99).toFixed(2), "GBP",
      i % 3 === 0 ? "" : `A made-up ${noun} for the hco-test volume proof, supplier ${f}, number ${i}.`]);
  }
  writeFileSync(`volume-xl/part-${f}.csv`, rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(",")).join("\n") + "\n");
}
console.log(`volume-xl/part-1..4.csv: ${count} products each (${4 * count})`);
