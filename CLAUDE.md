# Study for fun – notes for working on this repo

Kids practise for school tests through games; a parent picks or builds practice sets. Hebrew-first PWA (RTL), English UI too.

## Layout
- `public/index.html` – the whole app (one file: UI, games, Firebase bridge). `public/i18n.js` – English translation (dictionary + patterns).
- `public/kid-rest.js` – kid phones' REST fallback (Lockdown mode / no IndexedDB). `public/sw.js` – service worker.
- `functions/index.js` – Cloud Functions (europe-west1): `ask` (Claude via the Anthropic SDK), `startBuild`/`endBuild` (3 builds/month per family, paid credits later), `adminUsers`. Monthly AI cap $40, at most $8 of it per family; 2 refunds of failed builds per family a month. Admin emails in `functions/.env`.
- `firestore.rules` – who reads/writes what (owner, admin, helper, tutor, kid device, app admins).
- `tools/sets/*.py` + `tools/build_set.py` – hand-built catalog practice sets → `public/share/`. `tools/pic_rules.py` – the picture must show the answer itself; no emoji newer than 2019.
- `android/` – Trusted Web Activity for Google Play (signing key is NOT in the repo). `store/` – store listing text and images.

## Run the tests
Serve the app, then run a test inside the emulators:
```
python3 -m http.server 8765 --directory public &
firebase emulators:exec --only firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_family.js"
```
Tests that call Cloud Functions need `--only functions,firestore,auth` (e2e_quota, e2e_users, e2e_security).
Kid links are per kid (`kidTokens.<kid>` in the family doc, made by `__sffFamily.kidLink(kid)`); a kid device writes only its own kid's progress. Local-only tests: `node tools/tests/local_*.js`.
Full screen walk (Hebrew + English, phone width): `OUT=/tmp/qa node tools/tests/qa_screens.js` inside the emulators (with functions).
Test hooks: `window.SFF_REST_EMU` (emulator addresses) and `window.SFF_TEST_GOOGLE` (fake Google account) – set them with `addInitScript`.

## Deploy
`tools/deploy.sh "message"` – bumps the version everywhere (sff-vN), commits, deploys hosting, pushes to GitHub.
Functions: `firebase deploy --only functions`. Rules: `firebase deploy --only firestore:rules`.
Catalog set: `python3 -I tools/build_set.py tools/sets/<file>.py`, then deploy (existing copies update automatically, progress kept).
