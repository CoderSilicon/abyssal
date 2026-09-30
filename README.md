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

## Remove the gaps between tabs

VS Code 1.134 turned on an experimental UI restyle ("Modern UI") that turns the
workbench into floating rounded cards: 4px gaps between editor tabs, rounded
corners everywhere, a taller status bar, extra margins around side bars. It is the
main reason VS Code feels bloated and rounder than it used to.

The gaps and corner radii are hardcoded in the workbench stylesheet, so **no color
theme can remove them**. They come from a separate style-override layer gated
behind one setting, so the theme ships that switch.

### Automatic

Abyssal contributes `configurationDefaults` in its manifest:

```json
"configurationDefaults": {
  "workbench.experimental.modernUI": false
}
```

That overrides the setting's default the moment the extension is installed, so the
flat layout is already in place before you select the theme. This is a *default*,
not a hard lock: if you have `workbench.experimental.modernUI: true` written in any
`settings.json`, yours wins and Modern UI comes back. Delete that line.

### Forced

Modern UI is registered as an experiment (`experiment: { mode: 'auto' }`), which
means VS Code's A/B rollout service can flip it back on without your consent and
without the flag appearing in `settings.json`. When that happens, run:

**Command Palette → `Abyssal: Disable Modern UI (Remove Tab Gaps)`**

The command writes `false` to the setting in your *user* settings, which beats the
rollout. If it finds the flag already `false` and the UI is still rounded, it also
sets `workbench.enableExperiments: false`, which closes the experiments channel
entirely. Then reload the window.

### Doing it by hand

Open **Preferences: Open User Settings (JSON)** and add:

```jsonc
{
  // Flat, tiling-style tabs. This is the important one.
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

Last resort, if a future release ignores both switches: patch
`workbench.desktop.main.css` directly. That breaks on every VS Code update, so it
is deliberately not automated here.

### Verify it took effect

With the override off you should see:

- Tab labels flush against each other with hairline separators, no 4px gutters.
- Square corners on the tab bar, side bar, and panel.
- A single-line status bar instead of a double-height one.
- No vertical margin between the side bar and the editor.

If Modern UI is still on, check whether `workbench.experimental.modernUI` reappeared
in your user `settings.json` after a VS Code update. That is the A/B rollout writing
itself back in.

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

VS Code `^1.138.0` or newer. Runs on Windows, macOS, and Linux; no platform-specific
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
That matters for the tab gaps: `workbench.experimental.modernUI` is `window` scoped,
so a folder-level value only affects windows that have this folder open. The
extension's `configurationDefaults` applies everywhere regardless, and the command
writes to user settings, which is the only scope that survives on your real setup.

### Testing the layout fix in the dev host

1. `F5`.
2. In the new window run `Abyssal: Disable Modern UI (Remove Tab Gaps)`.
3. `Developer: Reload Window`.

If tabs are still pill-shaped after the reload, the settings write failed and the
host has no write access to its user settings. Check the Host, Help, About dialog
for a temporary user data dir; add `"workbench.experimental.modernUI": false` to
`.vscode/settings.json` instead to isolate the theme from the flag.

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
