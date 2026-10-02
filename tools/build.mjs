// Builds ACME's made-up supplier files (HCP-129). ACME is a fake Hockham & Co test client;
// every supplier, product, barcode and price here is invented. Run: node tools/build.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync, crc32 } from "node:zlib";
import { xlsx } from "./xlsx.mjs";

const BASE = "https://raw.githubusercontent.com/benhockham-gif/hco-acme-test-data/main";
const img = (sku) => `${BASE}/images/${sku.toLowerCase()}.png`;
const out = (path, data) => { mkdirSync(path.split("/").slice(0, -1).join("/") || ".", { recursive: true }); writeFileSync(path, data); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Made-up EAN-13s with valid check digits (prefix 509999, not a real company prefix).
const ean = (n) => {
  const d = `509999${String(n).padStart(6, "0")}`;
  const sum = [...d].reduce((s, c, i) => s + Number(c) * (i % 2 ? 3 : 1), 0);
  return d + ((10 - (sum % 10)) % 10);
};

// Shared barcodes: the same product sold by two suppliers (cross-supplier duplicates).
const STRIP = ean(500);    // Brightside feed + Kettle & Co API
const SECATEURS = ean(700); // Gartenwelt spreadsheet + Garden Direct website
const SPADE = ean(701);    // Gartenwelt spreadsheet + Garden Direct website

// 1. Feed (XML): Brightside Lighting.
// HCP-302: supplier_name, product_range and stock (made up) give Infinite Search supplier, range
// and availability filters to show (mapped on ACME's IP Settings: Supplier Field Mappings).
const feed = [
  { sku: "BL-100", ean: ean(100), title: "Arc floor lamp", brand: "Brightside", description: "A tall arched floor lamp with a weighted marble base and a 2 m reach.", category: "Floor lamps", price: "£89.00", image: img("BL-100"), colour: "", wattage: "", parent_sku: "", accessories: "BL-200", supplier_name: "Brightside Lighting", product_range: "Arc", stock: "in stock", status: "Active" },
  { sku: "BL-100-BLK", ean: ean(101), title: "Arc floor lamp, black", brand: "Brightside", description: "The Arc floor lamp in matt black.", category: "Floor lamps", price: "£89.00", image: img("BL-100-BLK"), colour: "Black", wattage: "", parent_sku: "BL-100", accessories: "BL-200", supplier_name: "Brightside Lighting", product_range: "Arc", stock: "low stock", status: "Active" },
  { sku: "BL-100-BRS", ean: ean(102), title: "Arc floor lamp, brass", brand: "Brightside", description: "The Arc floor lamp in brushed brass.", category: "Floor lamps", price: "£94.00", image: img("BL-100-BRS"), colour: "Brass", wattage: "", parent_sku: "BL-100", accessories: "BL-200", supplier_name: "Brightside Lighting", product_range: "Arc", stock: "out of stock", status: "Active" },
  { sku: "BL-200", ean: ean(200), title: "LED bulb E27 warm white", brand: "Brightside", description: "Dimmable E27 LED bulb, 2700 K.", category: "Bulbs", price: "£6.50", image: img("BL-200"), colour: "", wattage: "9 W", parent_sku: "", accessories: "", supplier_name: "Brightside Lighting", product_range: "Everyday LED", stock: "in stock", status: "Active" },
  { sku: "BL-300", ean: ean(300), title: "Linen pendant shade", brand: "Brightside", description: "", category: "Shades", price: "£32.00", image: img("BL-300"), colour: "Natural", wattage: "", parent_sku: "", accessories: "BL-200", supplier_name: "Brightside Lighting", product_range: "Linen", stock: "out of stock", status: "Discontinued" },
  { sku: "BL-500", ean: STRIP, title: "Under-cabinet LED strip light 1m", brand: "Brightside", description: "Slim LED strip for under kitchen cabinets, with a touch switch.", category: "Strip lights", price: "£21.50", image: img("BL-500"), colour: "", wattage: "0.006 kW", parent_sku: "", accessories: "", supplier_name: "Brightside Lighting", product_range: "Kitchen Glow", stock: "in stock", status: "Active" },
];
const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalogue supplier="Brightside Lighting (made up)" generated="2026-09-29">
  <products>
${feed.map((p) => `    <product>\n${Object.entries(p).map(([k, v]) => `      <${k}>${esc(v)}</${k}>`).join("\n")}\n    </product>`).join("\n")}
  </products>
</catalogue>
`;
out("feed/brightside-lighting.xml", feedXml);

// HCP-130 UAT (30 Sep 2026): KC-03 dropped from the API to show "withdrawn"; GD-14 price
// changed from £18.00 to £17.50 to show "changed".

// 2. API (JSON): Kettle & Co. Nested fields; some descriptions missing; American spelling.
// HCP-302: vendor and collection (made up) for the supplier and range filters. KC-06 has neither,
// so the matched strip light (BL-500) takes Brightside's values without a conflict to review.
const api = {
  meta: { supplier: "Kettle & Co (made up)", page: 1, per_page: 50, total: 5 },
  data: [
    { id: "KC-01", barcode: ean(401), title: "Stainless steel kettle 1.7L", maker: "Kettle & Co", details: { summary: "Fast-boil kettle with a brushed stainless steel finish and a 360° base." }, pricing: { amount: "34.50", currency: "GBP" }, media: { main: img("KC-01") }, type: "Kettles", vendor: "Kettle & Co", collection: "Brushed Steel", availability: "in stock", bundle_items: "" },
    { id: "KC-02", barcode: ean(402), title: "Two-slice toaster", maker: "Kettle & Co", details: { summary: "" }, pricing: { amount: "29.00", currency: "GBP" }, media: { main: img("KC-02") }, type: "Toasters", vendor: "Kettle & Co", collection: "Brushed Steel", availability: "in stock", bundle_items: "" },
    { id: "KC-04", barcode: ean(404), title: "Glass kettle with blue light", maker: "Kettle & Co", details: { summary: "Borosilicate glass kettle that glows blue while boiling." }, pricing: { amount: "39.00", currency: "GBP" }, media: { main: img("KC-04") }, type: "Kettles", vendor: "Kettle & Co", collection: "Glass", availability: "recalled", bundle_items: "" },
    { id: "KC-05", barcode: ean(405), title: "Breakfast set", maker: "Kettle & Co", details: {}, pricing: { amount: "59.00", currency: "GBP" }, media: { main: img("KC-05") }, type: "Kettles", vendor: "Kettle & Co", collection: "Brushed Steel", availability: "in stock", bundle_items: "KC-01, KC-02" },
    { id: "KC-06", barcode: STRIP, title: "LED cabinet strip, 1 metre", maker: "Brightside", details: { summary: "Stick-on LED strip for under cabinets." }, pricing: { amount: "19.99", currency: "GBP" }, media: { main: img("KC-06") }, type: "Strip lights", availability: "in stock", bundle_items: "" },
  ],
};
out("api/v1/products.json", JSON.stringify(api, null, 2) + "\n");

// 3. Spreadsheet (XLSX): Gartenwelt GmbH, a German supplier. German headings and text;
// one product with no description, one with no price (held), one unmapped category.
const sheet = [
  ["Artikelnummer", "EAN", "Bezeichnung", "Marke", "Beschreibung", "Kategorie", "Preis", "Währung", "Bild", "Gewicht"],
  ["GW-7001", SECATEURS, "Bypass-Gartenschere", "GreenEdge", "Scharfe Bypass-Gartenschere aus gehärtetem Stahl für frische Zweige bis 20 mm.", "Gartenwerkzeug", 16.5, "GBP", img("GW-7001"), "250 g"],
  ["GW-7002", SPADE, "Spaten mit Eschenholzstiel", "GreenEdge", "Robuster Spaten mit Stahlblatt und Stiel aus Eschenholz.", "Gartenwerkzeug", 27.9, "GBP", img("GW-7002"), "1,8 kg"],
  ["GW-7003", ean(703), "Gießkanne 10 Liter", "Gartenwelt", "Kunststoff-Gießkanne mit abnehmbarer Brause.", "Bewässerung", 12.5, "GBP", img("GW-7003"), "800 g"],
  ["GW-7004", ean(704), "Gartenhandschuhe", "Gartenwelt", "", "Schutzkleidung", 7.95, "GBP", img("GW-7004"), "120 g"],
  ["GW-7005", ean(705), "Schlauchtrommel 30 m", "Gartenwelt", "Schlauchtrommel mit Kurbel, für 30 m Gartenschlauch.", "Bewässerung", "", "GBP", img("GW-7005"), "4,2 kg"],
];
out("spreadsheet/gartenwelt-preisliste.xlsx", xlsx(sheet, { sheetName: "Preisliste" }));

// 4. Website (HTML): Garden Direct, one static page of product cards.
const site = [
  { sku: "GD-11", gtin: SECATEURS, name: "GreenEdge bypass secateurs", brand: "GreenEdge", description: "Hardened steel bypass secateurs for clean cuts on live stems.", category: "Garden tools", price: "£14.99", image: "../images/gd-11.png" },
  { sku: "GD-12", gtin: SPADE, name: "GreenEdge digging spade", brand: "GreenEdge", description: "Steel-bladed digging spade with an ash handle and a D grip.", category: "Garden tools", price: "£29.99", image: "../images/gd-12.png" },
  { sku: "GD-13", gtin: ean(713), name: "Rain gauge", brand: "Garden Direct", description: "", category: "Watering", price: "£4.99", image: "../images/gd-13.png" },
  { sku: "GD-14", gtin: ean(714), name: "Oscillating sprinkler", brand: "Garden Direct", description: "Covers up to 200 square metres with an adjustable arc.", category: "Watering", price: "£17.50", image: "../images/gd-14.png" },
];
const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>Garden Direct (made up) – all products</title></head>
<body>
  <header><h1>Garden Direct</h1><p>A made-up supplier for the ACME test client. Not a real shop.</p></header>
  <main class="catalogue">
${site.map((p) => `    <div class="product">
      <img class="photo" src="${p.image}" alt="${esc(p.name)}">
      <h2 class="name">${esc(p.name)}</h2>
      <p class="brand">${esc(p.brand)}</p>
      <p class="description">${esc(p.description)}</p>
      <span class="category">${esc(p.category)}</span>
      <span class="price">${esc(p.price)}</span>
      <span class="sku">${p.sku}</span>
      <span class="gtin">${p.gtin}</span>
    </div>`).join("\n")}
  </main>
</body>
</html>
`;
out("website/index.html", html);

// Product images: a plain coloured square per product, so every image URL resolves.
function png(size, [r, g, b]) {
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(size * 3).map((_, i) => [r, g, b][i % 3])]);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.concat(Array(size).fill(row)))), chunk("IEND", Buffer.alloc(0))]);
}
const skus = [...feed.map((p) => p.sku), ...[...api.data.map((p) => p.id), "KC-03"].sort(), ...sheet.slice(1).map((r) => r[0]), ...site.map((p) => p.sku)];
skus.forEach((sku, i) => out(`images/${sku.toLowerCase()}.png`, png(64, [60 + ((i * 37) % 160), 90 + ((i * 53) % 140), 120 + ((i * 29) % 120)])));
console.log(`Built ${skus.length} products' files`);
