import { App, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import Oikkari from "../main";
import { OikkariSuggestionProvider } from "providers/providerTypes";
import { providers } from "../providers";

export type OikkariSettings = Record<string, boolean | undefined>;

export class OikkariSettingsTab extends PluginSettingTab {
  plugin: Oikkari;

  constructor(app: App, plugin: Oikkari) {
    super(app, plugin);
    this.plugin = plugin;
  }

  addProviderToggle(
    containerEl: HTMLElement,
    provider: OikkariSuggestionProvider
  ): void {
    const setting = new Setting(containerEl)
      .setName(provider.name)
      .setDesc(provider.description)
      .addToggle(
        (enabled): ToggleComponent =>
          enabled
            // start off disabled --> enable will save the key
            .setValue(this.plugin.settings[provider.saveKey] ?? false)
            .onChange(async (value: boolean) => {
              this.plugin.settings[provider.saveKey] = value;
              await this.plugin.saveSettings();
            })
      );
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    for (const provider of providers) {
      this.addProviderToggle(containerEl, provider());
    }
  }
}
