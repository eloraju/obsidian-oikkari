import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  renderMatches,
  TFile,
} from "obsidian";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { providerSuggestionItems } from "providers";
import { OikkariMatchedSuggestItem, OikkariSuggestItem } from "./suggestTypes";
import {
  defaultProviderTrigger,
  fuzzySearchItems,
} from "utils/providerHelpers";
import Oikkari from "main";

export class OikkariSuggest extends EditorSuggest<OikkariSuggestItem> {
  private isManualTrigger = false;
  private oikkari: Oikkari;
  private currentProvider: OikkariSuggestionProvider | null = null;

  constructor(app: App, oikkari: Oikkari) {
    super(app);
    this.oikkari = oikkari;
  }

  tryAutocomplete(
    cursor: EditorPosition,
    line: string
  ): EditorSuggestTriggerInfo | null {
    for (const provider of this.oikkari.autocompletingProviders) {
      const providerSettings = this.oikkari.providerSettings[provider.name];
      if (!providerSettings || !provider.tryAutocomplete) {
        continue;
      }

      const providerRes = provider.tryAutocomplete(
        cursor,
        line,
        providerSettings.autocompletion.userRegexStr
      );

      if (providerRes) {
        this.currentProvider = provider;
        return providerRes;
      }
    }
    return null;
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _file: TFile | null
  ): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);

    if (!this.isManualTrigger) {
      return this.tryAutocomplete(cursor, line);
    }

    if (this.currentProvider) {
      return this.currentProvider.onTrigger(cursor, line);
    }

    return defaultProviderTrigger(cursor, line);
  }

  getSuggestions(
    context: EditorSuggestContext
  ): OikkariMatchedSuggestItem[] | Promise<OikkariMatchedSuggestItem[]> {
    if (this.currentProvider) {
      return this.currentProvider.getSuggestions(context);
    }

    return fuzzySearchItems(providerSuggestionItems, context.query);
  }

  renderSuggestion(
    suggestion: OikkariMatchedSuggestItem,
    el: HTMLElement
  ): void {
    if (this.currentProvider?.renderSuggestion) {
      this.currentProvider.renderSuggestion(suggestion, el);
      return;
    }

    const container = el.createDiv();

    if (suggestion.fuzzyMatch) {
      renderMatches(container, suggestion.title, suggestion.fuzzyMatch.matches);
    } else {
      container.createSpan({
        text: suggestion.title,
      });
    }
  }

  selectSuggestion(
    suggestion: OikkariSuggestItem,
    _evt: MouseEvent | KeyboardEvent
  ): void {
    if (this.context) {
      const nextProvider = suggestion.onSelect(this.context);
      if (nextProvider) {
        this.currentProvider = nextProvider;
        this.manualTrigger();
      } else {
        this.close();
      }
    }
  }

  close(): void {
    this.isManualTrigger = false;
    this.currentProvider = null;
    super.close();
  }

  manualTrigger(): void {
    const activeEditor = this.app.workspace.activeEditor;
    const { file, editor } = activeEditor ?? {};

    if (!editor || !file) {
      return;
    }

    this.isManualTrigger = true;
    try {
      // trigger(editor: Editor, file: TFile|null, openIfClosed: boolean)
      // @ts-expect-error, not defined in the public api
      super.trigger(editor, file, true);
    } catch {
      console.warn(
        "Oikkari: EditorSuggest.trigger API changed, manual trigger unavailable"
      );
      this.isManualTrigger = false;
    }
  }
}
