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
  OikkariSuggestionProviderWithSettings,
  ProviderSettings,
} from "providers/providerTypes";
import { providers } from "providers";

export type OikkariSettings = Record<string, ProviderSettings | undefined>;

export class OikkariSettingsTab extends PluginSettingTab {
  plugin: Oikkari;
  debouncedRegexInput: Debouncer<
    [OikkariSuggestionProviderWithSettings, string],
    void
  >;

  constructor(app: App, plugin: Oikkari) {
    super(app, plugin);
    this.plugin = plugin;
    this.debouncedRegexInput = debounce(
      (provider: OikkariSuggestionProviderWithSettings, val: string) => {
        this.saveProviderSettings(provider, (old) => ({
          ...old,
          autocompletion: { ...old.autocompletion, userRegexStr: val },
        }));
      },
      500,
      true
    );
  }

  private async saveProviderSettings(
    provider: OikkariSuggestionProviderWithSettings,
    updateSettings: (old: ProviderSettings) => ProviderSettings
  ): Promise<void> {
    const currentSettings = this.plugin.providerSettings[provider.name] ?? {
      ...provider.defaultSettings,
    };
    this.plugin.providerSettings[provider.name] =
      updateSettings(currentSettings);
    await this.plugin.saveSettings();
    this.display();
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h1", { text: "Providers" });

    for (const provider of providers.filter((p) => p.hasSettings)) {
      const savedSettings =
        this.plugin.providerSettings[provider.name] ?? provider.defaultSettings;

      const providerContainer = containerEl.createDiv();
      providerContainer.createEl("h2", {
        text: provider.settingsMetadata.title,
      });
      providerContainer.createDiv({
        text: provider.settingsMetadata.description,
      });

      new Setting(providerContainer).setName("Enabled").addToggle(
        (component: ToggleComponent): ToggleComponent =>
          component
            .setValue(savedSettings.enabled)
            .onChange(async (value: boolean) => {
              await this.saveProviderSettings(provider, (old) => ({
                ...old,
                enabled: value,
              }));
            })
      );

      if (!savedSettings.enabled) {
        continue;
      }

      new Setting(providerContainer)
        .setName("Enable automatic triggering")
        .addToggle(
          (component: ToggleComponent): ToggleComponent =>
            component
              .setValue(savedSettings.autocompletion.enabled)
              .onChange(async (value: boolean) => {
                await this.saveProviderSettings(provider, (old) => ({
                  ...old,
                  autocompletion: { ...old.autocompletion, enabled: value },
                }));
              })
        );

      if (!savedSettings.autocompletion.enabled) {
        continue;
      }

      new Setting(providerContainer)
        .setName("Custom autocomplete regex")
        .setDesc(
          "Set a custom regex string to be used when determining autocompletion trigger"
        )
        .addText((regexInput: TextComponent): TextComponent => {
          regexInput.onChange((value: string) => {
            this.debouncedRegexInput(
              provider,
              value === ""
                ? provider.defaultSettings.autocompletion.defaultRegexStr
                : value
            );
          });

          if (savedSettings.autocompletion.userRegexStr) {
            regexInput.setValue(savedSettings.autocompletion.userRegexStr);
          } else {
            regexInput.setPlaceholder(
              provider.defaultSettings.autocompletion.defaultRegexStr
            );
          }

          return regexInput;
        });
    }
  }
}
