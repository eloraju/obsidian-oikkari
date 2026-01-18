import {
  App,
  debounce,
  Debouncer,
  PluginSettingTab,
  Setting,
  TextComponent,
  ToggleComponent,
} from "obsidian";
import Oikkari from "main";
import {
  OikkariSuggestionProvider,
  ProviderSettings,
} from "providers/providerTypes";
import { providers } from "providers";

export type OikkariSettings = Record<string, ProviderSettings | undefined>;

export class OikkariSettingsTab extends PluginSettingTab {
  plugin: Oikkari;
  debouncedRegexInput: Debouncer<[OikkariSuggestionProvider, string], void>;

  constructor(app: App, plugin: Oikkari) {
    super(app, plugin);
    this.plugin = plugin;
    this.debouncedRegexInput = debounce(
      (provider: OikkariSuggestionProvider, val: string) => {
        this.changeSetting(provider, "autocompleteRegex", val);
      },
      500,
      true
    );
  }

  private async changeSetting<SettingKey extends keyof ProviderSettings>(
    provider: OikkariSuggestionProvider,
    settingKey: SettingKey,
    newValue: ProviderSettings[SettingKey]
  ): Promise<void> {
    this.plugin.settings[provider.saveKey] = this.plugin.settings[
      provider.saveKey
    ] ?? { ...provider.defaultSettings };
    this.plugin.settings[provider.saveKey]![settingKey] = newValue;
    await this.plugin.saveSettings();
    this.display();
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h1", { text: "Providers" });

    for (const provider of providers) {
      const providerSettings =
        this.plugin.settings[provider.saveKey] ?? provider.defaultSettings;

      const providerContainer = containerEl.createDiv();
      providerContainer.createEl("h2", { text: provider.name });
      providerContainer.createDiv({ text: provider.description });

      new Setting(providerContainer).setName("Enabled").addToggle(
        (component: ToggleComponent): ToggleComponent =>
          component
            .setValue(providerSettings.enabled)
            .onChange(async (value: boolean) => {
              await this.changeSetting(provider, "enabled", value);
            })
      );

      if (providerSettings.enabled) {
        new Setting(providerContainer)
          .setName("Enable automatic triggering")
          .addToggle(
            (component: ToggleComponent): ToggleComponent =>
              component
                .setValue(providerSettings.autocompleteEnabled)
                .onChange(async (value: boolean) => {
                  await this.changeSetting(
                    provider,
                    "autocompleteEnabled",
                    value
                  );
                })
          );
      }

      if (providerSettings.enabled && providerSettings.autocompleteEnabled) {
        new Setting(providerContainer)
          .setName("Custom autocomplete regex")
          .setDesc(
            "Set a custom regex string to be used when determining autocompletion trigger"
          )
          .addText((component: TextComponent): TextComponent => {
            component.onChange((value: string) => {
              this.debouncedRegexInput(
                provider,
                value === ""
                  ? provider.defaultSettings.autocompleteRegex
                  : value
              );
            });

            if (
              this.plugin.settings[provider.saveKey]?.autocompleteRegex ===
              provider.defaultSettings.autocompleteRegex
            ) {
              component.setPlaceholder(providerSettings.autocompleteRegex);
            } else {
              component.setValue(providerSettings.autocompleteRegex);
            }

            return component;
          });
      }
    }
  }
}
