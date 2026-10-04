// HCP-324: a made-up hospitality supplier for Infinite Search's full-size speed proof
// ("Halden Catering Supply", hco-test, Confluence space ISVOL). About 30,600 invented products,
// like Splendid's 30,009: realistic names, codes, barcodes, brands, a three-level category tree,
// prices and range, colour and material values (supplier is the Supplier name on ISVOL's
// IP Settings: Suppliers page). Every product is invented and the
// output is the same on every run (no randomness), so the before/after measurements compare
// like with like.
// Run: node tools/search-volume.mjs [count]   (default 30600) -> volume/hco-test-products.csv
// The category tree for ISVOL's IP Settings: Categories: node tools/search-volume.mjs --tree
import { writeFileSync, mkdirSync } from "node:fs";

const tree = process.argv[2] === "--tree";
const count = tree ? 0 : Number(process.argv[2] ?? 30600);

// [top category, category, sub category, item nouns, materials, size unit]
const TREE = [
  ["Tableware", "Crockery", "Plates", ["Flat Plate", "Rimmed Plate", "Coupe Plate", "Oval Plate", "Side Plate", "Pasta Plate"], ["Porcelain", "Stoneware", "Bone China", "Melamine"], "cm"],
  ["Tableware", "Crockery", "Bowls", ["Soup Bowl", "Salad Bowl", "Rice Bowl", "Pasta Bowl", "Dip Bowl", "Nibble Bowl"], ["Porcelain", "Stoneware", "Bone China", "Melamine"], "cm"],
  ["Tableware", "Crockery", "Cups and Saucers", ["Espresso Cup", "Cappuccino Cup", "Tea Cup", "Saucer", "Mug", "Latte Glass"], ["Porcelain", "Stoneware", "Bone China"], "cl"],
  ["Tableware", "Cutlery", "Knives", ["Table Knife", "Steak Knife", "Fish Knife", "Butter Knife", "Dessert Knife"], ["Stainless Steel", "18/10 Steel", "Gold Plated"], "cm"],
  ["Tableware", "Cutlery", "Forks and Spoons", ["Table Fork", "Dessert Fork", "Soup Spoon", "Tea Spoon", "Coffee Spoon", "Serving Spoon"], ["Stainless Steel", "18/10 Steel", "Gold Plated"], "cm"],
  ["Glassware", "Drinking Glasses", "Wine Glasses", ["Wine Glass", "Champagne Flute", "Coupe Glass", "Goblet"], ["Crystal Glass", "Toughened Glass", "Polycarbonate"], "cl"],
  ["Glassware", "Drinking Glasses", "Tumblers", ["Hiball", "Rocks Glass", "Old Fashioned", "Tumbler", "Shot Glass"], ["Crystal Glass", "Toughened Glass", "Polycarbonate"], "cl"],
  ["Glassware", "Jugs and Carafes", "Carafes", ["Carafe", "Water Jug", "Decanter", "Bottle"], ["Glass", "Crystal Glass", "Polycarbonate"], "cl"],
  ["Bar", "Bar Tools", "Cocktail Tools", ["Shaker", "Strainer", "Jigger", "Bar Spoon", "Muddler", "Mixing Glass"], ["Stainless Steel", "Copper", "Gold Plated"], "cl"],
  ["Bar", "Bar Tools", "Ice", ["Ice Bucket", "Ice Scoop", "Ice Tongs", "Wine Cooler"], ["Stainless Steel", "Acrylic", "Copper"], "cl"],
  ["Kitchen", "Cookware", "Pans", ["Frying Pan", "Saucepan", "Saute Pan", "Stock Pot", "Wok"], ["Aluminium", "Stainless Steel", "Cast Iron", "Copper"], "cm"],
  ["Kitchen", "Cookware", "Bakeware", ["Baking Tray", "Cake Tin", "Muffin Tray", "Roasting Dish", "Gastronorm Pan"], ["Aluminium", "Stainless Steel", "Silicone"], "cm"],
  ["Kitchen", "Utensils", "Prep Tools", ["Chopping Board", "Mixing Bowl", "Whisk", "Ladle", "Spatula", "Tongs"], ["Polypropylene", "Stainless Steel", "Wood", "Silicone"], "cm"],
  ["Kitchen", "Kitchen Knives", "Chef Knives", ["Chef Knife", "Paring Knife", "Bread Knife", "Santoku Knife", "Boning Knife"], ["Stainless Steel", "Carbon Steel", "Damascus Steel"], "cm"],
  ["Buffet", "Display", "Risers and Platters", ["Platter", "Riser", "Serving Board", "Cake Stand", "Display Tray"], ["Slate", "Wood", "Melamine", "Stainless Steel"], "cm"],
  ["Buffet", "Display", "Chafing", ["Chafing Dish", "Soup Kettle", "Food Pan Lid", "Fuel Holder"], ["Stainless Steel", "Copper"], "l"],
];
const BRANDS = ["Halden", "Corvo", "Linea Nova", "Brightmoor", "Aster & Vale", "Kestrel Pro", "Tavola Fina", "Northcote", "Orrin", "Mareva"];
const RANGES = ["Marlowe", "Seville", "Arden", "Kyoto", "Riviera", "Fjord", "Ember", "Solace", "Harbour", "Ivy", "Aurora", "Granite",
  "Linen", "Coastal", "Heritage", "Atelier", "Monaco", "Nordic", "Verona", "Willow"];
