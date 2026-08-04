#!/usr/bin/env node
/**
 * retail_icons code generator
 *
 * Generates Dart source files from ByteDance IconPark SVG data.
 *
 * Usage:
 *   cd tool && npm install && npm run generate
 *
 * Output:
 *   ../lib/src/icons/<category>.dart   — one file per category
 *   ../lib/src/retail_icons.dart       — master class that re-exports all icons
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Load IconPark data
// ---------------------------------------------------------------------------

// @icon-park/svg exports { getIconPark, ...iconFunctions } plus `icons` json
const iconParkSvg = require('@icon-park/svg');

// icons.json from @icon-park/svg lists metadata for every icon
const iconsMetaPath = path.join(
  __dirname,
  'node_modules/@icon-park/svg/icons.json'
);

if (!fs.existsSync(iconsMetaPath)) {
  console.error('icons.json not found — run `npm install` first.');
  process.exit(1);
}

const iconsMeta = JSON.parse(fs.readFileSync(iconsMetaPath, 'utf8'));

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const THEMES = ['outline', 'filled', 'two-tone', 'multi-color'];

// Default color palettes per theme (must match RetailIconData defaults in Dart)
const DEFAULT_PALETTE = {
  outline:       ['#333333'],
  filled:        ['#333333'],
  'two-tone':    ['#333333', '#2F88FF'],
  'multi-color': ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
};

const OUT_DIR = path.join(__dirname, '..', 'lib', 'src', 'icons');
const ICONS_CLASS_FILE = path.join(__dirname, '..', 'lib', 'src', 'retail_icons.dart');
const ICON_DATA_FILE = path.join(__dirname, '..', 'lib', 'src', 'retail_icon_data.dart');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a kebab-case or snake_case name to lowerCamelCase Dart identifier.
 * Also handles reserved Dart keywords.
 */
const DART_KEYWORDS = new Set([
  'abstract','as','assert','async','await','base','break','case','catch',
  'class','const','continue','covariant','default','deferred','do','dynamic',
  'else','enum','export','extends','extension','external','factory','false',
  'final','finally','for','Function','get','hide','if','implements','import',
  'in','interface','is','late','library','mixin','new','null','on','operator',
  'part','required','rethrow','return','sealed','set','show','static','super',
  'switch','sync','this','throw','true','try','type','typedef','var','void',
  'when','while','with','yield',
]);

function toCamelCase(name) {
  const camel = name
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
  return DART_KEYWORDS.has(camel) ? `${camel}Icon` : camel;
}

/**
 * Escape a string for use as a Dart raw string literal r'...'.
 * Raw strings don't process escape sequences, so we only need to avoid
 * the closing quote + optional dollar sign. We use triple-quoted strings
 * to be safe with any SVG content.
 */
