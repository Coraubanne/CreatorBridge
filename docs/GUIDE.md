# Guide de référence Creator Bridge

Creator Bridge importe dans le projet Premiere Pro actif les fichiers préparés par des applications telles que ClipFlow et Capture8K. Ce guide explique comment utiliser le panneau, raccorder une autre application et faire évoluer le module partagé en préservant les intégrations existantes.

## Utiliser Creator Bridge dans Premiere Pro

1. Installez l’application compatible et son compagnon macOS. Creator Bridge s’installe dans le compte utilisateur selon le mode de distribution de l’application.
2. Dans Premiere Pro 25.6 ou plus récent, ouvrez un projet enregistré et affichez **Fenêtre → Plug-ins UXP → Creator Bridge**.
3. Sélectionnez **Premiere Pro** comme destination dans l’application compatible, puis lancez l’export ou le téléchargement. Le compagnon enregistre un fichier local terminé et demande son importation à la racine du projet. [API Adobe Premiere Pro](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/classes/project)
4. Après une mise à jour du plugin, relancez Premiere Pro s’il était ouvert, puis rouvrez le panneau.

Dans les applications qui prennent en charge la vérification indépendante, **Chercher une mise à jour** consulte aussi le dépôt Creator Bridge lorsque **Premiere Pro** est la destination active. L’installation de Creator Bridge fait l’objet d’une action séparée. Dès que Premiere charge la nouvelle version, toutes les applications compatibles du même compte peuvent l’utiliser.

## Conserver une seule identité

| Élément | Valeur à conserver |
| --- | --- |
| Identifiant UXP | `fr.clipflow.premiere.bridge` |
| Identifiant du panneau | `clipflowBridge` |
| Dossier d’installation géré sur macOS | `~/Library/Application Support/Adobe/UXP/Plugins/External/fr.clipflow.premiere.bridge_<version>/` |
| Dossier de données Adobe observé sur macOS | `~/Library/Application Support/Adobe/UXP/PluginsStorage/PPRO/<version Premiere>/External/fr.clipflow.premiere.bridge/PluginData/` |
| Version du protocole de fichiers | `schemaVersion: 1` |

Le nom visible du panneau peut évoluer. L’identifiant UXP, l’identifiant du panneau et les chemins relatifs des fichiers font partie de la compatibilité avec les installations existantes. Les données `PluginData` sont distinctes des fichiers du plugin. Une installation ou une mise à jour doit préserver les demandes d’import, les réponses et les médias.

## Connecter une application

### 1. Donner un nom au producteur

Choisissez un identifiant court, stable, en minuscules, distinct des identifiants déjà utilisés. Ajoutez-le au registre ci-dessous lors de l’intégration. Utilisez le nom visible de votre application dans `producerName`.

| Producteur | Application | Valeur de `kind` utilisée |
| --- | --- | --- |
| `clipflow` | ClipFlow | `media` |
| `capture8k` | Capture8K | `still` |

Le champ `producers` de `active-project.json` est informatif dans Creator Bridge 1.1.0. Le lecteur de la file ne s’en sert pas pour autoriser ou refuser une demande.

### 2. Repérer le projet actif

- Cherchez les dossiers `PluginData` sous les versions installées de Premiere. Lisez `active-project.json` dans ces dossiers et choisissez un état valide et récent. ClipFlow et Capture8K utilisent un délai de fraîcheur de 15 secondes. Pour une nouvelle intégration, ignorez les fichiers illisibles, les dates aberrantes et les chemins invalides.
- Exigez un chemin local absolu vers un fichier `.prproj` existant. Conservez ce chemin et le dossier `PluginData` qui l’a fourni ensemble. La mise en file doit viser ce même dossier.
- Capturez le projet cible au début de l’opération. Si le projet actif change pendant l’export, présentez la situation à l’utilisateur avant de réaffecter la demande. Creator Bridge 1.1.0 laisse en attente les demandes des autres projets.
- Les intégrations historiques peuvent aussi lire `~/Library/Application Support/ClipFlow/Premiere/`. Pour une nouvelle application, privilégiez le dossier Adobe détecté.

L’état publié contient `projectPath`, `projectName`, `projectGuid`, `updatedAt` ainsi que les métadonnées `schemaVersion`, `bridgeName`, `bridgeVersion` et `producers`. Les dates sont des timestamps Unix en **millisecondes**.

### 3. Envoyer un fichier terminé

Enregistrez d’abord le média dans un emplacement durable, par exemple dans un sous-dossier de votre application à côté du projet. Premiere référence ce fichier à son emplacement. Une fois la demande publiée, conservez le média à cet emplacement pour éviter les fichiers hors ligne.

