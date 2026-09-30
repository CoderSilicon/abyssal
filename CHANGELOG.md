# Change Log

All notable changes to the "abyssal" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

## [0.3.0]

### Added

- Extension icon at `assets/icon-128.png`, shown on the Extensions view and the
  Marketplace listing.
- Centered logo header in the README.
- `tools/resize-icon.js`, a dependency-free PNG downsampler, plus an `npm run icon`
  script to regenerate the icon sizes from `assets/ab.png`. Runs on
  `vscode:prepublish` so the icon is always rebuilt before packaging.

### Changed

- Declared `untrustedWorkspaces` and `virtualWorkspaces` support in the manifest.
- `assets/ab.png` and `tools/` are excluded from the `.vsix`.

## [0.2.0]

### Added

- `configurationDefaults` contribution setting `workbench.experimental.modernUI` to
  `false`, so the flat, tiling-style workbench is the default as soon as the
  extension is installed instead of depending on each user editing their settings.
- `Abyssal: Disable Modern UI (Remove Tab Gaps)` command. Writes the setting to user
  settings, which overrides VS Code's A/B experiment rollout that can silently
  re-enable Modern UI. Falls back to `workbench.enableExperiments: false` if the flag
  is already off but the layout is still rounded.
- `extension.js` extension host entry point and `main` field.
- `npm run lint` and `npm run package` scripts.
- Extension Development Host now opens this folder, so `.vscode/settings.json`
  applies in the dev window.

## [0.1.0]

### Added

- Initial release of the Abyssal dark color theme.
- Workbench chrome colors for editor, tabs, side bar, activity bar, status bar,
  title bar, panel, and terminal.
- ANSI terminal color palette matched to the editor background.
- TextMate token colors covering comments, keywords, operators, tags, functions,
  classes, types, properties, strings, numbers, regexes, constants, decorators,
  invalid/unused markers, and diff insertions/deletions/changes.
- Language-specific scopes for JSON (nested keys, levels 0-8), Markdown, HTML, CSS,
  JavaScript, and TypeScript.
- Extension manifest metadata, Unlicense, and full README with palette reference.

[Unreleased]: https://github.com/YOUR_USERNAME/abyssal/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/YOUR_USERNAME/abyssal/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/YOUR_USERNAME/abyssal/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/YOUR_USERNAME/abyssal/releases/tag/v0.1.0