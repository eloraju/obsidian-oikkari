import {
  getLastWord,
  getLineUpToCursor,
  replaceQueryWith,
} from "utils/editorHelpers";
import { OikkariSettings } from "settings/settings";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import {
  EditorPosition,
  EditorSuggestTriggerInfo,
  prepareFuzzySearch,
} from "obsidian";
import {
  OikkariMatchedSuggestItem,
  OikkariSuggestItem,
} from "oikkariSuggest/suggestTypes";

export function mapProviderToSuggestItem(
  provider: OikkariSuggestionProvider
): OikkariSuggestItem {
  return {
    title: provider.suggestionMetadata.title,
    enabled: (settings: OikkariSettings): boolean =>
      settings[provider.name]?.enabled ?? false,
    onSelect: (context) => {
      replaceQueryWith("", context);
      return provider;
    },
  };
}

export function fuzzySearchItems(
  items: OikkariSuggestItem[],
  query: string
): OikkariMatchedSuggestItem[] {
  const fuzzy = prepareFuzzySearch(query);

  const matches: OikkariMatchedSuggestItem[] = [];
  for (const item of items) {
    const fuzzyMatch = fuzzy(item.title);

    if (!fuzzyMatch) continue;

    matches.push({ ...item, fuzzyMatch });
  }
  return matches.sort((a, b) => b.fuzzyMatch.score - a.fuzzyMatch.score);
}

export function defaultProviderTrigger(
  cursor: EditorPosition,
  line: string
): EditorSuggestTriggerInfo {
  const query = getLastWord(getLineUpToCursor(cursor, line));
  return {
    start: { ch: cursor.ch - query.length, line: cursor.line },
    end: cursor,
    query,
  };
}
