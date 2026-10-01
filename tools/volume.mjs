// HCP-266: a made-up volume supplier for ACME ("Volume Supplies", acme-volume), to time an
// upload at full volume (Artis UK sends about 2,600 products). Every product is invented.
// About a third have no description (they publish, and are enriched overnight); every tenth
// name uses the supplier shorthand "S/S" (ACME's Terminology rule makes it "Stainless Steel").
// Run: node tools/volume.mjs [count]   (default 2600; a small count trims the file)
import { writeFileSync, mkdirSync } from "node:fs";

const count = Number(process.argv[2] ?? 2600);
const KINDS = [
  ["Kitchen", "S/S kettle 1.7 L", "kettle"], ["Kitchen", "Ceramic mixing bowl", "mixing bowl"], ["Kitchen", "S/S saucepan 18 cm", "saucepan"],
  ["Lighting", "Brass desk lamp", "desk lamp"], ["Lighting", "LED strip light 2 m", "strip light"],
  ["Garden", "S/S hand trowel", "trowel"], ["Garden", "Rubber garden hose 15 m", "garden hose"],
];
const STEEL = ["kettle", "saucepan", "hand trowel", "cutlery set"];
const rows = [["sku", "name", "brand", "category", "price", "currency", "description"]];
for (let i = 1; i <= count; i++) {
  const [category, base, noun] = KINDS[i % KINDS.length];
  const steel = STEEL[i % STEEL.length];
  const name = i % 10 === 0 ? `S/S ${steel} ${i}` : `${base.replace(/^S\/S (.)/, (_, c) => c.toUpperCase())} ${i}`;
  const description = i % 3 === 0 ? "" : `A made-up ${i % 10 === 0 ? steel : noun} for ACME's volume test, number ${i}.`;
  rows.push([`VS-${String(i).padStart(5, "0")}`, name, "Volume Supplies", category, (2 + (i % 97) + 0.99).toFixed(2), "GBP", description]);
}
const csv = rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(",")).join("\n") + "\n";
mkdirSync("volume", { recursive: true });
writeFileSync("volume/products.csv", csv);
console.log(`volume/products.csv: ${count} products`);
