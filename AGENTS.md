# Intégrer Creator Bridge dans une application

Creator Bridge est le panneau Premiere Pro UXP partagé par ClipFlow et Capture8K. Lisez le [contrat d’intégration](docs/INTEGRATION.md) avant de l’ajouter à une extension navigateur ou de modifier un client existant. Le [guide de référence](docs/GUIDE.md) décrit le protocole de fichiers, les chemins macOS et le format des releases.

## Conditions obligatoires

- Gardez l’identifiant UXP `fr.clipflow.premiere.bridge` et l’identifiant de panneau `clipflowBridge`. Utilisez le plugin partagé et donnez à votre application son propre identifiant de producteur.
- Séparez l’extension, le compagnon local et le panneau. L’extension gère les préférences et l’affichage. Le compagnon vérifie les entrées, les chemins et les mises à jour. Le panneau importe les médias dans Premiere Pro.
- **Vérifiez une mise à jour de Creator Bridge seulement lorsque la destination confirmée est Premiere Pro et que l’utilisateur clique sur « Chercher une mise à jour ».** Ouvrir les réglages, choisir Premiere Pro ou lancer une capture ou un téléchargement ne déclenche aucune vérification réseau du Bridge. Avec Téléchargements ou un autre dossier, le bouton vérifie uniquement le logiciel.
- Appliquez cette condition dans le popup **et** dans le compagnon natif, pour la recherche et l’installation. Tant que la préférence n’est pas chargée ou confirmée, refusez l’action Bridge. Ignorez toute réponse devenue obsolète après un changement de destination. Gardez des états et des messages séparés pour la mise à jour du logiciel et celle du plugin.
- Présentez un bouton **Installer Creator Bridge** avec le numéro de version uniquement pour une version stable, vérifiable et plus récente. Le clic est explicite. Le compagnon fixe le dépôt officiel, relit la release, contrôle l’empreinte SHA-256 et compare à nouveau la version installée. L’extension transmet la version choisie. Elle ne choisit ni l’URL ni les chemins d’installation.
- Faites passer les installations du plugin fourni avec l’app et les mises à jour autonomes par le même verrou local. Conservez la version valide la plus récente, préservez les données Adobe et les médias, et gardez une copie opérationnelle en cas d’échec.
- Pour chaque export Premiere, associez la demande à un projet `.prproj` enregistré et à un état Creator Bridge valide de 15 secondes au plus. Épinglez ce projet au début de l’opération. N’importez jamais dans un autre projet en cas de changement.
- Enregistrez un fichier durable avant de publier atomiquement `Imports/<jobId>.json`. Choisissez un identifiant unique dans la file partagée. Comptez l’import comme terminé uniquement après `Results/<jobId>.json` avec `state: "complete"`. Le délai dépassé laisse l’import en attente. Ne relancez pas à l’aveugle et ne purgez jamais la file commune.
- Testez la [matrice de validation](docs/INTEGRATION.md#tests-de-conformité) avant de déclarer l’intégration conforme. Pour une version déjà publiée, vérifiez le code au tag de release. Les exemples de deux applications peuvent couvrir des comportements différents.

## Travailler dans le dépôt d’une autre extension

Dans le dépôt consommateur, ajoutez un renvoi à ce fichier et au contrat depuis son propre `AGENTS.md` et, si nécessaire, depuis son `CLAUDE.md`. Demandez explicitement à l’agent de lire le contrat si Creator Bridge est seulement une dépendance ou un lien GitHub. Quand les règles sont épinglées à un commit local ou au sous-module `vendor/CreatorBridge`, indiquez le chemin et vérifiez que le sous-module est initialisé. Gardez une seule copie de référence des règles.
