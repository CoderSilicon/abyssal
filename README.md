<div align="center">
  <img src="assets/icon-512.png" alt="Abyssal" width="180">
  <h1>Abyssal</h1>
  <p>A deep-ocean dark color theme for Visual Studio Code.</p>
</div>

Abyssal is built around a single idea: the chrome should recede and the code should
be the only bright thing on screen. Surfaces step down in near-black greys, syntax
colors are desaturated toward their hue instead of shouting, and accents are
reserved for the handful of things that actually need your attention.

## Install

**From the Marketplace**

1. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for `Abyssal`.
3. Click **Install**, then select **Abyssal** from the theme picker
   (`Ctrl+K Ctrl+T` / `Cmd+K Cmd+T`).

**From source**

```sh
npm install
npm run package          # produces abyssal-<version>.vsix
code --install-extension abyssal-<version>.vsix
```

To reload the theme after editing the JSON while developing, press `Ctrl+Shift+P`
and run **Developer: Reload Window**.

## Layout

Abyssal is a color theme and nothing else. It does not contribute any settings, and
it does not touch `workbench.experimental.modernUI` or any other layout flag, so the
workbench renders exactly as your VS Code build ships it.

VS Code 1.134 introduced an experimental UI restyle ("Modern UI") that draws the
workbench as floating rounded cards: gaps between editor tabs, rounded corners, a
taller status bar. Those come from a style-override layer above the color theme, and
the gaps and corner radii are hardcoded in the workbench stylesheet, so **no color
theme can remove them**.

If you want the flat layout, set it yourself in your user `settings.json`:

```jsonc
{
  // Flat, tiling-style tabs.
  "workbench.experimental.modernUI": false,

  // Optional: keep the tab bar compact and predictable.
  "workbench.editor.showTabs": "multiple",
  "workbench.editor.enablePreview": true,
  "workbench.editor.tabSizing": "shrink",
  "workbench.editor.pinnedTabsOnSeparateRow": false,

  // Optional: kill the remaining padding that eats horizontal space.
  "editor.lineDecorationsWidth": "auto",
  "editor.compactFolders": true,
  "scm.alwaysShowRepositories": false
}
```

Abyssal does not do this for you on purpose. Modern UI is a shipped default that your
VS Code version and your own settings should decide, not a color theme's manifest. If
you enable it later, Abyssal's colors still apply unchanged.

Last resort, if a future release ignores the flag: patch `workbench.desktop.main.css`
directly. That breaks on every VS Code update, so it is deliberately not automated
here.

## Palette

| Role | Hex | Used for |
| --- | --- | --- |
| Abyss | `#0A0B0E` | Editor background |
| Trench | `#08090B` | Tab bar, activity bar |
| Shelf | `#0D0F12` | Side bar |
| Deep | `#0B0D10` | Bottom panel |
| Seafloor | `#090A0D` | Terminal background |
| Current line | `#101216` | Active line highlight |
| Silt | `#17191D` | Borders, separators |
| Rule | `#191B20` | Indent guides, panel border |
| Drift | `#555860` | Inactive tab text |
| Dim | `#45464B` | Comments |
| Bone | `#D6D3C9` | Default foreground |
| Foam | `#F0EEE5` | Brightest foreground |
| Kelp | `#B8C4A8` | Cursor, variables, activity bar |
| Urchin | `#9B7EAA` | Constants, functions, badge |
| Coral | `#B06B72` | Errors, red |
| Shoal | `#8299A8` | Types, classes, blue |
| Sand | `#B59A62` | Numbers, yellow |
| Brine | `#8FAEB0` | Strings, cyan |
| Anemone | `#C4A7D7` | Magenta, regex |

## Design notes

- **Comments are dimmed and italic.** They should recede, not compete. If you find
  `#45464B` too faint, raise it to `#6C6E76`.
- **Color is used sparingly.** Blue and cyan are reserved for types and strings so
  you can scan structure by hue alone. Yellow only ever means number or constant.
- **No pure black or pure white.** `#0A0B0E` and `#F0EEE5` are the extremes, which
  reduces halation on OLED panels and lowers contrast fatigue at 3am.
- **Selection is a subtle fill, not a block.** `#25272B` over `#0A0B0E` keeps the
  selection readable without erasing the text underneath.

## Language coverage

The theme defines scopes for the core TextMate grammars: JSON (nested keys, level 0
through 8), Markdown (headings, tables, fenced code, links, blockquotes), HTML
(attributes, tags), CSS (classes and IDs), JavaScript and TypeScript (classes,
methods, decorators, ES7 bind operator), plus diffs, regexes, and error markers.
Anything not listed falls back to the default foreground, so unstyled languages
still read correctly rather than disappearing.

## Requirements

VS Code `^1.136.0` or newer. Runs on Windows, macOS, and Linux; no platform-specific
behavior.


### The icon

`assets/icon-128.png` and `icon-512.png` are generated from `assets/ab.png`, do not
edit them by hand. Drop a new `ab.png` in and regenerate:

```sh
npm run icon            # 128px, what the Marketplace uses
npm run icon -- 512     # 512px, what the README uses
```

`tools/resize-icon.js` decodes and re-encodes the PNG with `node:zlib` only, so there
is no image library to install and nothing to keep in sync with your toolchain.

Press `F5` to launch an Extension Development Host with the theme applied. Theme
changes show up immediately in that window; no rebuild step.

The dev host opens this folder, so `.vscode/settings.json` applies inside it too.

### Testing in the dev host

`F5`, then pick **Abyssal** in the theme picker (`Ctrl+K Ctrl+T`). The theme is not
selected for you: use the picker, or set `"workbench.colorTheme": "Abyssal"` in your
user settings, to see it.

### Adding a color

Workbench chrome colors go in `colors` at the top of the theme file. Syntax colors
go in `tokenColors`, one entry per scope group, each with a `name` you use to find
it later. Keep `name` descriptive and unique, and keep hex values uppercase to match
the existing file.

### Validating

```sh
npm run lint        # parses package.json and the theme JSON
npm run icon        # regenerates assets/icon-128.png from assets/ab.png
npm run package     # builds abyssal-<version>.vsix
```

`npm run package` needs a real `publisher` in `package.json` first; the placeholder
will make `vsce` refuse.

## License

Released into the public domain under [the Unlicense](LICENSE). Use it, fork it,
sell it, credit it or don't.
