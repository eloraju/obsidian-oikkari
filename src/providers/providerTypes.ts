import {
  EditorPosition,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from "obsidian";
import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";

type AutocompleteSettings = {
  enabled: boolean;
  userRegexStr?: string;
  defaultRegexStr: string;
};

export type ProviderSettings = {
  enabled: boolean;
  autocompletion: AutocompleteSettings;
};

export type ProviderSettingsMetadata = {
  title: string;
  description?: string;
  tooltip?: string;
};

export type ProviderSuggestionMetadata = {
  title: string;
  description?: string;
};

type OikkariSuggestionProviderBase = {
  name: string;
  suggestionMetadata: ProviderSuggestionMetadata;
  getSuggestions: (context: EditorSuggestContext) => OikkariSuggestItem[];
  renderSuggestion?: (suggestion: OikkariSuggestItem, el: HTMLElement) => void;
  onTrigger: (
    cursor: EditorPosition,
    line: string
  ) => EditorSuggestTriggerInfo | null;
  tryAutocomplete?: (
    cursor: EditorPosition,
    line: string,
    userSpecifiedRegex?: string
  ) => EditorSuggestTriggerInfo | null;
};

type NoSettings = { hasSettings: false };
type WithSettings = {
  hasSettings: true;
  settingsMetadata: ProviderSettingsMetadata;
  defaultSettings: ProviderSettings;
};

export type OikkariSuggestionProviderWithSettings =
  OikkariSuggestionProviderBase & WithSettings;
export type OikkariSuggestionProviderNoSettings =
  OikkariSuggestionProviderBase & NoSettings;

export type OikkariSuggestionProvider =
  | OikkariSuggestionProviderWithSettings
  | OikkariSuggestionProviderNoSettings;
