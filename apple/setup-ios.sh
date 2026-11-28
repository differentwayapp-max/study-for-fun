#!/usr/bin/env bash
# Prepares the iPhone project before a build (CI runs it; locally on a Mac too).
#  - installs the plugins and syncs the Capacitor config into ios/
#  - GoogleService-Info.plist (Firebase console → Project settings → the iOS app app.dway.studyforfun): copied into the app,
#    and its REVERSED_CLIENT_ID becomes the URL scheme Google sign-in returns to
set -euo pipefail
cd "$(dirname "$0")"
npm ci --no-audit --no-fund
npx cap sync ios
PL=GoogleService-Info.plist
if [ -f "$PL" ]; then
  cp "$PL" ios/App/App/$PL
  REV=$(/usr/libexec/PlistBuddy -c 'Print :REVERSED_CLIENT_ID' "$PL" 2>/dev/null || python3 -c "import plistlib;print(plistlib.load(open('$PL','rb'))['REVERSED_CLIENT_ID'])")
  sed -i.bak "s|<string>REVERSED_CLIENT_ID</string>|<string>$REV</string>|" ios/App/App/Info.plist && rm -f ios/App/App/Info.plist.bak
  echo "Google sign-in URL scheme: $REV"
else
  echo "⚠️  no $PL yet – the app builds, but sign-in (Firebase) is not set up"
fi
