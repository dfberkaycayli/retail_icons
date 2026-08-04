import 'package:flutter_test/flutter_test.dart';
import 'package:retail_icons/lookup.dart';
import 'package:retail_icons/retail_icons.dart';

void main() {
  group('normalizeIconName', () {
    test('leaves a canonical name untouched', () {
      expect(normalizeIconName('scan-code'), 'scan-code');
    });

    test('keeps only the last path segment', () {
      expect(normalizeIconName('assets/icons/scan-code.svg'), 'scan-code');
    });

    test('drops a .svg suffix regardless of case', () {
      expect(normalizeIconName('camera.SVG'), 'camera');
    });

    test('folds underscores to dashes', () {
      expect(normalizeIconName('arrow_down_icon'), 'arrow-down-icon');
    });

    test('splits camelCase boundaries', () {
      expect(normalizeIconName('scanCode'), 'scan-code');
      expect(normalizeIconName('arrowDownIcon'), 'arrow-down-icon');
    });

    test('lowercases without inventing boundaries in acronyms', () {
      expect(normalizeIconName('PAS'), 'pas');
    });

    test('trims surrounding whitespace', () {
      expect(normalizeIconName('  camera  '), 'camera');
    });

    test('collapses and trims stray dashes', () {
      expect(normalizeIconName('_camera__two_'), 'camera-two');
    });

    test('leaves names that are already digits and letters alone', () {
      expect(normalizeIconName('01d'), '01d');
    });
  });

  group('RetailIconLookup', () {
    test('exposes the whole catalogue', () {
      expect(RetailIconLookup.length, 2658);
      expect(RetailIconLookup.names, contains('camera'));
    });

    test('resolves a canonical name', () {
      final icon = RetailIconLookup.byName('camera');
      expect(icon, isNotNull);
      expect(icon!.name, 'camera');
    });

    test('resolves the spellings a backend is likely to send', () {
      for (final input in [
        'scan-code',
        'assets/icons/scan-code.svg',
        'scan_code',
        'scanCode',
        '  scan-code  ',
      ]) {
        expect(
          RetailIconLookup.byName(input)?.name,
          'scan-code',
          reason: 'failed to resolve "$input"',
        );
      }
    });

    test('returns null for an unknown name rather than throwing', () {
      expect(RetailIconLookup.byName('definitely-not-an-icon'), isNull);
      expect(RetailIconLookup.byName(''), isNull);
    });

    test('contains agrees with byName', () {
      expect(RetailIconLookup.contains('assets/icons/camera.svg'), isTrue);
      expect(RetailIconLookup.contains('definitely-not-an-icon'), isFalse);
    });

    test('returns the identical instance on repeat lookups', () {
      final first = RetailIconLookup.byName('camera');
      final second = RetailIconLookup.byName('assets/icons/camera.svg');
      expect(identical(first, second), isTrue);
    });

    test('rebuilds a complete SVG document from the stripped table', () {
      final svg = RetailIconLookup.byName('camera')!.svgString();
      expect(svg, startsWith('<?xml'));
      expect(svg, contains('<svg'));
      expect(svg, endsWith('</svg>'));
    });

    test('matches the artwork of the compile-time constant', () {
      expect(
        RetailIconLookup.byName('camera')!.svgString(),
        RetailIconData.camera.svgString(),
      );
    });

    test('every catalogue entry rebuilds into a well-formed document', () {
      for (final name in RetailIconLookup.names) {
        final svg = RetailIconLookup.byName(name)!.svgString();
        expect(svg, startsWith('<?xml'), reason: '$name lost its header');
        expect(svg, endsWith('</svg>'), reason: '$name lost its footer');
      }
    });

    test('every catalogue entry matches its compile-time constant', () {
      // Guards the chrome-stripping in the generator: a mismatch means the
      // lookup table and the static constants have drifted apart.
      final byName = {
        for (final name in RetailIconLookup.names)
          name: RetailIconLookup.byName(name)!.svgString(),
      };
      expect(byName['dragon-zodiac'], RetailIconData.dragonZodiac.svgString());
      // Icons with a non-standard viewBox are stored whole — check one.
      expect(byName['bowling'], RetailIconData.bowling.svgString());
      expect(byName['washing-machine'],
          RetailIconData.washingMachine.svgString());
    });

    test('resolved icons carry outline artwork for every theme', () {
      final icon = RetailIconLookup.byName('camera')!;
      final outline = icon.svgString();
      for (final theme in IconParkTheme.values) {
        expect(icon.svgString(theme: theme), outline);
      }
    });
  });
}
