import { KeymapEventHandler, Plugin } from "obsidian";
import { OikkariSettings, OikkariSettingsTab } from "./settings/settings";
import { OikkariSuggest } from "oikkariSuggest/oikkariSuggest";

export default class Oikkari extends Plugin {
  settings: OikkariSettings;
  oikkariSuggest: OikkariSuggest;
  triggerHandler: KeymapEventHandler;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new OikkariSettingsTab(this.app, this));

    this.oikkariSuggest = new OikkariSuggest(this.app, this.settings);
    this.registerEditorSuggest(this.oikkariSuggest);

    // TODO: check that this bind is free and register it only if it is
    this.triggerHandler = this.app.scope.register(["Ctrl"], " ", () => {
      this.oikkariSuggest.manualTrigger();
    });
  }

  onunload() {
    this.app.scope.unregister(this.triggerHandler);
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      (await this.loadData()) as Partial<OikkariSettings>
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
