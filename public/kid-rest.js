/* Study for fun – backup connection for a kid's phone.
   Some phones can't run the Firebase library (e.g. iPhone "Lockdown Mode" blocks parts of the browser).
   This talks to the same Firebase services with plain fetch() – the same security rules apply:
   anonymous sign-in → join the family once with the link's token → read the family's practice sets,
   read/write only progress. Live updates are replaced by a short refresh every 45 seconds. */
(function () {
  const W = window, LS = W.localStorage;
  W.__sffKR = 'loaded';

  // Firestore value <-> plain JS
  const dec = v => {
    if (!v || typeof v !== 'object') return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return Number(v.doubleValue);
    if ('booleanValue' in v) return v.booleanValue;
    if ('nullValue' in v) return null;
    if ('timestampValue' in v) return v.timestampValue;
    if ('mapValue' in v) return decF(v.mapValue.fields || {});
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    return null;
  };
  const decF = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, dec(v)]));
  const enc = x => x === null || x === undefined ? { nullValue: null }
    : typeof x === 'string' ? { stringValue: x }
    : typeof x === 'boolean' ? { booleanValue: x }
    : typeof x === 'number' ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x })
    : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } }
    : { mapValue: { fields: encF(x) } };
  const encF = o => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));

  W.SFF_KID_REST = async function (cfg, famId, token) {
    const EMU = W.SFF_REST_EMU;   // tests only: local Firebase emulators
    const KEY = cfg.apiKey, ROOT = `${EMU ? EMU.fs : 'https://firestore.googleapis.com'}/v1/projects/${cfg.projectId}/databases/(default)/documents`;
    const AUTH = EMU ? `${EMU.auth}/identitytoolkit.googleapis.com` : 'https://identitytoolkit.googleapis.com';
    const STS = EMU ? `${EMU.auth}/securetoken.googleapis.com` : 'https://securetoken.googleapis.com';
    let idToken = null, exp = 0, uid = null;

    async function signIn() {
      const rt = LS.getItem('sff_rest_rt');
      if (rt) {
        const r = await fetch(`${STS}/v1/token?key=${KEY}`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(rt) });
        if (r.ok) { const j = await r.json(); idToken = j.id_token; uid = j.user_id; exp = Date.now() + (+j.expires_in - 120) * 1000; LS.setItem('sff_rest_rt', j.refresh_token); return; }
      }
      const r = await fetch(`${AUTH}/v1/accounts:signUp?key=${KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
      if (!r.ok) throw new Error('sign-in ' + r.status);
      const j = await r.json(); idToken = j.idToken; uid = j.localId; exp = Date.now() + (+j.expiresIn - 120) * 1000; LS.setItem('sff_rest_rt', j.refreshToken);
    }
    async function call(method, path, body, query) {
      if (!idToken || Date.now() > exp) await signIn();
      const r = await fetch(`${ROOT}/${path}${query ? '?' + query : ''}`, {
        method, headers: { Authorization: 'Bearer ' + idToken, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
      if (r.status === 404) return null;
      if (!r.ok) { const e = new Error(`${method} ${path.split('/').slice(2).join('/')} ${r.status}`); e.code = r.status === 403 ? 'permission-denied' : 'unavailable'; throw e; }
      return r.status === 204 ? {} : r.json();
    }

    // join the family once (same rule as the app: the device writes only {token, at})
    W.__sffStage = 'rest-signin'; await signIn();
    W.__sffStage = 'rest-join';
    const dev = `families/${famId}/devices/${uid}`;
    const have = await call('GET', dev).catch(() => null);
    const kid = LS.getItem('sff_lock');   // the link's token belongs to this kid – the phone joins as this kid's device
    const join = kid ? { token, kid, at: Date.now() } : { token, at: Date.now() };
    const haveKid = have && have.fields && have.fields.kid ? dec(have.fields.kid) : null;
    if (!have) await call('PATCH', dev, { fields: encF(join) }, 'currentDocument.exists=false')
      .catch(e => { W.__sffJoinErr = String(e.code || e.message); });
    else if (kid && haveKid && haveKid !== kid) await call('PATCH', dev, { fields: encF(join) })
      .catch(e => { W.__sffJoinErr = String(e.code || e.message); });

    const P = `families/${famId}/`;
    const wrapDoc = (id, data) => ({ id, exists: data != null, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } });
    const polls = new Set();
    const poll = (fn) => { polls.add(fn); fn(); };
    setInterval(() => polls.forEach(f => f()), 45000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) polls.forEach(f => f()); });

    function docRef(path) {
      const id = path.split('/').pop();
      const get = async () => { const j = await call('GET', P + path); return wrapDoc(id, j ? decF(j.fields) : null); };
      return { id, path, get,
        set: d => call('PATCH', P + path, { fields: encF(JSON.parse(JSON.stringify(d))) }),
        update: d => call('PATCH', P + path, { fields: encF(JSON.parse(JSON.stringify(d))) }, Object.keys(d).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&')),
        delete: () => call('DELETE', P + path),
        onSnapshot: (next, error) => { let last = ''; poll(async () => { try { const s = await get(); const k = JSON.stringify(s.data()); if (k !== last) { last = k; next(s); } } catch (e) { error && error(e); } }); return () => {}; } };
    }
    function colRef(path) {
      const get = async () => {
        const j = await call('GET', P + path, null, 'pageSize=300');
        const docs = ((j && j.documents) || []).map(d => wrapDoc(d.name.split('/').pop(), decF(d.fields)));
        return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
      };
      // a query by one field (a student's phone in a teacher's group asks only for its own practice sets)
      const where = (f, op, v) => { const q = async () => {
          const j = await call('POST', `families/${famId}:runQuery`, { structuredQuery: { from: [{ collectionId: path }],
            where: { fieldFilter: { field: { fieldPath: f }, op: op === '==' ? 'EQUAL' : op, value: enc(v) } } } });
          const docs = (Array.isArray(j) ? j : []).filter(r => r.document).map(r => wrapDoc(r.document.name.split('/').pop(), decF(r.document.fields)));
          return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }; };
        return { get: q, onSnapshot: (next, error) => { let last = ''; poll(async () => { try { const r = await q(); const k = JSON.stringify(r.docs.map(d => [d.id, d.data()])); if (k !== last) { last = k; next(r); } } catch (e) { error && error(e); } }); return () => {}; } }; };
      return { path, doc: id => docRef(path + '/' + id), get, where,
        onSnapshot: (next, error) => { let last = ''; poll(async () => { try { const q = await get(); const k = JSON.stringify(q.docs.map(d => [d.id, d.data()])); if (k !== last) { last = k; next(q); } } catch (e) { error && error(e); } }); return () => {}; } };
    }
    const dbApi = { doc: docRef, collection: colRef };
    const userApi = { isOwner: async () => false, canEdit: async () => false, can: async () => true, id: async () => uid, me: async () => ({ id: uid }) };
    W.__sffStage = 'rest-ready';
    return { use: async n => n === 'db' ? dbApi : n === 'user' ? userApi : null };
  };

  // Watchdog (a plain script, so it runs even where the app's module script does not – e.g. iPhone Lockdown Mode):
  // on a kid's phone, if the main connection has not finished after 6 s, connect through the backup.
  // starts when the page is read (not after every font/picture: Lockdown Mode blocks some of them); sooner when Lockdown is detected
  const startWatch = () => { W.__sffKR = 'armed'; setTimeout(async () => {
    W.__sffKR = 'fired';
    if (W.__sffDone || !W.SFF_KID_DEVICE || !W.__sffResolve) { W.__sffKR = 'skip:' + (W.__sffDone ? 'done' : !W.SFF_KID_DEVICE ? 'notkid' : 'noresolve'); return; }
    const fam = LS.getItem('sff_fam'), tok = LS.getItem('sff_tok'); if (!fam || !tok || !W.SFF_FIREBASE_CONFIG) return;
    W.__sffDone = true;
    try { const api = await W.SFF_KID_REST(W.SFF_FIREBASE_CONFIG, fam, tok); W.__sffVia = 'rest:watchdog(' + (W.__sffStage || 'no-module') + ')'; W.__sffResolve(api); }
    catch (e) { W.__sffCloudErr = 'rest ' + (e && e.message || e); W.__sffResolve(null); }
  }, typeof WebAssembly === 'undefined' ? 1500 : 6000); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startWatch); else startWatch();
})();
