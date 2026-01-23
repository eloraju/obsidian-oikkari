import {
  OikkariSuggestionProvider,
  ProviderSettings,
} from "providers/providerTypes";
import {
  capitalise,
  cursorAtBeginningOfLine,
  getLastWord,
  getLineUpToCursor,
  replaceQueryWith,
} from "utils/editorHelpers";
import {
  EditorPosition,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  renderMatches,
  setIcon,
} from "obsidian";
import {
  defaultProviderTrigger,
  fuzzySearchItems,
} from "utils/providerHelpers";
import {
  OikkariMatchedSuggestItem,
  OikkariSuggestItem,
} from "oikkariSuggest/suggestTypes";

const DEFAULT_SETTINGS: ProviderSettings = {
  autocompletion: {
    enabled: false,
    defaultRegexStr: "^> ?\\[!",
  },
  enabled: true,
};

type CalloutMeta = {
  name: string;
  icon: string;
  color?: string;
};

const callouts: CalloutMeta[] = [
  { name: "note", icon: "pencil", color: "default" },
  { name: "summary", icon: "clipboard-list" },
  { name: "info", icon: "info" },
  { name: "tip", icon: "flame" },
  { name: "success", icon: "check" },
  { name: "help", icon: "circle-help", color: "question" },
  { name: "warning", icon: "triangle-alert" },
  { name: "fail", icon: "x" },
  { name: "error", icon: "zap" },
  { name: "bug", icon: "bug" },
  { name: "example", icon: "list" },
  { name: "quote", icon: "quote" },
];

const defaultRegex: RegExp = RegExp(
  DEFAULT_SETTINGS.autocompletion.defaultRegexStr
);

const calloutItems: OikkariSuggestItem<CalloutMeta>[] = callouts.map(
  (callout) => ({
    title: capitalise(callout.name),
    icon: callout.icon,
    meta: callout,
    enabled: () => true,
    onSelect: (context) => {
      generateCalloutTemplate(callout.name, context);
      return null;
    },
  })
);

function generateCalloutTemplate(
  type: string,
  context: EditorSuggestContext
): void {
  const currentLine = context.editor.getLine(context.end.line);
  const hasCalloutPrefix = defaultRegex.test(currentLine);
  const insertNewLine = !hasCalloutPrefix && !cursorAtBeginningOfLine(context);

  const PLACEHOLDER_TITLE = "Title";
  const template = `${
    hasCalloutPrefix ? "" : "> [!"
  }${type}] ${PLACEHOLDER_TITLE}`;

  replaceQueryWith(`${insertNewLine ? "\n" : ""}${template}`, context);

  const targetLine = insertNewLine ? context.end.line + 1 : context.end.line;
  const lineWithTemplate = context.editor.getLine(targetLine);
  context.editor.setSelection(
    { ch: lineWithTemplate.indexOf(PLACEHOLDER_TITLE), line: targetLine },
    { ch: lineWithTemplate.length, line: targetLine }
  );
}

function onTrigger(
  cursor: EditorPosition,
  line: string
): EditorSuggestTriggerInfo | null {
  const lastWord = getLastWord(getLineUpToCursor(cursor, line));
  if (lastWord === ">[!" || lastWord === "[!") {
    return {
      end: cursor,
      start: cursor,
      query: "",
    };
  }
  return defaultProviderTrigger(cursor, line);
}

function tryAutocomplete(
  cursor: EditorPosition,
  line: string,
  calloutRegex: RegExp
) {
  const match = calloutRegex.exec(line);
  if (!match) {
    return null;
  }

  const query = line.substring(match.index + match[0].length) ?? "";

  return {
    start: { ch: cursor.ch - query.length, line: cursor.line },
    end: cursor,
    query,
  };
}

export function createCalloutProvider(): OikkariSuggestionProvider {
  let userRegex: RegExp | null = null;

  function getRegex(userRegexString?: string): RegExp {
    if (!userRegexString) return defaultRegex;

    if (!userRegex || userRegex.source !== userRegexString) {
      try {
        userRegex = RegExp(userRegexString);
        return userRegex;
      } catch {
        return defaultRegex;
      }
    }

    return userRegex;
  }

  function renderSuggestion(
    suggestion: OikkariMatchedSuggestItem<CalloutMeta>,
    container: HTMLLIElement
  ) {
    container.addClass("oikkari-suggestion-container");
    const inner = container.createDiv({ cls: "oikkari-suggestion" });

    const color = `rgba(var(--callout-${suggestion.meta?.color ?? suggestion.title.toLocaleLowerCase()}))`;
    const backgroundColor = `rgba(var(--callout-${suggestion.meta?.color ?? suggestion.title.toLocaleLowerCase()}), 0.1)`;

    inner.setCssStyles({ backgroundColor });
    if (suggestion.icon) {
      const iconWrapper = inner.createDiv({
        cls: "oikkari-suggestion-icon",
      });
      iconWrapper.setCssStyles({
        color,
      });

      setIcon(iconWrapper, `lucide-${suggestion.icon}`);
    }

    const titleElement = inner.createSpan();
    titleElement.setCssStyles({ color, fontWeight: "900" });
    renderMatches(
      titleElement,
      suggestion.title,
      suggestion.fuzzyMatch.matches
    );
  }

  return {
    hasSettings: true,
    defaultSettings: DEFAULT_SETTINGS,
    settingsMetadata: {
      description: "Enables quick call out template insertion",
      title: "Call out provider",
    },
    suggestionMetadata: {
      title: "Insert Call out",
    },
    name: "callout-provider",
    renderSuggestion,
    getSuggestions: (context) => fuzzySearchItems(calloutItems, context.query),
    onTrigger,
    tryAutocomplete: (cursor, line, userRegex) =>
      tryAutocomplete(cursor, line, getRegex(userRegex)),
  };
}
