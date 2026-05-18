import 'package:flutter_test/flutter_test.dart';
import 'package:retail_icons/retail_icons.dart';

void main() {
  group('RetailIconData', () {
    test('svgString returns outline SVG unchanged', () {
      final svg = RetailIconsBase.camera.svgString();
      expect(svg, isNotEmpty);
      expect(svg, contains('<svg'));
    });

    test('svgString twoTone replaces color placeholders', () {
      final svg = RetailIconsBase.camera.svgString(
        theme: IconParkTheme.twoTone,
        colors: ['#FF0000', '#00FF00'],
      );
      expect(svg, contains('#FF0000'));
      expect(svg, contains('#00FF00'));
      expect(svg, isNot(contains('__COLOR_0__')));
      expect(svg, isNot(contains('__COLOR_1__')));
    });

    test('svgString twoTone uses default colors when none provided', () {
      final svg =
          RetailIconsBase.camera.svgString(theme: IconParkTheme.twoTone);
      expect(svg, isNot(contains('__COLOR_0__')));
      expect(svg, isNot(contains('__COLOR_1__')));
    });

    test('name is set correctly', () {
      expect(RetailIconsBase.camera.name, 'camera');
    });
  });
}
