import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  prepareFuzzySearch,
  renderMatches,
  TFile,
} from "obsidian";
import { OikkariSuggestItem } from "./suggestTypes";
import { oikkariRootItems } from "./constants";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { getLastWord, getLineUpToCursor } from "providers/functions/func";

export class OikkariSuggest extends EditorSuggest<OikkariSuggestItem> {
  private shouldTrigger = false;
  provider: OikkariSuggestionProvider | null;

  constructor(app: App) {
    super(app);
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    file: TFile | null
  ): EditorSuggestTriggerInfo | null {
    if (!this.shouldTrigger) {
      return null;
    }

    const line = editor.getLine(cursor.line);
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
    const items = this.provider?.getSuggestions
      ? this.provider.getSuggestions(context)
      : oikkariRootItems;

    const fuzzy = prepareFuzzySearch(context.query);
    const matches = items.map((item) => ({
      ...item,
      fuzzyMatch: fuzzy(item.title),
    }));

    return matches
      .filter((item) => item.fuzzyMatch)
      .sort((a, b) => b.fuzzyMatch!.score - a.fuzzyMatch!.score);
  }

  renderSuggestion(suggestion: OikkariSuggestItem, el: HTMLElement): void {
    const container = el.createDiv();

    if (suggestion.fuzzyMatch) {
      const match = suggestion.fuzzyMatch;
      renderMatches(container, suggestion.title, match.matches);
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
    const shouldRetrigger = this.context?.query === "";
    suggestion.onSelect(this);
  }

  close(): void {
    this.shouldTrigger = false;
    this.provider = null;
    super.close();
  }

  manualTrigger(): void {
    const fileInfo = this.app.workspace.activeEditor;
    if (!fileInfo) {
      return;
    }

    const file = fileInfo.file;
    const editor = fileInfo.editor;
    if (!editor || !file) {
      return;
    }

    this.shouldTrigger = true;
    // @ts-expect-error
    // not in the public api
    // last argument seems to be something like "forceShow" etc.
    super.trigger(editor, file, true);
  }
}
