import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8');
function fixture(user = null) {
  const auth = { currentUser: user };
  const calls = [];
  const exports = {};
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, {
    require: (id) => { if (id === './firebase') return { auth }; throw new Error('Unexpected dependency'); },
    exports, Headers, URL, console,
    window: { location: { origin: 'https://school.example' } },
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true }; },
  });
  return { auth, calls, request: exports.authenticatedFetch };
}
const signedIn = () => ({ uid: 'student-1', getIdToken: async () => 'test-id-token' });

test('Guests cannot request records or teacher mutations', async () => {
  const f = fixture();
  for (const [url, method] of [['/api/analytics/data', 'GET'], ['/API/ANALYTICS/SYNC', 'POST'], ['/api/gemini/student-report', 'POST'], ['/api/transformed-questions/1', 'DELETE']]) {
    await assert.rejects(f.request(url, { method }), /로그인/);
  }
  assert.equal(f.calls.length, 0);
});

test('A signed-in request sends a fresh Firebase token and preserves other headers', async () => {
  const f = fixture(signedIn());
  await f.request('/api/analytics/data', { headers: { 'X-Client': 'test' } });
  assert.equal(f.calls[0].options.headers.get('authorization'), 'Bearer test-id-token');
  assert.equal(f.calls[0].options.headers.get('x-client'), 'test');
});

test('Firebase tokens are never attached to third-party URLs', async () => {
  let tokenCalls = 0;
  const f = fixture({ uid: 'student-1', getIdToken: async () => { tokenCalls++; return 'test-id-token'; } });
  for (const url of ['https://other.example/api/analytics/data', '//other.example/api/analytics/data']) await f.request(url);
  assert.equal(tokenCalls, 0);
  assert.ok(f.calls.every(call => !call.options.headers));
});

test('Account changes while token refresh is pending prevent the request', async () => {
  const f = fixture();
  f.auth.currentUser = { uid: 'old-user', getIdToken: async () => { f.auth.currentUser = { uid: 'new-user' }; return 'test-id-token'; } };
  await assert.rejects(f.request('/api/analytics/data'), /계정이 변경/);
  assert.equal(f.calls.length, 0);
});

test('Public question reading remains available to guests', async () => {
  const f = fixture();
  await f.request('/api/transformed-questions?passageId=1');
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].options.headers, undefined);
});

test('Both server entry points mount record security before data handlers', () => {
  for (const name of ['server.ts', 'api/index.js']) {
    const code = readFileSync(new URL('../' + name, import.meta.url), 'utf8');
    const guard = code.indexOf('app.use(createRecordSecurity())');
    const handler = code.search(/app\.(?:get|post)\(['"]\/api\/analytics/);
    assert.ok(guard >= 0 && handler > guard, name + ': guard must precede record handlers');
  }
});

test('Firebase config references the restricted record rules', () => {
  const config = JSON.parse(readFileSync(new URL('../firebase.json', import.meta.url), 'utf8'));
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert.equal(config.firestore.rules, 'firestore.rules');
  assert.ok(rules.includes('email_verified == true'));
  assert.ok(rules.includes("ownUpdate('studentEmail')"));
  assert.ok(rules.includes('allow read, write: if false'));
});
