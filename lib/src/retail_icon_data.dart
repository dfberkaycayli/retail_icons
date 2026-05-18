import 'retail_icon_theme.dart';

/// Holds the SVG source strings for all themes of a single icon.
///
/// Unused theme strings are removed by the Dart compiler's tree-shaker —
/// only the themes actually referenced in your code are bundled.
///
/// **Color model**
///
/// - [IconParkTheme.outline] / [IconParkTheme.filled]: the SVG uses the CSS
///   keyword `currentColor` for its single stroke/fill color. Pass a [Color]
///   to [RetailIcon.color] and it will be applied via Flutter's `colorFilter`.
///
/// - [IconParkTheme.twoTone] / [IconParkTheme.multiColor]: the SVG stores up
///   to four color slots as `__COLOR_0__` … `__COLOR_3__` tokens. These are
///   replaced at runtime by [svgString] with either the caller-supplied
///   [colors] or the [defaultTwoToneColors] / [defaultMultiColors] defaults.
class RetailIconData {
  /// The unique identifier / name of this icon (e.g. `"camera"`).
  final String name;

  final String _outline;
  final String _filled;
  final String _twoTone;
  final String _multiColor;

  const RetailIconData({
    required this.name,
    required String outline,
    required String filled,
    required String twoTone,
    required String multiColor,
  })  : _outline = outline,
        _filled = filled,
        _twoTone = twoTone,
        _multiColor = multiColor;

  /// Default two-tone color palette (matching IconPark defaults).
  static const List<String> defaultTwoToneColors = ['#333333', '#2F88FF'];

  /// Default multi-color palette (matching IconPark defaults).
  static const List<String> defaultMultiColors = [
    '#333333',
    '#2F88FF',
    '#FFFFFF',
    '#43CCF8',
  ];

  /// Returns the raw SVG string for [theme].
  ///
  /// - For [IconParkTheme.outline] and [IconParkTheme.filled] the SVG is
  ///   returned as-is (it uses `currentColor`). Apply a color via
  ///   [RetailIcon.color].
  /// - For [IconParkTheme.twoTone] and [IconParkTheme.multiColor] the color
  ///   slot tokens are replaced with [colors] (or sensible defaults when
  ///   [colors] is `null`).
  String svgString({
    IconParkTheme theme = IconParkTheme.outline,
    List<String>? colors,
  }) {
    switch (theme) {
      case IconParkTheme.outline:
        return _outline;
      case IconParkTheme.filled:
        return _filled;
      case IconParkTheme.twoTone:
        return _replaceColors(_twoTone, colors ?? defaultTwoToneColors);
      case IconParkTheme.multiColor:
        return _replaceColors(_multiColor, colors ?? defaultMultiColors);
    }
  }

  /// Replaces `__COLOR_0__` … `__COLOR_N__` tokens inside [svg] with the
  /// corresponding values from [colors].
  static String _replaceColors(String svg, List<String> colors) {
    var result = svg;
    for (var i = 0; i < colors.length; i++) {
      result = result.replaceAll('__COLOR_${i}__', colors[i]);
    }
    return result;
  }
}
