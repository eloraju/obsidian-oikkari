import { replaceQueryWith } from "utils/editorHelpers";
import { OikkariSettings } from "settings/settings";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { prepareFuzzySearch } from "obsidian";
import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";

export function providerToSuggestItem(
  provider: OikkariSuggestionProvider
): OikkariSuggestItem {
  return {
    title: provider.name,
    enabled: (settings: OikkariSettings): boolean =>
      settings[provider.saveKey] ?? false,
    onSelect: ({
      close,
      context,
      manualTrigger: retriggerSuggest,
      setProvider,
    }) => {
      if (!context) {
        close();
        return;
      }

      const previousQuery = context.query;
      replaceQueryWith("", context);
      setProvider(provider);

      if (previousQuery === "") {
        retriggerSuggest();
      }
    },
  };
}

export function fuzzySearchItems(
  items: OikkariSuggestItem[],
  query: string
): OikkariSuggestItem[] {
  const fuzzy = prepareFuzzySearch(query);
  const matches = items.map((item) => ({
    ...item,
    fuzzyMatch: fuzzy(item.title),
  }));

  return matches
    .filter((item) => item.fuzzyMatch)
    .sort((a, b) => b.fuzzyMatch!.score - a.fuzzyMatch!.score);
}