Utilisez un identifiant unique sur l’ensemble de la file, par exemple `monapp_<uuid>`. Limitez-le aux lettres ASCII, chiffres, tirets et tirets bas, sur 96 caractères maximum. Le nom du fichier et la valeur `jobId` doivent correspondre.

Écrivez le JSON UTF-8 dans un fichier temporaire du dossier `Imports`, puis renommez-le en `Imports/<jobId>.json` sur le même volume. Le renommage atomique permet à Premiere de lire la demande complète. Exemple avec une application fictive.

```json
{
  "schemaVersion": 1,
  "jobId": "monapp_92f9313f0ca64a238321546636af09f3",
  "producer": "monapp",
  "producerName": "Mon application",
  "kind": "still",
  "mediaPath": "/Users/exemple/Documentaire/Mes captures/Plan 01.png",
  "projectPath": "/Users/exemple/Documentaire/Montage.prproj",
  "requestedAt": 1795593600000
}
```

`kind` décrit le média. Creator Bridge 1.1.0 importe via `Project.importFiles` et se fie à Premiere pour la prise en charge du format. Le chemin cible du projet est vérifié par comparaison avec le projet actif.

### 4. Lire le résultat

Lisez `Results/<jobId>.json` pour votre propre demande. Le nom du fichier sert à la corrélation. Creator Bridge 1.1.0 écrit `state` (`complete` ou `error`), `message`, `updatedAt`, `schemaVersion` et `producer`. En compatibilité avec l’ancien panneau, prévoyez que certaines métadonnées de réponse puissent être absentes.

- Affichez une réussite seulement après lecture de `state: "complete"`. Pour un JSON momentanément illisible pendant son écriture, réessayez jusqu’au délai prévu.
- Un délai dépassé veut dire **import en attente ou état inconnu**. Le média reste disponible, et le plugin peut traiter la demande plus tard. Évitez une réémission automatique. Après une interruption brutale, un import peut déjà avoir été fait avant l’écriture de son résultat.
- Supprimez uniquement le résultat de votre tâche après l’avoir lu. Laissez Creator Bridge retirer la demande traitée et évitez toute purge générale de la file partagée.

Gardez les accès au système de fichiers et la validation des chemins dans le compagnon local. Évitez d’exposer l’écriture de la file à des pages web ou à des processus non approuvés. Les champs `producer` et `producerName` identifient la demande pour le suivi. Ils ne constituent pas un contrôle d’accès. Les chemins de projet et de média doivent rester locaux.

## Installer et mettre à jour le plugin partagé

### Déclenchement de la mise à jour

**La destination Premiere Pro doit être active dans l’application** pour rechercher et proposer une mise à jour de Creator Bridge. Avec **Téléchargements** ou un dossier personnalisé, l’action **Chercher une mise à jour** vérifie uniquement l’application elle-même.

1. Lorsque l’utilisateur lance la vérification, consultez la dernière release stable de l’application et, si la destination Premiere Pro est active, celle de Creator Bridge sur son propre dépôt. Chaque vérification doit pouvoir aboutir même si l’autre échoue.
2. Proposez **Installer Creator Bridge** uniquement si le compagnon trouve une version installable plus récente que la copie locale. Une absence de release stable laisse la copie locale disponible. Si l’utilisateur change de destination, retirez la proposition.
3. Au clic, revalidez la destination et la version proposée. Vérifiez l’archive puis installez-la sous le verrou partagé. Si une autre application a déjà installé la même version ou une version supérieure, utilisez cette copie.
4. Invitez l’utilisateur à relancer Premiere Pro s’il était ouvert, puis à rouvrir le panneau. La vérification et l’installation peuvent se faire avec Premiere fermé. **Pour importer**, Premiere doit être ouvert avec un projet enregistré actif et le panneau Creator Bridge chargé.

### Règles pour les applications

- Comparez les versions numériques `MAJEUR.MINEUR.CORRECTIF` à partir d’un manifeste qui porte le bon identifiant. Un tri alphabétique placerait par exemple `1.10.0` avant `1.9.0`.
- Conservez toute installation valide de version égale ou supérieure à celle proposée. Une seule application suffit à faire évoluer la copie commune.
- Faites passer toutes les écritures via le même verrou local `External/.creator-bridge.lock`. Recomparez la version installée sous ce verrou. Préparez la nouvelle copie dans un dossier temporaire sur le même volume, validez-la puis renommez-la à sa destination. Nettoyez les copies plus anciennes dont l’identité a été vérifiée une fois la nouvelle copie en place. Les mécanismes historiques qui ne prennent pas ce verrou doivent être alignés avant de tester des installations simultanées.
- Si vous implémentez un compagnon natif, prenez un verrou POSIX exclusif `fcntl` sur tout le fichier, compatible avec `zsystem flock` utilisé par le programme de mise à jour. Fixez un délai d’attente et conservez le fichier de verrou au même chemin entre les opérations.
- Construisez l’URL du téléchargement dans le compagnon à partir du dépôt officiel, du tag et du nom d’archive attendus. Le navigateur transmet la version choisie.
- Un échec de vérification ou d’installation doit laisser le plugin opérationnel et les données en place. L’utilisateur doit pouvoir continuer à exporter des fichiers vers ses autres destinations.

