const { Plugin } = require("obsidian");
const { keymap } = require("@codemirror/view");
const { Prec } = require("@codemirror/state");

const INDENT = 2;
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

function indentMore(view) {
  const { state } = view;
  if (inTable(state)) return false;
  const specs = [];
  const seen = new Set();
  for (const range of state.selection.ranges) {
    const line = state.doc.lineAt(range.head);
    const leading = line.text.match(/^\s*/)[0].length;
    // Plain text with cursor after the indentation: pad to the next 2-column stop
    if (range.empty && !LIST_RE.test(line.text) && range.head > line.from + leading) {
      const col = range.head - line.from;
      specs.push({ from: range.head, insert: " ".repeat(INDENT - (col % INDENT)) });
      continue;
    }
    for (const l of linesOf(state.doc, range)) {
      if (seen.has(l.number)) continue;
      seen.add(l.number);
      specs.push({ from: l.from, insert: " ".repeat(INDENT) });
    }
  }
  return dispatch(view, specs);
}

function indentLess(view) {
  const { state } = view;
  if (inTable(state)) return false;
  const specs = [];
  const seen = new Set();
  for (const range of state.selection.ranges) {
    for (const l of linesOf(state.doc, range)) {
      if (seen.has(l.number)) continue;
      seen.add(l.number);
      const n = l.text.startsWith("\t") ? 1 : l.text.match(new RegExp(`^ {0,${INDENT}}`))[0].length;
      if (n) specs.push({ from: l.from, to: l.from + n });
    }
  }
  return dispatch(view, specs);
}

module.exports = class TwoSpaceIndent extends Plugin {
  onload() {
    this.registerEditorExtension(
      Prec.highest(
        keymap.of([
          { key: "Tab", run: indentMore },
          { key: "Shift-Tab", run: indentLess },
        ])
      )
    );
  }
};
