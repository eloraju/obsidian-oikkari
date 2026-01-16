import { OikkariSuggestionProvider } from "providers/providerTypes";
import {
  capitalise,
  cursorAtBeginningOfLine,
  emptyLine,
  replaceQueryWith,
} from "providers/functions/func";
import { EditorSuggestContext } from "obsidian";

const callouts = [
  "note",
  "summary",
  "info",
  "tip",
  "tip",
  "success",
  "help",
  "warning",
  "fail",
  "error",
  "bug",
  "example",
  "quote",
];

function insertCallout(
  type: string,
  context: EditorSuggestContext,
  newline: boolean
): void {
  const res = `> [!${type}] Title`;
  replaceQueryWith(`${newline ? "\n" : ""}${res}`, context);
  const targetLine = newline ? context.end.line + 1 : context.end.line;
  context.editor.setSelection(
    { ch: res.indexOf("Title"), line: targetLine },
    { ch: res.length, line: targetLine }
  );
}

export function calloutProvider(): OikkariSuggestionProvider {
  return {
    name: "Insert call out",
    description: "Enables quick call out template insertion",
    saveKey: "useCalloutProvider",
    getSuggestions: () => {
      return callouts.map((callout) => ({
        title: capitalise(callout),
        enabled: () => true,
        onSelect: (oikkari) => {
          if (!oikkari.context) {
            return oikkari.close();
          }

          const insertNewLine = !cursorAtBeginningOfLine(oikkari.context);
          insertCallout(callout, oikkari.context, insertNewLine);
          oikkari.close();
        },
      }));
    },
  };
}
