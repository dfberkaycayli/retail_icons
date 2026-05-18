import 'package:flutter/material.dart';
import 'package:retail_icons/retail_icons.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'retail_icons demo',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const IconShowcase(),
    );
  }
}

class IconShowcase extends StatefulWidget {
  const IconShowcase({super.key});

  @override
  State<IconShowcase> createState() => _IconShowcaseState();
}

class _IconShowcaseState extends State<IconShowcase> {
  IconParkTheme _theme = IconParkTheme.outline;

  static const _icons = <String, RetailIconData>{
    'camera': RetailIconsBase.camera,
    'home': RetailIconsBase.home,
    'shopping cart': RetailIconsMoney.shoppingCart,
    'like': RetailIconsBase.like,
    'star': RetailIconsEdit.star,
    'user': RetailIconsPeoples.user,
    'search': RetailIconsBase.search,
    'remind': RetailIconsMusic.remind,
    'settings': RetailIconsBase.setting,
    'share': RetailIconsBase.share,
  };

  static const _twoToneColors = ['#333333', '#2F88FF'];
  static const _multiColors = ['#333333', '#2F88FF', '#FFFFFF', '#43CCF8'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('retail_icons')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SegmentedButton<IconParkTheme>(
              segments: const [
                ButtonSegment(
                  value: IconParkTheme.outline,
                  label: Text('outline'),
                ),
                ButtonSegment(
                  value: IconParkTheme.filled,
                  label: Text('filled'),
                ),
                ButtonSegment(
                  value: IconParkTheme.twoTone,
                  label: Text('two-tone'),
                ),
                ButtonSegment(
                  value: IconParkTheme.multiColor,
                  label: Text('multi-color'),
                ),
              ],
              selected: {_theme},
              onSelectionChanged: (s) => setState(() => _theme = s.first),
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(24),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 120,
                mainAxisSpacing: 24,
                crossAxisSpacing: 24,
              ),
              itemCount: _icons.length,
              itemBuilder: (context, i) {
                final entry = _icons.entries.elementAt(i);
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    RetailIcon(
                      entry.value,
                      theme: _theme,
                      size: 48,
                      color:
                          _theme == IconParkTheme.outline ||
                              _theme == IconParkTheme.filled
                          ? Colors.indigo
                          : null,
                      colors: _theme == IconParkTheme.twoTone
                          ? _twoToneColors
                          : _theme == IconParkTheme.multiColor
                          ? _multiColors
                          : null,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      entry.key,
                      style: Theme.of(context).textTheme.labelSmall,
                      textAlign: TextAlign.center,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
