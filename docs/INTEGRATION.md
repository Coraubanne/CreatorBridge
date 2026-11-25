# Contrat d’intégration Creator Bridge

Ce contrat fixe les exigences pour une extension qui envoie des fichiers dans Premiere Pro. Il s’appuie sur ClipFlow et Capture8K. Il précise aussi les garde-fous qu’une nouvelle intégration doit valider. Le [guide de référence](GUIDE.md) reste la source des chemins, des champs JSON et de la procédure de publication.

## Démarrer dans un nouveau dépôt

1. Demandez à Codex ou Claude Code de lire [AGENTS.md](../AGENTS.md), ce contrat et le [guide de référence](GUIDE.md). Indiquez-lui le navigateur, le nom de l’application et le dossier du compagnon macOS.
2. Repérez où l’application mémorise sa destination, où elle parle au compagnon, où elle écrit le fichier final et comment elle signale une erreur. Identifiez ces quatre points avant de modifier les écrans.
3. Attribuez un identifiant stable au nouveau producteur. Ajoutez-le au registre du guide. Intégrez le panneau officiel épinglé à une version ou à un commit du dépôt `Coraubanne/CreatorBridge`.
4. Ajoutez les parcours **export vers Premiere** et **mise à jour du plugin** au compagnon avec des résultats distincts. Branchez ensuite les commandes du navigateur. Validez les deux parcours et les destinations locales.

Consigne à copier dans le `AGENTS.md` d’un projet consommateur ou à donner à l’agent au début d’une tâche.

