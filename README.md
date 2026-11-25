# Creator Bridge

Creator Bridge est le pont UXP partagé qui importe dans Adobe Premiere Pro les médias produits par ClipFlow et les captures PNG produites par Capture8K.

Le [guide de référence Creator Bridge](docs/GUIDE.md) décrit l’utilisation dans Premiere Pro, l’ajout d’une application compatible et la publication des mises à jour du module partagé.

## Principes

- un seul identifiant technique conservé pour la compatibilité : `fr.clipflow.premiere.bridge` ;
- un seul dossier installé par version, quelle que soit l’application qui l’installe ;
- aucune rétrogradation : un installateur plus ancien conserve une version plus récente déjà présente ;
- une file commune, avec chaque tâche identifiée par son producteur (`clipflow` ou `capture8k`) ;
- aucune donnée envoyée sur Internet : le pont lit uniquement sa file locale Adobe `plugin-data:/`.

## Installation

ClipFlow et Capture8K embarquent une version précise de Creator Bridge dans leur distribution et l’installent automatiquement. Dans Premiere Pro, le panneau se trouve dans **Fenêtre → Plug-ins UXP → Creator Bridge**. Le projet doit être enregistré pour permettre l’import automatique.

## Développement

Le dossier contient directement le paquet UXP. Le numéro de version dans `manifest.json` est la référence utilisée par les installateurs anti-doublon.
