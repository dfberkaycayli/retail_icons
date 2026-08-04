## 0.1.0

* **New:** `package:retail_icons/lookup.dart` — resolve icons by name at runtime,
  for icons chosen by a server rather than at compile time.
  * `RetailIconLookup.byName` returns the icon or `null`, leaving the fallback to
    the caller; `contains`, `names` and `length` round out the API.
  * `normalizeIconName` accepts the spellings backends actually send —
    `scan-code`, `scan_code`, `scanCode`, `assets/icons/scan-code.svg`.
  * Shipped as a separate library so that code which doesn't import it keeps full
    tree-shaking. Importing it adds the outline artwork of the whole catalogue
    (~1.8 MB of Dart source); see the README for why the other themes are excluded.
* **New:** `RetailIconData.outlineOnly` — backs the lookup path. Icons built this
  way render their outline artwork for every theme rather than failing.
* **Fixed:** the generator no longer emits randomly named `clipPath` ids, which
  made every regeneration produce a few hundred lines of meaningless diff. Ids are
  now derived from the icon name and theme, so output is reproducible. This
  rewrites the ids of previously generated icons — a one-time diff.

## 0.0.1

* Initial release — 2,658 ByteDance IconPark icons across 39 categories, in
  outline, filled, two-tone and multi-color themes, with dot-shorthand support.