> Avant d’intégrer ou de modifier Creator Bridge, lis le [point d’entrée pour les agents](https://github.com/Coraubanne/CreatorBridge/blob/main/AGENTS.md), le [contrat d’intégration](https://github.com/Coraubanne/CreatorBridge/blob/main/docs/INTEGRATION.md) et le guide lié. Repère les contrôles de la destination dans le popup et le compagnon. Vérifie le contrat avec la matrice de tests et indique les écarts qui restent à traiter.

Le fichier d’instructions du dépôt consommateur doit renvoyer à la référence. Le simple fait que le plugin existe sur GitHub ou dans un sous-module ne garantit pas que l’agent qui travaille dans un autre dépôt chargera ses instructions. Pour Claude Code, un `CLAUDE.md` local peut importer le `AGENTS.md` du projet avec `@AGENTS.md`. [Découverte des instructions Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Import des instructions dans Claude Code](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)

## Déclencher les mises à jour au bon moment

| Événement | Destination de l’extension | Comportement attendu |
| --- | --- | --- |
| Ouverture du popup ou des réglages | Toutes | Afficher le réglage enregistré. Si le logiciel a sa propre recherche automatique, elle concerne le logiciel uniquement. |
| Sélection de Premiere Pro | Changement vers Premiere Pro | Enregistrer le choix et préparer localement le plugin embarqué si nécessaire. La sélection ne lance aucune recherche réseau de Creator Bridge. |
| Clic **Chercher une mise à jour** | Téléchargements, dossier choisi ou préférence inconnue | Vérifier le logiciel. Zéro requête au dépôt Creator Bridge et aucun bouton d’installation du plugin. |
| Clic **Chercher une mise à jour** | Premiere Pro confirmé | Vérifier le logiciel et, séparément, la dernière release stable de Creator Bridge. Un échec de l’un laisse l’autre parcours utilisable. |
| Changement de destination pendant une recherche | Sortie du mode Premiere | Effacer l’offre et son état. Ignorer les résultats tardifs, même si l’utilisateur sélectionne de nouveau Premiere entre-temps. |
| Clic **Installer Creator Bridge** | Premiere Pro confirmé et offre encore valide | Relire la release et valider le choix, vérifier l’archive, puis installer sous le verrou partagé. |
| Clic **Installer la mise à jour du logiciel** | Toutes | Suivre le parcours du logiciel. L’éventuelle copie embarquée du Bridge reste soumise aux règles de version et de coexistence. |

Dans le popup, associez un identifiant de requête à chaque recherche et invalidez-le lors d’un changement de destination. Masquez le bouton d’installation pendant l’attente et si le résultat ne s’applique plus. Désactivez ou dédupliquez les actions en cours. L’utilisateur doit pouvoir distinguer **aucune version plus récente**, **vérification échouée** et **installation réussie**. Une installation réussie du Bridge demande de relancer Premiere Pro s’il est ouvert et de rouvrir son panneau.

Dans le compagnon, relisez votre préférence locale ou votre état de session approuvé avant tout appel réseau, pour la recherche comme pour l’installation. Un message fourni par une page web ou un simple paramètre `destination: "premiere"` ne suffit pas pour réactiver l’intégration. Le compagnon doit recevoir des commandes différenciées, par exemple `check_bridge_update` et `install_bridge_update`. À l’installation, revérifiez que la version correspond à l’offre courante et que la destination est encore autorisée avant de remplacer les fichiers. Une réponse périmée ne doit pas changer l’état affiché ni proposer une nouvelle installation.

## Installer une seule copie du panneau

- Distinguez **préparer le plugin local fourni avec une distribution**, **chercher une release autonome** et **installer cette release**. Une installation initiale doit pouvoir préparer la copie embarquée hors ligne. Une vérification autonome n’exige pas que Premiere soit ouvert.
- Conservez l’identité du manifeste UXP, la version minimale de Premiere déclarée et l’emplacement géré documenté dans le [guide](GUIDE.md#conserver-une-seule-identité). La version du dossier doit correspondre à celle du manifeste. L’état lu dans `PluginData` peut encore signaler l’ancienne version tant que Premiere n’a pas rechargé le panneau.
- Comparez numériquement les versions valides. Une copie valide de même version ou plus récente suffit, quel que soit le logiciel qui l’a installée. Une copie corrompue doit donner un état réparable ou un diagnostic explicite. Le simple nom d’un dossier ne prouve ni l’identité ni la validité du plugin.
- Faites passer chaque écriture, y compris depuis un nouvel installateur, une mise à jour du logiciel ou un nettoyage de doublons, par le verrou commun décrit dans le guide. Sous le verrou, relisez la version installée et laissez la version la plus récente gagner. Préparez une copie validée sur le même volume et publiez-la par renommage. Nettoyez uniquement les dossiers anciens dont le manifeste correspond au plugin, et seulement après succès.
- Laissez en place les fichiers des projets, les médias, les demandes d’import et les résultats. Le retrait d’une application doit conserver le panneau partagé quand une autre intégration peut encore l’utiliser.
- Chargez les métadonnées de la dernière release stable de `Coraubanne/CreatorBridge` via HTTPS. Construisez le nom `CreatorBridge-v<version>.zip` et son URL à partir de constantes locales et d’un tag validé. Validez le champ GitHub `digest`, la taille, le contenu attendu de l’archive, l’identité du manifeste et la version. Utilisez un dossier temporaire privé et vérifiez le contenu avant toute écriture dans Adobe. [API GitHub Releases](https://docs.github.com/en/rest/releases/releases#get-the-latest-release)
- Un tag sans ZIP valide, un digest manquant ou divergent, un délai dépassé ou une erreur réseau doivent laisser la copie existante utilisable. La recherche et l’installation du Bridge ne doivent jamais bloquer un export local.

## Importer dans le projet choisi

1. Au départ, validez la destination et figez le couple `projectPath` et dossier `PluginData` issu du même état récent. Exigez un vrai fichier `.prproj` absolu, un timestamp Unix en millisecondes valide et un chemin admissible. Ignorez les états périmés ou illisibles. En présence de plusieurs versions de Premiere, choisissez l’état valide le plus récent.
2. Si le panneau est indisponible ou si le projet est sans nom, affichez l’action à faire. Si le projet change pendant l’export, conservez le fichier, gardez le projet cible initial et proposez de rouvrir le bon projet. Pour envoyer la capture ou le média ailleurs, demandez un choix explicite.
3. Écrivez le média final avant de mettre l’import en file. Utilisez un chemin durable dans un dossier lisible par Premiere. Le plugin importe le fichier par référence. Évitez les chemins de fichiers temporaires et les déplacements après publication. Publiez le JSON atomiquement, avec un `jobId` unique et les champs du [protocole](GUIDE.md#3-envoyer-un-fichier-terminé).
4. Distinguez **fichier enregistré**, **demande en attente**, **import confirmé** et **import refusé**. Par exemple, le son de fin de Capture8K peut indiquer que le PNG est enregistré. Il ne certifie pas un import. Une réponse partiellement écrite peut être relue pendant le délai. Un import en attente peut réussir après la fermeture du popup.
5. Lisez et supprimez uniquement le résultat de votre propre tâche. Un délai dépassé ou une interruption ne prouve pas que l’import a échoué. Avant un nouvel envoi, vérifiez l’état de la demande, le résultat et, si nécessaire, le projet Premiere. Le protocole actuel ne garantit pas un import exactement une fois si Premiere s’arrête entre l’import et l’écriture de l’accusé.

Le compagnon décide des chemins locaux et des écritures. Validez l’identifiant du job, son origine et le type des champs. Évitez les chemins arbitraires, les remontées de répertoire et les liens symboliques qui sortent des dossiers attendus. Protégez la messagerie native et refusez les commandes venant d’une page ou d’une extension non autorisée. Les identifiants de producteur servent à la corrélation et à l’affichage. Les chemins, URL privées, noms de projets et fichiers de travail restent locaux, y compris pendant une vérification GitHub.

## Lire les deux intégrations de référence

| Point à inspecter | ClipFlow | Capture8K |
| --- | --- | --- |
| Réglages et commande du navigateur | `outputs/ClipFlow Chrome/popup.js` et `background.js` | `extension/popup.js` et `background.js`, puis `extension-firefox/` |
| Préférence de destination | `settings.destination` dans l’extension | `outputMode` confirmé par le compagnon |
| Résolution du projet et mise en file | `outputs/ytdlp/native_host.py` et `app.py` | `macos/Sources/Capture8KNativeHost/main.m` |
| Réglages et installation du plugin embarqué | Installateur et `outputs/ytdlp/updater.py` | `macos/Sources/Shared/Capture8KShared.m` et `macos/Resources/install-update.sh` |
| Résultat observable | ClipFlow attend un accusé Premiere dans son moteur | Capture8K remonte notamment si la demande d’import du PNG a été mise en file |

Ouvrez les sources au tag utilisé et vérifiez les fonctions réellement livrées. Les règles relatives au filtrage natif, à l’accusé d’import et au verrou commun s’appliquent à une nouvelle intégration. Leur présence dans ce document ne signifie pas que chaque installateur historique ou version ancienne les applique déjà. [Sources ClipFlow](https://github.com/Coraubanne/clipflow) · [Sources Capture8K](https://github.com/Coraubanne/Capture8K)

## Tests de conformité

| Scénario | Preuve à obtenir |
| --- | --- |
| Ouverture, changement de langue, sélection de Premiere Pro ou export | Aucun appel réseau au dépôt Creator Bridge tant que l’utilisateur ne déclenche pas la recherche. Les libellés restent compréhensibles en français et en anglais si l’application propose ces langues. |
| Clic de recherche en Téléchargements et en dossier personnalisé | La mise à jour du logiciel répond. Le compteur des requêtes Bridge reste à zéro. Le compagnon refuse aussi un message Bridge injecté directement dans ce mode. |
| Recherche en mode Premiere puis changement rapide de destination | Une réponse tardive garde le bouton Bridge masqué. Revenir à Premiere impose une nouvelle recherche. Testez aussi l’échec d’un seul des deux flux de mise à jour. |
| Release plus récente valide, égale, plus ancienne, absente ou incomplète | Le bouton est proposé uniquement pour une version plus récente dont les métadonnées sont valides. Une version égale ou supérieure reste en place. Une installation d’une offre devenue périmée demande une nouvelle vérification. |
| Premiere fermé pendant la mise à jour, ZIP altéré ou téléchargement interrompu | La vérification peut aboutir avec Premiere fermé. Une archive altérée ne remplace aucun fichier installé. La copie valide et les données Adobe restent disponibles. |
| Deux compagnons ou installateurs concurrents | Les deux respectent le même verrou. La version valide la plus récente reste seule en service. Un installateur ancien ne rétrograde jamais le plugin. |
| Première installation avec ou sans réseau et migration depuis l’ancien panneau | Le composant fourni fonctionne hors ligne selon le parcours de l’application. L’identité technique, le projet, les fichiers et les données Adobe survivent à la migration. |
| Panneau fermé, projet non enregistré, état périmé ou deux projets ouverts | La commande pointe vers le projet enregistré choisi. Une erreur de disponibilité donne une action à entreprendre. Aucun import ne se retrouve dans un autre projet. |
| Demandes simultanées de deux producteurs, résultat tardif ou refus d’un format | Les fichiers et leurs réponses restent distincts. Un délai n’empêche pas un import ultérieur. Un refus ne supprime jamais le média. |
| Mise à jour réelle avec les deux applications installées | Vérification du tag et du ZIP distribués, relance de Premiere, import depuis ClipFlow puis depuis Capture8K vers le bon projet. Testez sur chaque navigateur pris en charge par l’intégration. |

Testez d’abord le routage des commandes, le compteur de requêtes et les transitions d’état avec un compagnon simulé. Testez ensuite version, corruption et concurrence dans des dossiers isolés. Terminez avec un projet Premiere enregistré et non sensible. Dans le compte rendu, distinguez les tests automatisés des imports et mises à jour observés dans Premiere.
