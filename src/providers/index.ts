import { calloutProvider } from "./calloutProvider/calloutProvider";

export const providers = [calloutProvider];

export const defaultProviderSettings = Object.fromEntries(
  providers.map((p) => [p.saveKey, p.defaultSettings])
);
