import { Editor, EditorPosition, EditorSuggestContext } from "obsidian";

export function getLastWord(line: string): string {
  // i really want Array.at()...
  const words = line.split(" ");
  return words[words.length - 1] ?? "";
}

export function getLineUpToCursor(
  cursor: EditorPosition,
  line: string
): string {
  return line.substring(0, cursor.ch);
}

export function replaceQueryWith(
  result: string,
  context: EditorSuggestContext
): void {
  context.editor.replaceRange(result, context.start, context.end);
}

export function capitalise(word: string): string {
  if (word.length === 0) {
    return word;
  }

  return word.replace(word[0]!, word[0]!.toUpperCase());
}

export function emptyLine(line: number, editor: Editor): boolean {
  return editor.getLine(line).length === 0;
}

export function cursorAtBeginningOfLine(
  context: EditorSuggestContext
): boolean {
  return context.start.ch === 0;
}
