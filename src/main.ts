import { Plugin } from "obsidian";
import { OikkariSettings, OikkariSettingsTab } from "./settings/settings";
import { OikkariSuggest } from "oikkariSuggest/oikkariSuggest";
import { defaultProviderSettings, providers } from "providers";
import { OikkariSuggestionProvider } from "providers/providerTypes";

export default class Oikkari extends Plugin {
  providerSettings: OikkariSettings;
  oikkariSuggest: OikkariSuggest;

  enabledProviders: OikkariSuggestionProvider[] = [];
  autocompletingProviders: OikkariSuggestionProvider[] = [];

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new OikkariSettingsTab(this.app, this));

    this.oikkariSuggest = new OikkariSuggest(this.app, this);
    this.registerEditorSuggest(this.oikkariSuggest);

    this.addCommand({
      id: "oikkari",
      name: "Open Oikkari completions",
      hotkeys: [{ modifiers: ["Ctrl"], key: " " }],
      callback: () => this.oikkariSuggest.manualTrigger(),
    });
  }

  updateProviders() {
    this.enabledProviders = providers.filter(
      (p) => this.providerSettings[p.name]?.enabled
    );
    this.autocompletingProviders = this.enabledProviders.filter(
      (p) => this.providerSettings[p.name]?.autocompletion.enabled
    );
  }

  async loadSettings() {
    this.providerSettings = Object.assign(
      {},
      defaultProviderSettings,
      (await this.loadData()) as Partial<OikkariSettings>
    );
    this.updateProviders();
  }

  async saveSettings() {
    await this.saveData(this.providerSettings);
    this.updateProviders();
  }
}
