import {
  EditorPosition,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from "obsidian";
import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";

export type ProviderSettings = {
  enabled: boolean;
  autocompleteEnabled: boolean;
  autocompleteRegex: string;
};

export type OikkariSuggestionProvider = {
  saveKey: string;
  description: string;
  name: string;
  defaultSettings: ProviderSettings;
  getSuggestions: (context: EditorSuggestContext) => OikkariSuggestItem[];
  renderSuggestions?: (suggestion: OikkariSuggestItem, el: HTMLElement) => void;
  autocompleteTrigger?: (
    cursor: EditorPosition,
    line: string,
    userSpecifiedRegex?: string
  ) => EditorSuggestTriggerInfo | null;
};
