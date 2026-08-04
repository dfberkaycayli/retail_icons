/// Runtime, name-based icon resolution for `retail_icons`.
///
/// Import this library **only** when the icon to display is decided at runtime
/// — typically because a server sends its name:
///
/// ```dart
/// import 'package:retail_icons/retail_icons.dart';
/// import 'package:retail_icons/lookup.dart';
///
/// final icon = RetailIconLookup.byName(menuItem.icon) ?? RetailIconData.help;
/// return RetailIcon(icon);
/// ```
///
/// ## Why this is a separate library
///
/// `RetailIconData` holds the outline, filled, two-tone and multi-color source
/// for an icon in a single const object. Referencing one icon therefore retains
/// all four themes — fine when you name a handful of icons, fatal for a map
/// over the whole catalogue, which would bundle every theme of all 2658 icons.
///
/// So the lookup table stores the outline artwork separately, and lives behind
/// its own import. Code that never imports this library keeps full
/// tree-shaking: nothing here is reachable, so none of it is bundled. Code that
/// does import it pays for the outline table once, and can then render any icon
/// in the catalogue without shipping an app update to add one.
library;

export 'src/lookup/retail_icon_lookup.dart' show RetailIconLookup, normalizeIconName;