function dartString(str) {
  // Use triple single-quoted raw string: r'''...'''
  // The only thing we must avoid is ''' inside the SVG (extremely unlikely).
  // Just in case, replace any ''' sequence.
  const safe = str.replace(/'''/g, "''\\''");
  return `r'''${safe}'''`;
}

/**
 * Replace IconPark's randomly generated element ids with deterministic ones.
 *
 * @icon-park/svg mints a fresh `icon-<random hex>` id for every clipPath on
 * every call, so regenerating produced a few hundred lines of diff that changed
 * nothing. Deriving the id from the icon name and theme keeps each document's
 * internal references intact while making the output reproducible.
 */
function stabilizeIds(svg, iconName, theme) {
  const ids = [];
  for (const [id] of svg.matchAll(/icon-[0-9a-f]{6,}/g)) {
    if (!ids.includes(id)) ids.push(id);
  }
  if (ids.length === 0) return svg;

  let result = svg;
  ids.forEach((id, index) => {
    const suffix = ids.length > 1 ? `-${index}` : '';
    result = result.split(id).join(`icon-${iconName}-${theme}${suffix}`);
  });
  return result;
}

/**
 * Inject color slot placeholders (`__COLOR_N__`) into an SVG so that
 * RetailIconData._replaceColors() can substitute them at runtime.
 *
 * For outline/filled we leave the SVG unchanged (they use `currentColor`
 * which flutter_svg handles via ColorFilter).
 * For two-tone/multi-color we replace:
 *   - `currentColor` → `__COLOR_0__`  (primary / stroke color)
 *   - each subsequent palette entry → `__COLOR_N__`
 */
function injectColorPlaceholders(svg, theme, palette) {
  if (theme === 'outline' || theme === 'filled') return svg;

  let result = svg;
  // Replace currentColor first (color[0] = primary stroke/fill color)
  result = result.replace(/currentColor/gi, '__COLOR_0__');

  // Replace subsequent palette hex values (color[1], color[2], …)
  for (let i = 1; i < palette.length; i++) {
    const color = palette[i];
    const escaped = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the hex color case-insensitively and also normalise #FFF → #FFFFFF
    const short = color.length === 4
      ? color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      : null;
    result = result.replace(new RegExp(escaped, 'gi'), `__COLOR_${i}__`);
    if (short) {
      const shortEscaped = ('#' + short).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(shortEscaped, 'gi'), `__COLOR_${i}__`);
    }
  }
  return result;
}

/**
 * Generate the SVG string for one icon + theme combo via @icon-park/svg.
 * Returns null if the icon function doesn't exist.
 */
function getSvg(iconName, theme) {
  // @icon-park/svg exports PascalCase function names
  const fnName = iconName
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

  const fn = iconParkSvg[fnName];
  if (typeof fn !== 'function') return null;

  const palette = DEFAULT_PALETTE[theme];
  try {
    const svg = fn({
      theme,
      size: 48,
      strokeWidth: 4,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      colors: palette,
    });
    return stabilizeIds(svg, iconName, theme);
  } catch (_) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Group icons by category
// ---------------------------------------------------------------------------

const byCategory = {};
for (const meta of iconsMeta) {
  const cat = (meta.category || 'other')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(meta);
}

const categories = Object.keys(byCategory).sort();

// ---------------------------------------------------------------------------
// Generate one Dart file per category
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });

const generatedCategories = [];
let totalIcons = 0;

// Collect all icons in a flat list (for RetailIconData statics)
const allIcons = []; // { dartName, name, outline, filled, twoTone, multiColor }

for (const category of categories) {
  const icons = byCategory[category];
  const aliasLines = [];

  aliasLines.push('// GENERATED FILE — DO NOT EDIT BY HAND.');
  aliasLines.push('// Run `cd tool && npm run generate` to regenerate.');
  aliasLines.push('//');
  aliasLines.push(`// Category: ${category}`);
  aliasLines.push('');
  aliasLines.push("import '../retail_icon_data.dart';");
  aliasLines.push('');
  aliasLines.push(`// ignore_for_file: lines_longer_than_80_chars, constant_identifier_names`);
  aliasLines.push('');
  aliasLines.push(`/// IconPark icons — category: ${category}`);
  aliasLines.push(`abstract final class RetailIcons${_pascalCase(category)} {`);

  let categoryCount = 0;

  for (const meta of icons) {
    const dartName = toCamelCase(meta.name);
    const svgs = {};
    let allOk = true;

    for (const theme of THEMES) {
      const svg = getSvg(meta.name, theme);
      if (!svg) { allOk = false; break; }
      svgs[theme] = svg;
    }

    if (!allOk) {
      console.warn(`  ⚠ Skipping ${meta.name} (could not generate all themes)`);
      continue;
    }

    // Inject color placeholders for two-tone and multi-color
    const twoToneSvg = injectColorPlaceholders(
      svgs['two-tone'],
      'two-tone',
      DEFAULT_PALETTE['two-tone'],
    );
    const multiColorSvg = injectColorPlaceholders(
      svgs['multi-color'],
      'multi-color',
      DEFAULT_PALETTE['multi-color'],
    );

    // Collect icon for flat list (used to generate RetailIconData statics)
    allIcons.push({ dartName, name: meta.name, outline: svgs['outline'], filled: svgs['filled'], twoTone: twoToneSvg, multiColor: multiColorSvg });

    // Category file: thin alias pointing to RetailIconData static
    aliasLines.push(`  /// ${meta.name}`);
    aliasLines.push(`  static const RetailIconData ${dartName} = RetailIconData.${dartName};`);
    aliasLines.push('');

    categoryCount++;
  }

  aliasLines.push('}');
  aliasLines.push('');

  if (categoryCount === 0) continue;

  const fileName = `${category}.dart`;
  fs.writeFileSync(path.join(OUT_DIR, fileName), aliasLines.join('\n'), 'utf8');
  generatedCategories.push({ category, fileName, count: categoryCount });
  totalIcons += categoryCount;
  console.log(`  ✓ ${category} (${categoryCount} icons) → ${fileName}`);
}

// ---------------------------------------------------------------------------
// Generate retail_icon_data.dart with class definition + all icon statics
// ---------------------------------------------------------------------------

const iconDataLines = [];
iconDataLines.push('// GENERATED FILE — DO NOT EDIT BY HAND.');
iconDataLines.push('// Run `cd tool && npm run generate` to regenerate.');
iconDataLines.push('//');
iconDataLines.push(`// Total icons: ${totalIcons}`);
iconDataLines.push('');
iconDataLines.push("import 'retail_icon_theme.dart';");
iconDataLines.push('');
iconDataLines.push('// ignore_for_file: lines_longer_than_80_chars, constant_identifier_names');
iconDataLines.push('');
iconDataLines.push('/// Holds the SVG source strings for all themes of a single icon.');
iconDataLines.push('///');
iconDataLines.push('/// Unused theme strings are removed by the Dart compiler\'s tree-shaker —');
iconDataLines.push('/// only the themes actually referenced in your code are bundled.');
iconDataLines.push('///');
iconDataLines.push('/// **Color model**');
iconDataLines.push('///');
iconDataLines.push('/// - [IconParkTheme.outline] / [IconParkTheme.filled]: the SVG uses the CSS');
iconDataLines.push('///   keyword `currentColor` for its single stroke/fill color. Pass a [Color]');
iconDataLines.push('///   to [RetailIcon.color] and it will be applied via Flutter\'s `colorFilter`.');
iconDataLines.push('///');
iconDataLines.push('/// - [IconParkTheme.twoTone] / [IconParkTheme.multiColor]: the SVG stores up');
iconDataLines.push('///   to four color slots as `__COLOR_0__` … `__COLOR_3__` tokens. These are');
iconDataLines.push('///   replaced at runtime by [svgString] with either the caller-supplied');
iconDataLines.push('///   [colors] or the [defaultTwoToneColors] / [defaultMultiColors] defaults.');
iconDataLines.push('class RetailIconData {');
iconDataLines.push('  /// The unique identifier / name of this icon (e.g. `"camera"`).');
iconDataLines.push('  final String name;');
iconDataLines.push('');
iconDataLines.push('  final String _outline;');
iconDataLines.push('  final String _filled;');
iconDataLines.push('  final String _twoTone;');
iconDataLines.push('  final String _multiColor;');
iconDataLines.push('');
iconDataLines.push('  const RetailIconData({');
iconDataLines.push('    required this.name,');
iconDataLines.push('    required String outline,');
iconDataLines.push('    required String filled,');
iconDataLines.push('    required String twoTone,');
iconDataLines.push('    required String multiColor,');
iconDataLines.push('  })  : _outline = outline,');
iconDataLines.push('        _filled = filled,');
iconDataLines.push('        _twoTone = twoTone,');
iconDataLines.push('        _multiColor = multiColor;');
iconDataLines.push('');
iconDataLines.push('  /// Default two-tone color palette (matching IconPark defaults).');
iconDataLines.push('  static const List<String> defaultTwoToneColors = [\'#333333\', \'#2F88FF\'];');
iconDataLines.push('');
iconDataLines.push('  /// Default multi-color palette (matching IconPark defaults).');
iconDataLines.push('  static const List<String> defaultMultiColors = [');
iconDataLines.push('    \'#333333\',');
iconDataLines.push('    \'#2F88FF\',');
iconDataLines.push('    \'#FFFFFF\',');
iconDataLines.push('    \'#43CCF8\',');
iconDataLines.push('  ];');
iconDataLines.push('');
iconDataLines.push('  /// Returns the raw SVG string for [theme].');
iconDataLines.push('  ///');
iconDataLines.push('  /// - For [IconParkTheme.outline] and [IconParkTheme.filled] the SVG is');
iconDataLines.push('  ///   returned as-is (it uses `currentColor`). Apply a color via');
iconDataLines.push('  ///   [RetailIcon.color].');
iconDataLines.push('  /// - For [IconParkTheme.twoTone] and [IconParkTheme.multiColor] the color');
iconDataLines.push('  ///   slot tokens are replaced with [colors] (or sensible defaults when');
iconDataLines.push('  ///   [colors] is `null`).');
iconDataLines.push('  String svgString({');
iconDataLines.push('    IconParkTheme theme = IconParkTheme.outline,');
iconDataLines.push('    List<String>? colors,');
iconDataLines.push('  }) {');
iconDataLines.push('    switch (theme) {');
iconDataLines.push('      case IconParkTheme.outline:');
iconDataLines.push('        return _outline;');
iconDataLines.push('      case IconParkTheme.filled:');
iconDataLines.push('        return _filled;');
iconDataLines.push('      case IconParkTheme.twoTone:');
iconDataLines.push('        return _replaceColors(_twoTone, colors ?? defaultTwoToneColors);');
iconDataLines.push('      case IconParkTheme.multiColor:');
iconDataLines.push('        return _replaceColors(_multiColor, colors ?? defaultMultiColors);');
iconDataLines.push('    }');
iconDataLines.push('  }');
iconDataLines.push('');
iconDataLines.push('  /// Replaces `__COLOR_0__` … `__COLOR_N__` tokens inside [svg] with the');
iconDataLines.push('  /// corresponding values from [colors].');
iconDataLines.push('  static String _replaceColors(String svg, List<String> colors) {');
iconDataLines.push('    var result = svg;');
iconDataLines.push('    for (var i = 0; i < colors.length; i++) {');
iconDataLines.push("      result = result.replaceAll('__COLOR_${i}__', colors[i]);");
iconDataLines.push('    }');
iconDataLines.push('    return result;');
iconDataLines.push('  }');
iconDataLines.push('');
iconDataLines.push('  // ---- ICON CONSTANTS ----');
iconDataLines.push('  // Use dot-shorthand syntax: RetailIcon(.camera)');
iconDataLines.push('  // Requires Dart 3.5+ static access shorthand.');
iconDataLines.push('');

for (const icon of allIcons) {
  iconDataLines.push(`  /// ${icon.name}`);
  iconDataLines.push(`  static const RetailIconData ${icon.dartName} = RetailIconData(`);
  iconDataLines.push(`    name: '${icon.name}',`);
  iconDataLines.push(`    outline: ${dartString(icon.outline)},`);
  iconDataLines.push(`    filled: ${dartString(icon.filled)},`);
  iconDataLines.push(`    twoTone: ${dartString(icon.twoTone)},`);
  iconDataLines.push(`    multiColor: ${dartString(icon.multiColor)},`);
  iconDataLines.push(`  );`);
  iconDataLines.push('');
}

iconDataLines.push('}');
iconDataLines.push('');

fs.writeFileSync(ICON_DATA_FILE, iconDataLines.join('\n'), 'utf8');
console.log(`  ✓ retail_icon_data.dart (${allIcons.length} icon statics)`);

// ---------------------------------------------------------------------------
// Generate the master retail_icons.dart
// ---------------------------------------------------------------------------

const masterLines = [];
masterLines.push('// GENERATED FILE — DO NOT EDIT BY HAND.');
masterLines.push('// Run `cd tool && npm run generate` to regenerate.');
masterLines.push('//');
masterLines.push(`// Total icons: ${totalIcons}`);
masterLines.push('');
masterLines.push("export 'retail_icon_data.dart';");
masterLines.push('');

for (const { fileName } of generatedCategories) {
  masterLines.push(`export 'icons/${fileName}';`);
}

masterLines.push('');

fs.writeFileSync(ICONS_CLASS_FILE, masterLines.join('\n'), 'utf8');

console.log('');
console.log(`✅ Done! Generated ${totalIcons} icons across ${generatedCategories.length} categories.`);
console.log(`   → lib/src/icons/<category>.dart`);
console.log(`   → lib/src/retail_icons.dart`);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function _pascalCase(str) {
  return str
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}
