# Creator Bridge

Importez les vidéos de ClipFlow et les captures de Capture8K dans le panneau **Projet** d’Adobe Premiere Pro. Creator Bridge est le panneau UXP partagé par les deux applications.

**[Guide d’utilisation et d’intégration](docs/GUIDE.md)** · [Dernière version](https://github.com/Coraubanne/CreatorBridge/releases/latest) · [English](README.en.md)

macOS · Premiere Pro 25.6+

## Utiliser Creator Bridge

1. Installez [ClipFlow](https://github.com/Coraubanne/clipflow) ou [Capture8K](https://github.com/Coraubanne/Capture8K). Les deux distributions incluent Creator Bridge.
2. Ouvrez un projet **enregistré** dans Premiere Pro, puis ouvrez **Fenêtre → Plug-ins UXP → Creator Bridge**.
3. Choisissez **Premiere Pro** comme destination dans ClipFlow ou Capture8K, puis lancez le téléchargement ou la capture. L’application enregistre le fichier sur le Mac et Creator Bridge l’importe dans le panneau Projet.

Creator Bridge traite les demandes localement. Les deux applications partagent la même installation du panneau sur un compte macOS.

## Mettre à jour

Dans le panneau Creator Bridge de Premiere, cliquez sur **Chercher une mise à jour**. Le panneau vérifie sa propre version et ouvre la release GitHub lorsqu’une mise à jour est disponible.

Sélectionnez **Premiere Pro** comme destination dans ClipFlow ou Capture8K, puis cliquez sur **Chercher une mise à jour**. Si une nouvelle version du panneau est disponible, l’extension affiche le bouton **Installer Creator Bridge** séparément.

Les deux applications utilisent la dernière copie valide installée. Après une mise à jour, relancez Premiere Pro s’il était ouvert, puis rouvrez le panneau. [Détails sur les mises à jour](docs/GUIDE.md#installer-et-mettre-à-jour-le-plugin-partagé)

## Intégrer une application

- [Contrat d’intégration](docs/INTEGRATION.md) et [tests de conformité](docs/INTEGRATION.md#tests-de-conformité).
- [Guide de référence](docs/GUIDE.md) pour la file locale, les réponses d’import et la publication.
- [Consignes pour Codex et Claude Code](AGENTS.md).

L’identifiant UXP `fr.clipflow.premiere.bridge` et l’identifiant du panneau `clipflowBridge` assurent la compatibilité des intégrations. Le script `zsh build-release.sh` fabrique l’archive autonome lue par les programmes de mise à jour de ClipFlow et Capture8K.

[Licence MIT](LICENSE)
