# Two Space Indent

Since Obsidian 1.8, pressing <kbd>Tab</kbd> with **Indent using tabs** turned off always inserts 4 spaces. The **Tab indent size** setting only controls how wide a tab character is displayed.

This plugin makes <kbd>Tab</kbd> indent by 2 spaces and <kbd>Shift</kbd>+<kbd>Tab</kbd> unindent by 2 spaces. The number of spaces can be changed in **Settings → Two Space Indent → Spaces per indent** (1–8).

## Behavior

- **Tab on a list item, or with the cursor in a line's leading whitespace**: adds the indent at the start of the line.
- **Tab with several lines selected**: indents every selected line, for example to move a whole code block under a list item.
- **Tab in the middle of plain text**: inserts spaces up to the next indent stop.
- **Shift+Tab**: removes up to one indent of leading spaces (or one tab) from each selected line.
- **Tables** (lines starting with `|`): Tab is left to Obsidian or table plugins.

## Limitations

- Indenting a list item moves only that line, not its child items. Select the children as well to move them together.

## Installation

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/leondgarse/obsidian-two-space-indent/releases/latest).
2. Put them in `<vault>/.obsidian/plugins/two-space-indent/`.
3. Reload Obsidian and enable **Two Space Indent** in **Settings → Community plugins**.

## License

[MIT](LICENSE)

## Releasing

1. Bump `version` in `manifest.json` and add it to `versions.json`.
2. Commit, then push a tag with the exact version, for example `git tag 0.1.1 && git push origin 0.1.1`.

The release workflow builds the GitHub release and attaches artifact attestations for `main.js` and `manifest.json`.