### Publication d’une version autonome

1. Incrémentez `version` dans `manifest.json` et mettez `bridgeVersion` dans `index.js` au même numéro tant qu’il est écrit en dur. Un ajout de champ doit rester compatible avec les clients existants. Une rupture du protocole demande une nouvelle version de schéma et une transition testée avec les anciens clients.
2. Créez une archive `CreatorBridge-v<version>.zip` contenant **à la racine** `manifest.json`, `index.html`, `index.js`, `styles.css` et `LICENSE`. Les compagnons actuels lisent ces cinq fichiers. Une version qui en exige d’autres nécessite d’abord une évolution du programme d’installation.
3. Joignez le ZIP à une release GitHub publique stable portant le tag `v<version>`. Vérifiez que l’API de la dernière release renvoie le bon tag, le nom exact du fichier et un champ d’empreinte `digest` au format `sha256:<empreinte>`. Les clients vérifient cette empreinte avant de lire le ZIP et contrôlent le manifeste avant d’installer le module. [API des releases GitHub](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)
4. Testez la détection et l’installation depuis chaque application compatible, puis relancez Premiere et refaites un import depuis chacune.

Pour le premier déploiement, distribuez aux utilisateurs les versions de ClipFlow et Capture8K qui disposent de cette vérification indépendante. Une mise à jour ultérieure de Creator Bridge peut ensuite être publiée sur son seul dépôt.

Depuis la racine du dépôt, avec un numéro cohérent dans les fichiers du plugin, ces commandes construisent et vérifient une archive neuve.

```sh
version=$(/usr/bin/plutil -extract version raw -o - manifest.json)
archive="CreatorBridge-v${version}.zip"
test ! -e "$archive" &&
  /usr/bin/zip -X "$archive" manifest.json index.html index.js styles.css LICENSE &&
  /usr/bin/unzip -t "$archive"
```

Lorsqu’une nouvelle version de ClipFlow doit pouvoir être installée via son ancien bouton de mise à jour, conservez aussi la compatibilité du ZIP ClipFlow. Les versions 2.13.3 et 2.14.0 attendent respectivement les dossiers `ClipFlow Premiere` et `Creator Bridge`. Les deux noms dans le ZIP de transition désignent le même plugin UXP.

## Valider une nouvelle intégration

- [ ] Première installation sur un compte sans Creator Bridge, puis mise à jour depuis le panneau historique ClipFlow.
- [ ] Deux applications déjà connectées dans Premiere, puis ajout du nouveau producteur avec un projet de test. Importer les fichiers de chaque application et vérifier qu’ils arrivent dans le bon projet.
- [ ] Export vers un dossier ordinaire. Aucune requête vers le dépôt Creator Bridge durant la recherche de mise à jour.
- [ ] Premiere fermé, panneau absent, projet non enregistré et changement de projet pendant un export. Vérifier le message et la conservation du fichier local.
- [ ] Demandes simultanées de plusieurs producteurs. Vérifier l’unicité des identifiants et la récupération des bons résultats. Tester un format refusé et une réponse tardive.
- [ ] Mise à jour sur une installation plus ancienne, de même version et plus récente. Vérifier la conservation des données Adobe et le redémarrage de Premiere.
- [ ] Deux tentatives d’installation en parallèle, puis un téléchargement interrompu et un ZIP dont l’empreinte est incorrecte. Vérifier que la dernière copie valide reste utilisable.
- [ ] Migration depuis les extensions navigateur déjà installées. Vérifier le chemin d’installation, les réglages et la liaison avec le compagnon existant.

### Dépannage

| Symptôme | Point à vérifier |
| --- | --- |
| Premiere Pro est indiqué comme indisponible | Ouvrez le panneau avec un projet enregistré et vérifiez que `active-project.json` s’actualise dans le dossier Adobe choisi. |
| Le média est enregistré et l’import reste en attente | Comparez le `projectPath` de la demande au projet actif. Cherchez ensuite le fichier de résultat correspondant avant de relancer. |
| Une release GitHub est visible sans proposition d’installation | Vérifiez la destination Premiere, la version installée, le tag stable, le nom du ZIP et son empreinte dans l’API. |
| Premiere affiche plusieurs panneaux ou affiche encore l’ancien nom | Fermez Premiere, vérifiez les manifestes des copies installées, conservez la plus récente valide et rouvrez Premiere. Laissez `PluginData` en place. |
