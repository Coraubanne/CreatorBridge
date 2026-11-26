# Creator Bridge

Import ClipFlow videos and Capture8K screenshots into Adobe Premiere Pro’s **Project** panel. Creator Bridge is the UXP panel shared by both apps.

**[User and integration guide (French)](docs/GUIDE.md)** · [Latest release](https://github.com/Coraubanne/CreatorBridge/releases/latest) · [Français](README.md)

macOS · Premiere Pro 25.6+

## Use Creator Bridge

1. Install [ClipFlow](https://github.com/Coraubanne/clipflow) or [Capture8K](https://github.com/Coraubanne/Capture8K). Both distributions include Creator Bridge.
2. Open a **saved** project in Premiere Pro, then open **Window → UXP Plug-ins → Creator Bridge**.
3. Select **Premiere Pro** as the destination in ClipFlow or Capture8K, then start a download or capture. The app saves the file on your Mac and Creator Bridge imports it into the Project panel.

Creator Bridge processes import requests locally. Both apps share the same panel installation within a macOS user account.

## Updates

Select **Premiere Pro** as the destination in ClipFlow or Capture8K, then click **Check for updates**. If a new panel version is available, the extension shows a separate **Install Creator Bridge** button.

Both apps use the latest valid installed copy. After updating, restart Premiere Pro if it was running, then reopen the panel. [Update behavior (French)](docs/GUIDE.md#installer-et-mettre-à-jour-le-plugin-partagé)

## Integrate an app

- [Integration contract](docs/INTEGRATION.md) and [conformance tests](docs/INTEGRATION.md#tests-de-conformité).
- [Reference guide](docs/GUIDE.md) for the local queue, import results and release procedure.
- [Instructions for Codex and Claude Code](AGENTS.md).

Keep the UXP ID `fr.clipflow.premiere.bridge` and panel ID `clipflowBridge` stable across integrations. Run `zsh build-release.sh` to build the standalone archive used by the ClipFlow and Capture8K updaters.

[MIT License](LICENSE)
