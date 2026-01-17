import { OikkariSuggestionProvider } from "providers/providerTypes";
import {
  capitalise,
  cursorAtBeginningOfLine,
  replaceQueryWith,
} from "utils/editorHelpers";
import { EditorSuggestContext } from "obsidian";
import { fuzzySearchItems } from "utils/providerHelpers";
import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";

const callouts = [
  "note",
  "summary",
  "info",
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

function generateCalloutTemplate(
  type: string,
  context: EditorSuggestContext,
  newline: boolean
): void {
  const PLACEHOLDER_TITLE = "Title";
  const template = `> [!${type}] ${PLACEHOLDER_TITLE}`;

  replaceQueryWith(`${newline ? "\n" : ""}${template}`, context);

  const targetLine = newline ? context.end.line + 1 : context.end.line;
  context.editor.setSelection(
    { ch: template.indexOf(PLACEHOLDER_TITLE), line: targetLine },
    { ch: template.length, line: targetLine }
  );
}

function insertCallout(
  callout: string,
  close: () => void,
  context: EditorSuggestContext | null
): void {
  if (!context) {
    close();
    return;
  }

  const insertNewLine = !cursorAtBeginningOfLine(context);
  generateCalloutTemplate(callout, context, insertNewLine);
  close();
}

function getSuggestions(context: EditorSuggestContext): OikkariSuggestItem[] {
  const items: OikkariSuggestItem[] = callouts.map((callout) => ({
    title: capitalise(callout),
    enabled: () => true,
    onSelect: ({ close, context }) => insertCallout(callout, close, context),
  }));

  return fuzzySearchItems(items, context.query);
}

export const calloutProvider: OikkariSuggestionProvider = {
  name: "Insert call out",
  description: "Enables quick call out template insertion",
  saveKey: "useCalloutProvider",
  getSuggestions,
};
