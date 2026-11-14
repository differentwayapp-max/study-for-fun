#!/usr/bin/env bash
# Bump the app version everywhere (service worker, page, version.json) and deploy hosting.
# Usage: tools/deploy.sh "commit message"
set -euo pipefail
cd "$(dirname "$0")/.."
cur=$(grep -o "const VERSION = 'sff-v[0-9]*'" public/sw.js | grep -o '[0-9]*')
new="sff-v$((cur+1))"
sed -i "s/const VERSION = 'sff-v$cur'/const VERSION = '$new'/" public/sw.js
sed -i "s/<meta name=\"sff-ver\" content=\"[^\"]*\">/<meta name=\"sff-ver\" content=\"$new\">/" public/index.html
sed -i -E "s/\?v=sff-v[0-9]+\"/?v=$new\"/g" public/index.html   # file addresses carry the version → no phone mixes old files with a new page
printf '{"v": "%s"}' "$new" > public/version.json
git add -A && git commit -qm "${1:-Deploy $new}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_018ARCFrnypinXbQosbA2nGK"
firebase deploy --only hosting --non-interactive 2>&1 | sed 's/\x1b\[[0-9;?]*[A-Za-z]//g' | tail -1
echo "deployed $new"
