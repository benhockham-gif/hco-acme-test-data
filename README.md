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

HCP-310 (overnight enrichment throughput): the 2,600 products are restored with every name changed
("Kettle 1.7 L no. 7" for "Kettle 1.7 L 7"), so all of them are new or changed and the next night's
enrichment run is timed over all 2,600. Trimmed back to 10 products after the proof.

| feed (CSV) | Case Supplies (acme-case, HCP-288) | `case/products.csv` |

HCP-288 (price_each and price_per_pack): `volume/products.csv` has a `pack_size` column (two packs,
one sold singly, the rest blank) for a supplier priced **per item**; `case/products.csv` is a
supplier priced **per case** (cases of 6, 4 and 3, one with no pack size, one sold singly). Their
basis is set on ACME's IP Settings: Suppliers page, not here. 3.99 for 6 (0.665) and 4.99 for 4
(1.2475) show rounding half up after the calculation.

| feed (JSON) | Gallery Homeware (acme-gallery, HCP-271) | `gallery/products.json` |

HCP-271 (Publisher push to Infinite Images): four products, each with a main `image_url` plus an
`images` list of further pictures with attributes (`alt`, `version`). The proof changes one
picture's `version` (the change signal), removes one product (withdrawn) and sets one product's
`status` to `recalled` (ACME's Lifecycle Rules), one step at a time.
