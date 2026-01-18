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
import { fuzzySearchItems, providerToSuggestItem } from "utils/providerHelpers";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { getLastWord, getLineUpToCursor } from "utils/editorHelpers";
import { providers } from "providers";
import { OikkariSuggestItem } from "./suggestTypes";
import { OikkariSettings } from "settings/settings";

export class OikkariSuggest extends EditorSuggest<OikkariSuggestItem> {
  private isManualTrigger = false;
  private settings: OikkariSettings;
  currentProvider: OikkariSuggestionProvider | null = null;
  rootProviders: OikkariSuggestionProvider[] = providers;

  constructor(app: App, settings: OikkariSettings) {
    super(app);
    this.settings = settings;
  }

  findMatchingProvider(
    cursor: EditorPosition,
    line: string,
    filter: (provider: OikkariSuggestionProvider) => boolean = () => true
  ): EditorSuggestTriggerInfo | null {
    for (const provider of this.rootProviders) {
      if (!provider.autocompleteTrigger || !filter(provider)) {
        continue;
      }

      const providerRes = provider.autocompleteTrigger(
        cursor,
        line,
        this.settings[provider.saveKey]?.autocompleteRegex
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
      return this.findMatchingProvider(
        cursor,
        line,
        (p) => this.settings[p.saveKey]?.autocompleteEnabled ?? false
      );
    }

    const providerResult = this.findMatchingProvider(cursor, line);
    if (providerResult) {
      return providerResult;
    }

    const query = getLastWord(getLineUpToCursor(cursor, line));
    return {
      start: { ch: cursor.ch - query.length, line: cursor.line },
      end: cursor,
      query,
    };
  }

  getSuggestions(
    context: EditorSuggestContext
  ): OikkariSuggestItem[] | Promise<OikkariSuggestItem[]> {
    if (this.currentProvider?.getSuggestions) {
      return this.currentProvider.getSuggestions(context);
    }

    return fuzzySearchItems(
      this.rootProviders.map(providerToSuggestItem),
      context.query
    ).filter((item) => item.enabled(this.settings));
  }

  renderSuggestion(suggestion: OikkariSuggestItem, el: HTMLElement): void {
    if (this.currentProvider?.renderSuggestions) {
      return this.currentProvider.renderSuggestions(suggestion, el);
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
    suggestion.onSelect({
      close: () => this.close(),
      manualTrigger: () => this.manualTrigger(),
      setProvider: (provider) => (this.currentProvider = provider),
      context: this.context,
    });
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
    // trigger(editor: Editor, file: TFile|null, openIfClosed: boolean)
    // @ts-expect-error, not defined in the public api
    super.trigger(editor, file, true);
  }
}
