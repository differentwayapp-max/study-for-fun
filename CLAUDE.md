# Study for fun – notes for working on this repo

Kids practise for school tests through games; a parent picks or builds practice sets. Hebrew-first PWA (RTL), English UI too.

## Layout
- `public/index.html` – the whole app (one file: UI, games, Firebase bridge). `public/i18n.js` – English translation (dictionary + patterns).
- `public/kid-rest.js` – kid phones' REST fallback (Lockdown mode / no IndexedDB). `public/sw.js` – service worker.
- `functions/index.js` – Cloud Functions (europe-west1): `ask` (Claude via the Anthropic SDK – one STEP per call, never a free prompt), `startBuild`/`endBuild` (3 builds/month per family, paid credits later), `adminUsers`.
  A new practice set is built ON THE SERVER, so the parent may close the phone: `submitBuild` (the form + files; the files are read there – the scan step – and never kept) → `runBuild` (a Cloud Tasks queue: `buildSet` step by step; every answer goes into `builds/{id}/log`, a task hands over after 17 min and a failed task is retried – both replay the log, nothing is asked twice) → the set is written to `families/{f}/sets/s<at>`; the phone only shows `builds/{id}.prog` (`watchBuilds`). `resumeBuild` = "▶ להמשיך" on a stopped build; `endBuild` also cancels / dismisses; `cleanBuilds` (every 6 h) deletes the form and log of builds that are over.
- `public/build-core.js` – the question pipeline shared by the app and the server (`genChapter`, `poolPick`, `picturePass`, `qaSet`, `codeChecks`, `clean`, `buildSet`…): plain script in the app, `require`d by functions (copied to `functions/build-core.js` by the functions predeploy in firebase.json – never edit that copy). No DOM in it. No monthly AI cap for now, $100 a day for the whole app (80% of it → a server-log alert), at most $8 a month per family; each call reserves its most possible cost first and settles after (`reserve`/`settle`); cost per step on `builds/{id}` and `meta/ai_spend_<month>`. 2 refunds of failed builds per family a month. Admin emails in `functions/.env`.
- `functions/prompts.js` – every AI prompt, built on the server from structured data: the steps (scan, gen, pics, solve, review, fix, report, match, select) with model, effort, max_tokens, input size limits and the JSON schema of the answer; the rules (`BUILD_RULES`, `PIC_RULE`, `COPY_RULE`) in one cached system prompt. In the emulator a test can ask for a fake AI (`window.SFF_FAKE_AI`, `data.fake`).
- `firestore.rules` – who reads/writes what (owner, admin, helper, tutor, kid device, app admins). A tutor reaches only the kids in `members/{uid}.kids` (their sets – asked kid by kid – and progress) and its `tutorView/{inviteCode}` (written by the parent's app: with the invitation, and kept up to date); never the family document, kid links, devices, invitations or other adults. Test: `e2e_tutor.js` + section 9–10 of `e2e_security.js`.
- `tools/sets/*.py` + `tools/build_set.py` – hand-built catalog practice sets → `public/share/`. `tools/pic_rules.py` – the picture never gives the answer away (a naming question shows the thing to name; any other question shows all the options or its data, never the right option alone); no emoji newer than 2019. `SFF_DRY=1 python3 -I tools/build_set.py <file>` checks a set without writing.
- First-run intro (`INTRO` in index.html, drawn in HTML from the store-screens design): a new parent sees screens 1,3,4,5,7,8 (seen → `users/{uid}.intro`), a kid phone 2 and 6 (localStorage; no storage → none); ☰ → איך זה עובד. The same screens make the Google Play pictures: `node tools/store_shots.js` (app served) → `store/play/` + `store/play/en/` (`/?intro=<1-8|feature>&shot=1`). Test: `e2e_intro.js`.
- `android/` – Trusted Web Activity for Google Play (signing key is NOT in the repo). `store/` – store listing text and images.

## Run the tests
Serve the app, then run a test inside the emulators:
```
python3 -m http.server 8765 --directory public &
firebase emulators:exec --only firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_family.js"
```
Tests that call Cloud Functions need `--only functions,firestore,auth` (e2e_quota, e2e_users, e2e_security, e2e_build – a whole server build with the fake AI: retried step, "▶ continue", the phone closed mid-build; the Cloud Tasks emulator starts with functions). Run each such test in its own emulator session (accounts add up).
Kid links are per kid (`kidTokens.<kid>` in the family doc, made by `__sffFamily.kidLink(kid)`); a kid device writes only its own kid's progress. Local-only tests: `node tools/tests/local_*.js`.
Full screen walk (Hebrew + English, phone width): `OUT=/tmp/qa node tools/tests/qa_screens.js` inside the emulators (with functions).
Test hooks: `window.SFF_REST_EMU` (emulator addresses) and `window.SFF_TEST_GOOGLE` (fake Google account) – set them with `addInitScript`.

## Deploy
`tools/deploy.sh "message"` – bumps the version everywhere (sff-vN), commits, deploys hosting, pushes to GitHub.
Functions: `firebase deploy --only functions` (its predeploy copies public/build-core.js). Rules: `firebase deploy --only firestore:rules`. A change to `public/build-core.js` needs BOTH a hosting deploy and a functions deploy.
Catalog set: `python3 -I tools/build_set.py tools/sets/<file>.py` (one emoji per picture item – use `COUNT(("🍎",3))` for counting pictures), then `IDS=<id> node tools/tests/local_scenes.js` with the app served (renders every picture: 0 bad scenes), then deploy (existing copies update automatically, progress kept).

**Practice sets – the skills are mandatory:** before building, extending or rewriting any practice set (a catalog set in `tools/sets/` or a set for a family), invoke the `build-practice-set` skill and follow it; when the set is done, invoke `review-practice-set` and review it before reporting or asking to deploy. The same rules run inside the app's AI building (`BUILD_RULES`, `PIC_RULE`, `COPY_RULE` in the system prompt of `functions/prompts.js`, the reviewer step `review` and the code checks in `qaSet`/`codeChecks` in index.html) – keep them in step with the skills.
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
- Teacher area (plan: `docs/teacher-area-plan.md`):
  - Legal review before the consent stage goes live: the consent letter text (`letterV`), the privacy policy and terms for
    classes, and who owns the database when a class teacher works on behalf of a school.
  - Email sign-in for teachers (and parents without Google): Firebase Console → Authentication → Sign-in method →
    Add new provider → Email/Password → turn on "Email link (passwordless sign-in)" → Save; then Authentication →
    Settings → Authorized domains: check that study-for-fun-7b03c.web.app (and any custom domain) is listed.
    Then set `EMAIL_LINK=true` in index.html and deploy.
