const { Plugin, PluginSettingTab, Setting } = require("obsidian");
const { keymap } = require("@codemirror/view");
const { Prec } = require("@codemirror/state");

const DEFAULT_SETTINGS = { spaces: 2 };
const LIST_RE = /^\s*([-*+]|\d+[.)])\s/;

// Lines covered by a range; a selection ending at column 0 doesn't include that line
function linesOf(doc, range) {
  const first = doc.lineAt(range.from).number;
  let last = doc.lineAt(range.to).number;
  if (!range.empty && last > first && doc.line(last).from === range.to) last--;
  const lines = [];
  for (let n = first; n <= last; n++) lines.push(doc.line(n));
  return lines;
}

// Leave Tab to table plugins inside markdown tables
function inTable(state) {
  return state.selection.ranges.some((r) => state.doc.lineAt(r.head).text.trimStart().startsWith("|"));
}

// Live Preview renders tables with a small editor per cell; leave its Tab to Obsidian
function inCellEditor(view) {
  return !!(view.dom && view.dom.closest(".table-cell-wrapper"));
}

function dispatch(view, specs) {
  const changes = view.state.changes(specs);
  if (changes.empty) return true;
  view.dispatch({
    changes,
    selection: view.state.selection.map(changes, 1),
    scrollIntoView: true,
    userEvent: "input.indent",
  });
  return true;
}

function indentMore(view, size) {
  const { state } = view;
  if (inTable(state)) return false;
  const specs = [];
  const seen = new Set();
  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.head);
    const leading = line.text.match(/^\s*/)[0].length;
    // Plain text with cursor after the indentation: leave Tab to Obsidian and other plugins
    if (range.empty && !LIST_RE.test(line.text) && range.head > line.from + leading) return false;
    for (const l of linesOf(state.doc, range)) {
      if (seen.has(l.number)) continue;
      seen.add(l.number);
      specs.push({ from: l.from, insert: " ".repeat(size) });
    }
  }
  return dispatch(view, specs);
}

function indentLess(view, size) {
  const { state } = view;
  if (inTable(state)) return false;
  const specs = [];
  const seen = new Set();
  for (const range of state.selection.ranges) {
    for (const l of linesOf(state.doc, range)) {
      if (seen.has(l.number)) continue;
      seen.add(l.number);
      const n = l.text.startsWith("\t") ? 1 : l.text.match(new RegExp(`^ {0,${size}}`))[0].length;
      if (n) specs.push({ from: l.from, to: l.from + n });
    }
  }
  return dispatch(view, specs);
}

module.exports = class IndentWithSpaces extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new IndentSettingTab(this.app, this));
    this.registerEditorExtension(
      Prec.highest(
        keymap.of([
          {
            key: "Tab",
            run: (view) =>
              !inCellEditor(view) && (this.tableCommand(view, "next-cell") || indentMore(view, this.settings.spaces)),
          },
          {
            key: "Shift-Tab",
            run: (view) =>
              !inCellEditor(view) && (this.tableCommand(view, "previous-cell") || indentLess(view, this.settings.spaces)),
          },
        ])
      )
    );
  }

  // In a table, run the Advanced Tables command if it's enabled. Its own Tab binding
  // is off in Live Preview, but its commands work in both editing modes.
  tableCommand(view, command) {
    if (!inTable(view.state)) return false;
    return this.app.commands.executeCommandById(`table-editor-obsidian:${command}`) === true;
  }
};

class IndentSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Spaces per indent")
      .setDesc("Number of spaces Tab adds and Shift+Tab removes.")
      .addSlider((slider) =>
        slider
          .setLimits(1, 8, 1)
          .setValue(this.plugin.settings.spaces)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.spaces = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }
}
