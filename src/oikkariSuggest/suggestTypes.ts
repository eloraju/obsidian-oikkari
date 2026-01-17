import { EditorSuggestContext, SearchResult } from "obsidian";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { OikkariSettings } from "settings/settings";

export type OnSelectArgs = {
  close: () => void;
  manualTrigger: () => void;
  setProvider: (provider: OikkariSuggestionProvider) => void;
  context: EditorSuggestContext | null;
};

export type OikkariSuggestItem = {
  title: string;
  enabled: (settings: OikkariSettings) => boolean;
  onSelect: (context: OnSelectArgs) => void;
  description?: string;
  icon?: string;
  fuzzyMatch?: SearchResult | null;
};
