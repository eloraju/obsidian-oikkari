import { EditorSuggestContext, SearchResult } from "obsidian";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { OikkariSettings } from "settings/settings";

export type OikkariSuggestItem = {
  title: string;
  enabled: (settings: OikkariSettings) => boolean;
  onSelect: (context: EditorSuggestContext) => OikkariSuggestionProvider | null;
  description?: string;
  icon?: string;
  fuzzyMatch?: SearchResult | null;
};
