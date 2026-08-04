import '../retail_icon_data.dart';
import 'outline_svg_map.dart';

/// Normalises a caller-supplied icon identifier to an IconPark icon name.
///
/// Backends rarely send the exact catalogue name, so the following are all
/// accepted and resolve to `scan-code`:
///
/// ```dart
/// normalizeIconName('scan-code');              // already canonical
/// normalizeIconName('assets/icons/scan-code.svg');
/// normalizeIconName('scan_code');
/// normalizeIconName('scanCode');
/// ```
///
/// The transformation is: take the last path segment, drop a trailing `.svg`,
/// split camelCase boundaries, fold `_` to `-`, lowercase, then collapse and
/// trim dashes.
String normalizeIconName(String raw) {
  var name = raw.trim();

  final lastSlash = name.lastIndexOf('/');
  if (lastSlash != -1) name = name.substring(lastSlash + 1);

  if (name.toLowerCase().endsWith('.svg')) {
    name = name.substring(0, name.length - 4);
  }

  return name
      .replaceAllMapped(
        RegExp(r'([a-z0-9])([A-Z])'),
        (m) => '${m[1]}-${m[2]}',
      )
      .replaceAll('_', '-')
      .toLowerCase()
      .replaceAll(RegExp(r'-+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');
}

/// Resolves icons by name at runtime, for icons chosen by a server rather than
/// at compile time.
///
/// Reach for this only when the icon identifier isn't known while writing the
/// code. Referencing an icon directly — `RetailIcon(.camera)` — stays the right
/// default: it lets the tree-shaker drop every icon the app doesn't name, while
/// importing `package:retail_icons/lookup.dart` pulls in the outline artwork of
/// all [length] icons whether or not they're ever displayed.
///
/// ```dart
/// import 'package:retail_icons/retail_icons.dart';
/// import 'package:retail_icons/lookup.dart';
///
/// final icon = RetailIconLookup.byName(menuItem.icon) ?? RetailIconData.help;
/// return RetailIcon(icon);
/// ```
///
/// Icons resolved this way carry only their outline artwork, so a `RetailIcon`
/// given any theme other than `IconParkTheme.outline` renders the outline
/// rather than the requested theme.
abstract final class RetailIconLookup {
  /// Resolved icons, keyed by normalised name.
  ///
  /// Bounded by the catalogue size, and only ever holds icons that were
  /// actually requested. Worth having because callers typically resolve inside
  /// a `build` method, which can run on every frame.
  static final Map<String, RetailIconData> _cache = {};

  /// Every icon name resolvable through [byName], in catalogue order.
  static Iterable<String> get names => kOutlineSvgByName.keys;

  /// How many icons this table can resolve.
  static int get length => kOutlineSvgByName.length;

  /// Whether [name] resolves to an icon. Accepts the same spellings as
  /// [normalizeIconName].
  static bool contains(String name) =>
      kOutlineSvgByName.containsKey(normalizeIconName(name));

  /// Returns the icon [name] refers to, or `null` when the catalogue has no
  /// such icon — leaving the choice of fallback to the caller.
  ///
  /// [name] is run through [normalizeIconName] first.
  static RetailIconData? byName(String name) {
    final key = normalizeIconName(name);

    final cached = _cache[key];
    if (cached != null) return cached;

    final stored = kOutlineSvgByName[key];
    if (stored == null) return null;

    // Entries are stored without the XML chrome shared by almost every icon.
    // The few that keep a non-standard viewBox are stored whole and start with
    // an XML declaration.
    final svg = stored.startsWith('<?xml')
        ? stored
        : '$kOutlineSvgHeader$stored$kOutlineSvgFooter';

    final icon = RetailIconData.outlineOnly(name: key, outline: svg);
    _cache[key] = icon;
    return icon;
  }
}
