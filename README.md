# hco-acme-test-data

Made-up supplier files for **ACME**, Hockham & Co's fake test client for Intelligent Products
(HCP-129, epic HCP-113). Every supplier, product, barcode and price here is invented. ACME is
kept separate from the product: nothing in this repo is part of `hco-intelligent-products`.

| Source type | Supplier (made up) | File |
| --- | --- | --- |
| feed | Brightside Lighting | `feed/brightside-lighting.xml` |
| api | Kettle & Co | `api/v1/products.json` |
| spreadsheet | Gartenwelt GmbH (German) | `spreadsheet/gartenwelt-preisliste.xlsx` |
| website | Garden Direct | `website/index.html` |
| ftp | public read-only test server `ftp://test.rebex.net/readme.txt` (Ben's decision, 29 Sep 2026; not ACME-specific) | none here |

What the data exercises: a non-English supplier (German headings and text), missing descriptions,
American spelling to normalise, cross-supplier duplicates by GTIN with conflicting names and
prices (strip light: feed + API; secateurs and spade: spreadsheet + website), a product with no
price (held), an unmapped supplier category, parent/child, accessories, bundle and range
relationships, discontinued and recalled products, units (W/kW, g/kg), supplier categories,
prices and image URLs (`images/`, plain coloured squares).

ACME's settings live in the Confluence space ACME, not here. Rebuild the files with
`node tools/build.mjs`.

| feed (CSV) | Volume Supplies (acme-volume, HCP-266) | `volume/products.csv` (`node tools/volume.mjs [count]`) |

`volume/products.csv` times an upload at full volume (2,600 made-up products, like Artis UK). About a
third have no description, and every tenth name uses the supplier shorthand "S/S" for ACME's
Terminology rule. After the timing it is trimmed to a few products, so the rest are withdrawn and
aren't sent to Workers AI by the overnight enrichment job.
