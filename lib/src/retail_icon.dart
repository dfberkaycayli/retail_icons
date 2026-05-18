import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'retail_icon_data.dart';
import 'retail_icon_theme.dart';

/// A widget that displays a ByteDance IconPark icon.
///
/// **Outline / Filled**
/// ```dart
/// RetailIcon(RetailIcons.camera)                          // outline, black
/// RetailIcon(RetailIcons.camera, color: Colors.blue)      // outline, blue
/// RetailIcon(RetailIcons.camera, theme: IconParkTheme.filled)
/// ```
///
/// **Two-tone** (2 colors)
/// ```dart
/// RetailIcon(
///   RetailIcons.camera,
///   theme: IconParkTheme.twoTone,
///   // optional — falls back to IconPark defaults when omitted
///   colors: ['#333333', '#2F88FF'],
/// )
/// ```
///
/// **Multi-color** (up to 4 colors)
/// ```dart
/// RetailIcon(
///   RetailIcons.camera,
///   theme: IconParkTheme.multiColor,
///   colors: ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
/// )
/// ```
class RetailIcon extends StatelessWidget {
  const RetailIcon(
    this.icon, {
    super.key,
    this.theme = IconParkTheme.outline,
    this.size = 24.0,
    this.color,
    this.colors,
    this.semanticLabel,
  });

  /// The icon to display.
  final RetailIconData icon;

  /// The visual theme to apply. Defaults to [IconParkTheme.outline].
  final IconParkTheme theme;

  /// Width and height of the icon in logical pixels. Defaults to `24`.
  final double size;

  /// Color for [IconParkTheme.outline] and [IconParkTheme.filled] themes.
  ///
  /// These SVGs use the CSS `currentColor` keyword, so the color is applied
  /// via a [ColorFilter]. Has no effect when [colors] is provided or when
  /// [theme] is [IconParkTheme.twoTone] / [IconParkTheme.multiColor].
  final Color? color;

  /// Ordered list of hex-color strings used for two-tone and multi-color
  /// themes (e.g. `['#333333', '#2F88FF']`).
  ///
  /// Replaces the `__COLOR_N__` tokens embedded by the code generator.
  /// When omitted the icon renders with the original IconPark default palette.
  final List<String>? colors;

  /// Optional semantic label for accessibility / screen readers.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final svgString = icon.svgString(theme: theme, colors: colors);

    ColorFilter? colorFilter;
    if (color != null &&
        (theme == IconParkTheme.outline || theme == IconParkTheme.filled)) {
      colorFilter = ColorFilter.mode(color!, BlendMode.srcIn);
    }

    return Semantics(
      label: semanticLabel ?? icon.name,
      child: SvgPicture.string(
        svgString,
        width: size,
        height: size,
        colorFilter: colorFilter,
      ),
    );
  }
}
