import { EditorSuggestContext, SearchResult } from "obsidian";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { OikkariSettings } from "settings/settings";

export type OikkariSuggestItem<ItemData = unknown> = {
  title: string;
  enabled: (settings: OikkariSettings) => boolean;
  onSelect: (context: EditorSuggestContext) => OikkariSuggestionProvider | null;
  description?: string;
  icon?: string;
  meta?: ItemData;
};

export type OikkariMatchedSuggestItem<ItemData = unknown> =
  OikkariSuggestItem<ItemData> & {
    fuzzyMatch: SearchResult;
  };
