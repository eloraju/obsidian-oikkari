import {
  OikkariSuggestionProvider,
  ProviderSettings,
} from "providers/providerTypes";
import {
  capitalise,
  cursorAtBeginningOfLine,
  replaceQueryWith,
} from "utils/editorHelpers";
import {
  EditorPosition,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from "obsidian";
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

const DEFAULT_SETTINGS: ProviderSettings = {
  autocompleteEnabled: false,
  enabled: true,
  autocompleteRegex: "^> ?\\[!",
};

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

function autocompleteTrigger(
  cursor: EditorPosition,
  line: string,
  userSpecifiedRegex?: string
): EditorSuggestTriggerInfo | null {
  const calloutRegex = userSpecifiedRegex
    ? RegExp(userSpecifiedRegex)
    : RegExp(DEFAULT_SETTINGS.autocompleteRegex);
  const match = calloutRegex.exec(line);
  if (!match) {
    return null;
  }

  const query = line.split(match[0])[1] ?? "";

  return {
    start: { ch: cursor.ch - query.length, line: cursor.line },
    end: cursor,
    query,
  };
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
  name: "Call out provider",
  description: "Enables quick call out template insertion",
  saveKey: "callout-provider",
  defaultSettings: DEFAULT_SETTINGS,
  getSuggestions,
  autocompleteTrigger,
};
