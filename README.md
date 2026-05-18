# retail_icons

ByteDance [IconPark](https://github.com/bytedance/IconPark) icon library for Flutter.

- **2,658 icons** across 39 categories
- **4 themes**: outline, filled, two-tone, multi-color
- **Tree-shaking**: only icons you reference are compiled into your app
- **No extra assets**: SVG data is embedded as Dart constants
- Single dependency: [`flutter_svg`](https://pub.dev/packages/flutter_svg)

## Installation

```yaml
dependencies:
  retail_icons: ^0.0.1
```

## Usage

```dart
import 'package:retail_icons/retail_icons.dart';

// Outline (default)
RetailIcon(RetailIconsBase.camera)

// Outline with explicit color and size
RetailIcon(RetailIconsBase.camera, color: Colors.blue, size: 32)

// Filled theme
RetailIcon(RetailIconsBase.camera, theme: IconParkTheme.filled)

// Two-tone (2 customizable color slots)
RetailIcon(
  RetailIconsBase.camera,
  theme: IconParkTheme.twoTone,
  colors: ['#333333', '#2F88FF'],   // optional — uses IconPark defaults when omitted
)

// Multi-color (up to 4 color slots)
RetailIcon(
  RetailIconsBase.camera,
  theme: IconParkTheme.multiColor,
  colors: ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
)
```

## Icon categories

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
