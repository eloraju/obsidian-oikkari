import { App, EditorSuggestContext, SearchResult } from "obsidian";
import { OikkariSuggest } from "./oikkariSuggest";
import { OikkariSettings } from "settings/settings";

export type OikkariSuggestItem = {
  title: string;
  enabled: (settings: OikkariSettings) => boolean;
  onSelect: (context: OikkariSuggest) => void;
  description?: string;
  icon?: string;
  fuzzyMatch?: SearchResult | null;
};
