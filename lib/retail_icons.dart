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
/// // Outline (default) — dot-shorthand (Dart 3.5+)
/// RetailIcon(.camera)
///
/// // Filled with a custom color
/// RetailIcon(
///   .camera,
///   theme: IconParkTheme.filled,
///   color: Colors.blue,
/// )
///
/// // Two-tone with custom accent color
/// RetailIcon(
///   .camera,
///   theme: IconParkTheme.twoTone,
///   colors: ['#333333', '#2F88FF'],
/// )
///
/// // Multi-color
/// RetailIcon(
///   .camera,
///   theme: IconParkTheme.multiColor,
///   colors: ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'],
/// )
///
/// // Category-scoped access still works (backward compat)
/// RetailIcon(RetailIconsBase.camera)
/// ```
library;

export 'src/retail_icon.dart';
export 'src/retail_icon_data.dart';
export 'src/retail_icon_theme.dart';
export 'src/retail_icons.dart';
