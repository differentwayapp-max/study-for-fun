#!/usr/bin/env bash
# Bump the app version everywhere (service worker, page, version.json) and deploy hosting.
# Usage: tools/deploy.sh "commit message"
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "✗ deploy from the main branch only"; exit 1; }
# 1. GitHub must not be ahead of this copy (otherwise this deploy would hide work that is only on GitHub)
git fetch -q origin main || { echo "✗ git fetch failed – not deploying"; exit 1; }
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "✗ origin/main has commits this copy does not have – run: git pull --no-rebase origin main   (not deploying)"; exit 1
fi
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
# 2. back up to GitHub (retry on network errors) – a failed push stops with an error, it is never silent
pushed=0
for i in 1 2 3 4; do if git push -q origin HEAD:main; then pushed=1; break; fi; sleep $((2**i)); done
if [ "$pushed" != 1 ]; then
  echo ""; echo "✗✗✗ PUSH TO GITHUB FAILED – the site is on $new but GitHub is not. Fix and run: git push origin HEAD:main ✗✗✗"; exit 2
fi
git fetch -q origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && echo "pushed to GitHub (origin/main = $(git rev-parse --short HEAD))" || { echo "✗ GitHub main differs from this copy after the push"; exit 2; }
