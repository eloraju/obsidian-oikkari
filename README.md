# Oikkari

(Finnish for shortcut)

A playground for me to create utilities that support my workflow

---

## OikkariSuggest

A simple system that allows me to create autocomplete-esque quick commands.

### How OikkariSuggest works:

Popup menu that appears when you trigger it manually.

When you hit the hotkey, manualTrigger() wakes up and tells Obsidian to show the popup. It looks at what you've typed so
far and uses that as a search query. The current provider hands over its list of suggestions, which get fuzzy-matched and
sorted so the best matches float to the top.

Picking any of the selections uses provider defined `onSelect` to do whatever.

The provider system allows the usage of chained providers and separates logic naturally quite effectively.

---

### What up

- Maybe add `shouldTrigger` to provider type --> would enable the plugin to pick a provider based on input
  - This could be hidden behind a setting `Actual autocomplete` etc. and allow triggering without the hotkey
- Come up with a proper way to handle settings
  - It's messy as I would like to have support for third party plugins.
    I want to be able to just drop a `someProvider.js` file in a dedicated folder
    and have the plugin read the provider from there. This way anyone can add more providers.
- Add some plugin spesific autocompletions?
