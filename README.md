# retail_icons

ByteDance [IconPark](https://github.com/bytedance/IconPark) icon library for Flutter.

- **2,658 icons** across 39 categories
- **4 themes**: outline, filled, two-tone, multi-color
- **Tree-shaking**: only icons you reference are compiled into your app
- **No extra assets**: SVG data is embedded as Dart constants
- **Server-driven icons**: opt in to runtime name lookup via a separate import
- Single dependency: [`flutter_svg`](https://pub.dev/packages/flutter_svg)

## Installation

```yaml
dependencies:
  retail_icons: ^0.1.0
```

## Usage

```dart
import 'package:retail_icons/retail_icons.dart';

// Outline (default)
RetailIcon(.camera)

// Outline with explicit color and size
RetailIcon(.camera, color: Colors.blue, size: 32)

// Filled theme
RetailIcon(.camera, theme: .filled)

// Two-tone (2 customizable color slots)
RetailIcon(
  .camera,
  theme: .twoTone,
  colors: ['#333333', '#2F88FF'],   // optional — uses IconPark defaults when omitted
)

// Multi-color (up to 4 color slots)
RetailIcon(
  .camera,
  theme: .multiColor,
  colors: ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
)
```

> **Note:** The dot-shorthand syntax (`.camera`, `.filled`, …) requires Dart 3.5+ and is
> resolved at compile time — no runtime overhead.

## Server-driven icons

When the icon isn't known until runtime — a menu whose items come from an API, for
example — import the separate `lookup` library and resolve by name:

```dart
import 'package:retail_icons/retail_icons.dart';
import 'package:retail_icons/lookup.dart';

final icon = RetailIconLookup.byName(menuItem.icon) ?? RetailIconData.help;
return RetailIcon(icon);
```

`byName` returns `null` for an unknown name instead of throwing, so the fallback is
yours to choose. It accepts the spellings a backend is likely to send — all of
`scan-code`, `scan_code`, `scanCode` and `assets/icons/scan-code.svg` resolve to the
same icon.

**This import has a cost, by design.** `RetailIconData` keeps all four themes of an
icon in one const object, so a map over those constants would retain every theme of
every icon and defeat tree-shaking entirely. The lookup table therefore stores the
outline artwork separately (~1.8 MB of Dart source for all 2,658 icons) and lives
behind its own import: code that never imports `lookup.dart` is unaffected and keeps
full tree-shaking.

Two consequences worth knowing:

- Icons resolved by name carry **outline artwork only**. Passing another theme to
  `RetailIcon` renders the outline rather than failing.
- Keep using `RetailIcon(.camera)` wherever the icon *is* known at compile time.
  Reach for `byName` only for the genuinely dynamic cases.

## Icon categories

All 2,658 icons are accessible directly via dot-shorthand. Category-scoped classes are
also available for backward compatibility:

```dart
RetailIcon(.shoppingCart)          // dot-shorthand (preferred)
RetailIcon(RetailIconsMoney.shoppingCart)  // category-scoped (still works)
```

Icons are grouped into static classes by category:

| Class | Category | Count |
|---|---|---|
| `RetailIconsAbstract` | Abstract | 121 |
| `RetailIconsAnimals` | Animals | 36 |
| `RetailIconsArrows` | Arrows | 137 |
| `RetailIconsBase` | Base / UI | 55 |
| `RetailIconsBrand` | Brand | 83 |
| `RetailIconsBuild` | Build | 70 |
| `RetailIconsCharts` | Charts | 68 |
| `RetailIconsClothes` | Clothes | 72 |
| `RetailIconsEdit` | Edit | 364 |
| `RetailIconsFoods` | Foods | 121 |
| `RetailIconsHardware` | Hardware | 223 |
| `RetailIconsMoney` | Money | 80 |
| `RetailIconsOffice` | Office | 215 |
| `RetailIconsPeoples` | Peoples | 50 |
| `RetailIconsSports` | Sports | 84 |
| `RetailIconsTravel` | Travel | 101 |
| … | *39 total* | 2,658 |

## Regenerating icons

Icons are generated from `@icon-park/svg`. To regenerate after upstream updates:

```bash
cd tool
npm install
npm run generate
```

## License

Apache-2.0 — see [LICENSE](LICENSE).
Icons © ByteDance (IconPark) — Apache-2.0.

## Contributing

[github.com/dfberkaycayli/retail_icons](https://github.com/dfberkaycayli/retail_icons)
