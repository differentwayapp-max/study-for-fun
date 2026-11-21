# Study for fun – notes for working on this repo

Kids practise for school tests through games; a parent picks or builds practice sets. Hebrew-first PWA (RTL), English UI too.

## Layout
- `public/index.html` – the whole app (one file: UI, games, Firebase bridge). `public/i18n.js` – English translation (dictionary + patterns).
- `public/kid-rest.js` – kid phones' REST fallback (Lockdown mode / no IndexedDB). `public/sw.js` – service worker.
- `functions/index.js` – Cloud Functions (europe-west1): `ask` (Claude via the Anthropic SDK), `startBuild`/`endBuild` (3 builds/month per family, paid credits later), `adminUsers`. Monthly AI cap $40, at most $8 of it per family; 2 refunds of failed builds per family a month. Admin emails in `functions/.env`.
- `firestore.rules` – who reads/writes what (owner, admin, helper, tutor, kid device, app admins).
- `tools/sets/*.py` + `tools/build_set.py` – hand-built catalog practice sets → `public/share/`. `tools/pic_rules.py` – the picture never gives the answer away (a naming question shows the thing to name; any other question shows all the options or its data, never the right option alone); no emoji newer than 2019. `SFF_DRY=1 python3 -I tools/build_set.py <file>` checks a set without writing.
- `company-site/` – the company site (d-way.app), a second Firebase Hosting site (target `company`, site id `d-way-app`); the app is target `app` (study.d-way.app). Deploy it: `firebase deploy --only hosting:company`.
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
Catalog set: `python3 -I tools/build_set.py tools/sets/<file>.py` (one emoji per picture item – use `COUNT(("🍎",3))` for counting pictures), then `IDS=<id> node tools/tests/local_scenes.js` with the app served (renders every picture: 0 bad scenes), then deploy (existing copies update automatically, progress kept).

**Practice sets – the skills are mandatory:** before building, extending or rewriting any practice set (a catalog set in `tools/sets/` or a set for a family), invoke the `build-practice-set` skill and follow it; when the set is done, invoke `review-practice-set` and review it before reporting or asking to deploy. The same rules run inside the app's AI building (`BUILD_RULES` in every prompt that writes questions, and the reviewer in `runQA`) – keep them in step with the skills.
Skills: `.claude/skills/build-practice-set` (all the rules for writing a set) and `.claude/skills/review-practice-set` (how to review and report). `node tools/match_list.js <id>` lists each chapter's match-game questions and answer cards. `tools/core_facts.json` marks each set's core facts (they come back as review questions in later stations, `reviewQs`).

User guide + terms: edit `tools/docs/{guide,terms}-{he,en}.md`, then `python3 -I tools/build_docs.py` → `public/guide.html`, `public/terms.html`.
When the terms change, update the date in terms-*.md AND `TERMS_VERSION` in index.html – every parent then approves once again
(kept in `users/{uid}.terms`). Test: `e2e_terms.js`.

## Open tasks
- Bug reports by email: reports are saved in `bugReports` (admins: ☰ → דיווחים מהמשתמשים). Emailing them is ready but OFF:
  the owner first opens a dedicated mailbox (company domain – tell us the provider: Google Workspace / Microsoft / other),
  creates an app password and saves it in Secret Manager as `GMAIL_APP_PASSWORD` (never in code/chat), sets the addresses
  in the app (☰ → ⚙️ הגדרות מנהל → `adminConfig/main`), then `ENABLE_BUG_MAIL=1` in functions/.env and deploy `mailBugReport`.
  A non-Google provider needs an SMTP host setting added to `mailBugReport`.
  The same switch also turns on `mailServerAlerts`: once an hour, anything new in the server log (errors, slow calls,
  fallbacks, AI spend past 80% of the cap) is emailed as one message. Until then app admins see a red dot on ☰ (`checkServerLog`).
