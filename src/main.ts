import { KeymapEventHandler, Plugin } from "obsidian";
import { OikkariSettings, OikkariSettingsTab } from "./settings/settings";
import { OikkariSuggest } from "oikkariSuggest/oikkariSuggest";
import { defaultProviderSettings } from "providers";

export default class Oikkari extends Plugin {
  settings: OikkariSettings;
  oikkariSuggest: OikkariSuggest;
  id: string = "oikkari";

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new OikkariSettingsTab(this.app, this));

    this.oikkariSuggest = new OikkariSuggest(this.app, this.settings);
    this.registerEditorSuggest(this.oikkariSuggest);

    this.addCommand({
      id: this.id,
      name: "Open Oikkari completions",
      hotkeys: [{ modifiers: ["Ctrl"], key: " " }],
      callback: () => this.oikkariSuggest.manualTrigger(),
    });
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      defaultProviderSettings,
      (await this.loadData()) as Partial<OikkariSettings>
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