const COLOURS = ["White", "Black", "Grey", "Blue", "Green", "Sand", "Terracotta", "Clear", "Copper", "Gold", "Ivory", "Charcoal"];
const FINISH = ["matt", "gloss", "brushed", "polished", "speckled", "reactive glaze"];
const USES = ["restaurants", "hotels", "cafes", "bars", "banqueting", "contract catering"];

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// A valid EAN-13 from a 12-digit body (the check digit is computed, so barcode checks pass).
const ean13 = (body) => {
  const d = [...body].map(Number);
  const sum = d.reduce((s, x, i) => s + x * (i % 2 ? 3 : 1), 0);
  return body + ((10 - (sum % 10)) % 10);
};

// Headings are IP field keys, so no Supplier Field Mappings are needed. category is the supplier's
// own category name ("Plates"); ISVOL's IP Settings: Category Mappings map each to its key.
const rows = [["sku", "name", "brand", "category", "price", "currency", "description", "gtin", "range", "colour", "material"]];
for (let i = 0; i < count; i++) {
  const [top, mid, sub, nouns, materials, unit] = TREE[i % TREE.length];
  const k = Math.floor(i / TREE.length);
  const noun = nouns[k % nouns.length];
  const material = materials[Math.floor(k / nouns.length) % materials.length];
  const range = RANGES[(k * 7 + i) % RANGES.length];
  const colour = COLOURS[(k * 5 + Math.floor(i / 3)) % COLOURS.length];
  const brand = BRANDS[(i * 3 + Math.floor(k / 11)) % BRANDS.length];
  const size = unit === "l" ? 2 + (k % 8) : unit === "cl" ? 5 + ((k * 3) % 60) : 8 + ((k * 2) % 30);
  const finish = FINISH[(k + i) % FINISH.length];
  const name = `${range} ${material} ${noun} ${size} ${unit} ${colour}`;
  const price = (1.25 + ((i * 37) % 9000) / 100 + (unit === "l" ? 40 : 0)).toFixed(2);
  const description = i % 4 === 3 ? "" :
    `The ${range} ${noun.toLowerCase()} in ${colour.toLowerCase()} ${material.toLowerCase()} with a ${finish} finish, ` +
    `${size} ${unit}. Made by ${brand} for busy ${USES[i % USES.length]}; ${i % 2 ? "dishwasher safe" : "stackable for storage"}.`;
  rows.push([
    `${slug(brand).slice(0, 3).toUpperCase()}-${String(10000 + i)}`, name, brand, sub, price, "GBP",
    description, ean13(`50${String(1000000000 + i * 7).slice(-10)}`), range, colour, material,
  ]);
}
if (tree) {
  const seen = new Map();
  for (const [top, mid, sub] of TREE) for (const [name, parent] of [[top, null], [mid, top], [sub, mid]]) seen.set(slug(name), [name, parent && slug(parent)]);
  for (const [key, [name, parent]] of seen) console.log([key, name, parent ?? ""].join("\t"));
  process.exit(0);
}
const csv = rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(",")).join("\n") + "\n";
mkdirSync("volume", { recursive: true });
writeFileSync("volume/hco-test-products.csv", csv);
console.log(`volume/hco-test-products.csv: ${count} products`);
