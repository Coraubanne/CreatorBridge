#!/bin/zsh
set -euo pipefail

source_dir="${0:A:h}"
version="$(/usr/bin/plutil -extract version raw -o - "$source_dir/manifest.json")"
[[ "$version" =~ '^(0|[1-9][0-9]{0,7})\.(0|[1-9][0-9]{0,7})\.(0|[1-9][0-9]{0,7})$' ]]
destination_dir=${1:-$PWD}
destination="${destination_dir:A}/CreatorBridge-v$version.zip"
[[ ! -e "$destination" ]]
cd "$source_dir"
/usr/bin/zip -X -q "$destination" manifest.json index.html index.js styles.css LICENSE
/usr/bin/unzip -tq "$destination"
print -r -- "$destination"
