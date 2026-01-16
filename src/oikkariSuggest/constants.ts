import { calloutProvider } from "providers/calloutProvider";
import { OikkariSuggestItem } from "./suggestTypes";
import { replaceQueryWith } from "providers/functions/func";
import { OikkariSettings } from "settings/settings";

export const oikkariRootItems: OikkariSuggestItem[] = [
  {
    title: "Insert call out",
    enabled: (settings: OikkariSettings): boolean =>
      settings[calloutProvider().saveKey] ?? false,
    onSelect: (oikkari) => {
      if (!oikkari.context) {
        return oikkari.close();
      }

      replaceQueryWith("", oikkari.context);

      oikkari.provider = calloutProvider();

      if (oikkari.context.query === "") {
        oikkari.manualTrigger();
      }
    },
  },
];
