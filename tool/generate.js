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
    return svg;
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

for (const category of categories) {
  const icons = byCategory[category];
  const lines = [];

  lines.push('// GENERATED FILE — DO NOT EDIT BY HAND.');
  lines.push('// Run `cd tool && npm run generate` to regenerate.');
  lines.push('//');
  lines.push(`// Category: ${category}`);
  lines.push('');
  lines.push("import '../retail_icon_data.dart';");
  lines.push('');
  lines.push(`// ignore_for_file: lines_longer_than_80_chars, constant_identifier_names`);
  lines.push('');
  lines.push(`/// IconPark icons — category: ${category}`);
  lines.push(`abstract final class RetailIcons${_pascalCase(category)} {`);

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

    lines.push(`  /// ${meta.name}`);
    lines.push(`  static const RetailIconData ${dartName} = RetailIconData(`);
    lines.push(`    name: '${meta.name}',`);
    lines.push(`    outline: ${dartString(svgs['outline'])},`);
    lines.push(`    filled: ${dartString(svgs['filled'])},`);
    lines.push(`    twoTone: ${dartString(twoToneSvg)},`);
    lines.push(`    multiColor: ${dartString(multiColorSvg)},`);
    lines.push(`  );`);
    lines.push('');

    categoryCount++;
  }

  lines.push('}');
  lines.push('');

  if (categoryCount === 0) continue;

  const fileName = `${category}.dart`;
  fs.writeFileSync(path.join(OUT_DIR, fileName), lines.join('\n'), 'utf8');
  generatedCategories.push({ category, fileName, count: categoryCount });
  totalIcons += categoryCount;
  console.log(`  ✓ ${category} (${categoryCount} icons) → ${fileName}`);
}

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
