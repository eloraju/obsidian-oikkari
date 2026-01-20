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
import { providers, providerSuggestionItems } from "providers";
import { OikkariSuggestItem } from "./suggestTypes";
import { OikkariSettings } from "settings/settings";
import {
  defaultProviderTrigger,
  fuzzySearchItems,
} from "utils/providerHelpers";

export class OikkariSuggest extends EditorSuggest<OikkariSuggestItem> {
  private isManualTrigger = false;
  private settings: OikkariSettings;
  private currentProvider: OikkariSuggestionProvider | null = null;
  private allProviders: OikkariSuggestionProvider[] = providers;

  constructor(app: App, settings: OikkariSettings) {
    super(app);
    this.settings = settings;
  }

  tryAutocomplete(
    cursor: EditorPosition,
    line: string
  ): EditorSuggestTriggerInfo | null {
    for (const provider of this.allProviders) {
      const providerSettings = this.settings[provider.name];
      if (
        !providerSettings ||
        !providerSettings.enabled ||
        !providerSettings.autocompletion.enabled ||
        !provider.tryAutocomplete
      ) {
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
  ): OikkariSuggestItem[] | Promise<OikkariSuggestItem[]> {
    if (this.currentProvider) {
      return this.currentProvider.getSuggestions(context);
    }

    return fuzzySearchItems(providerSuggestionItems, context.query);
  }

  renderSuggestion(suggestion: OikkariSuggestItem, el: HTMLElement): void {
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
