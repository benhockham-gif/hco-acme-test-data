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

HCP-302 (Infinite Search filters, Ben's approval 2 Oct 2026): the Brightside feed carries `supplier_name`,
`product_range` and `stock`, and the Kettle & Co API carries `vendor` and `collection` (its `availability`
was already there). ACME's IP Settings map them to the custom fields `supplier`, `range` and `availability`,
granted to `acme-search` only, so every Infinite Search filter (HCP-272 §4) has values. KC-06 has neither
new field, so the strip light it shares with BL-500 takes Brightside's values with no conflict to review.

HCP-280 (Infinite Images end-to-end proof on ACME): five more Gallery Homeware products with **real third-party image
URLs**, pushed by ACME's Products Publisher to the Infinite Images Loader. GL-101 has three working pictures (a
2400×1600 JPEG at an address with no extension, a PNG and a WebP, two with `alt`), GL-102 one working picture (made
unservable in the proof), GL-103 a Wikimedia address that is a real **404**, GL-104 Gravatar's default picture, a
real **placeholder served with HTTP 200**, and GL-105 **no images at all**.

| feed (CSV) | Size Supplies (size-co, HCP-315) | `size/products.csv` |

HCP-315 (size_cm and size_in): made-up products whose names state a size in cm and inches
(SZ-1, `30cm [11.8"]` -> 30 / 11.8, its length 26.5cm not used), in cm only (SZ-2, 16.5 -> 6.5 in),
in inches only (SZ-7, `12"` -> 30.5 / 12), a real diameter that wins over the name (SZ-3, 28.8cm
against "28cm" -> 28.8 / 11.3), two unclear names (SZ-4 `53 X 32.5CM`, SZ-5 `150mm Deep`: no size,
an info note) and no size at all (SZ-6).
