# Two Space Indent

Since Obsidian 1.8, pressing <kbd>Tab</kbd> with **Indent using tabs** turned off always inserts 4 spaces. The **Tab indent size** setting only controls how wide a tab character is displayed.

This plugin makes <kbd>Tab</kbd> indent by 2 spaces and <kbd>Shift</kbd>+<kbd>Tab</kbd> unindent by 2 spaces.

## Behavior

- **Tab on a list item, or with the cursor in a line's leading whitespace**: adds 2 spaces at the start of the line.
- **Tab with several lines selected**: adds 2 spaces to every selected line, for example to move a whole code block under a list item.
- **Tab in the middle of plain text**: inserts spaces up to the next 2-column stop.
- **Shift+Tab**: removes up to 2 leading spaces (or one tab) from each selected line.
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
