/// ByteDance IconPark icon library for Flutter.
///
/// Provides 2658 icons across 39 categories with full support for
/// **outline**, **filled**, **two-tone** and **multi-color** themes.
///
/// ## Quick start
///
/// ```dart
/// import 'package:retail_icons/retail_icons.dart';
///
/// // Outline (default)
/// RetailIcon(RetailIconsEdit.camera)
///
/// // Filled with a custom color
/// RetailIcon(
///   RetailIconsEdit.camera,
///   theme: IconParkTheme.filled,
///   color: Colors.blue,
/// )
///
/// // Two-tone with custom accent color
/// RetailIcon(
///   RetailIconsEdit.camera,
///   theme: IconParkTheme.twoTone,
///   colors: ['#333333', '#2F88FF'],
/// )
///
/// // Multi-color
/// RetailIcon(
///   RetailIconsEdit.camera,
///   theme: IconParkTheme.multiColor,
///   colors: ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
/// )
/// ```
library;

export 'src/retail_icon.dart';
export 'src/retail_icon_data.dart';
export 'src/retail_icon_theme.dart';
export 'src/retail_icons.dart';
