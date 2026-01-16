import { EditorSuggestContext } from "obsidian";
import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";

export type OikkariSuggestionProvider = {
  saveKey: string;
  description: string;
  name: string;
  getSuggestions: (context: EditorSuggestContext) => OikkariSuggestItem[];
  renderSuggestions?: (suggestion: OikkariSuggestItem, el: HTMLElement) => void;
};
