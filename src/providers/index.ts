import { OikkariSuggestItem } from "oikkariSuggest/suggestTypes";
import { createCalloutProvider } from "./calloutProvider/calloutProvider";
import { mapProviderToSuggestItem } from "utils/providerHelpers";
import { ProviderSettings } from "./providerTypes";

export const providers = [createCalloutProvider()];

export const providerSuggestionItems: OikkariSuggestItem[] = providers.map(
  mapProviderToSuggestItem
);

export const defaultProviderSettings: Record<string, ProviderSettings> = {};
for (const p of providers) {
  if (p.hasSettings) defaultProviderSettings[p.name] = p.defaultSettings;
}
