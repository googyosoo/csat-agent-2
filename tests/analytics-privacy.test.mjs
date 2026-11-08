import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');
const alice = { uid: 'alice-uid', email: 'learner@one.example', emailVerified: true, displayName: 'Alice' };
const bob = { uid: 'bob-uid', email: 'learner@two.example', emailVerified: true, displayName: 'Bob' };
function fixture(user = alice, deferred = false) {
  const auth = { currentUser: user }, listeners = [], requests = [], writes = [], reads = [], pending = [], events = [];
  let responseStatus = 200;
  const storage = {
    csat_analytics_students_v1: JSON.stringify([{ id: 'a', email: alice.email, name: 'Alice', socraticLogs: [{ id: 'sa', studentEmail: alice.email }, { id: 'sb', studentEmail: bob.email }] }, { id: 'b', email: bob.email, name: 'Bob' }]),
    csat_analytics_socratic_v1: JSON.stringify([{ id: 'sa', studentEmail: alice.email, studentQuestionSnippet: 'My own reflection', passageTitle: 'A' }, { id: 'sb', studentEmail: bob.email, studentQuestionSnippet: 'Other reflection', passageTitle: 'B' }]),
    csat_analytics_learning_events_v1: JSON.stringify([{ id: 'ea', studentEmail: alice.email, reasonText: 'Own reason' }, { id: 'eb', studentEmail: bob.email, reasonText: 'Other reason' }]),
  };
  Object.defineProperties(storage, {
    getItem: { value: (key) => storage[key] ?? null },
    setItem: { value: (key, value) => { storage[key] = value; } },
    removeItem: { value: (key) => { delete storage[key]; } },
    key: { value: (index) => Object.keys(storage)[index] ?? null },
    length: { get: () => Object.keys(storage).length },
  });
  const snapshot = { empty: true, forEach() {} };
  const firestore = {
    collection: (_db, name) => ({ name }), doc: (_db, name, id) => ({ name, id }),
    where: (field, operator, value) => ({ field, operator, value }),
    query: (ref, condition) => ({ ...ref, condition }),
    getDocs: (ref) => { reads.push(ref); return deferred ? new Promise(resolve => pending.push(resolve)) : Promise.resolve(snapshot); },
    setDoc: async (ref, row) => { writes.push({ ref, row }); },
  };
  const exports = {};
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, {
    require: (id) => {
      if (id === './firebase') return { auth, db: {}, subscribeToAuth: (callback) => { listeners.push(callback); return () => {}; } };
      if (id === './adminAuth') return { isAdminUser: (email) => ['sitech3@simin.hs.kr', 'hongjinwoo@simin.hs.kr'].includes(email) };
      if (id === './api') return { authenticatedFetch: async (url, options) => { requests.push({ url, options }); return { ok: responseStatus >= 200 && responseStatus < 300, status: responseStatus, json: async () => ({ success: true, students: [], socraticLogs: [], learningEvents: [] }) }; } };
      if (id === 'firebase/firestore') return firestore;
      throw new Error('Unexpected dependency: ' + id);
    }, exports, localStorage: storage, window: { localStorage: storage, dispatchEvent(event) { events.push({ type: event.type, detail: event.detail }); } },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } }, console, setTimeout, clearTimeout,
  });
  return { exports, storage, requests, writes, reads, events, setStatus(value) { responseStatus = value; }, setUser(next) { auth.currentUser = next; listeners.forEach(fn => fn(next)); }, resolveReads() { pending.splice(0).forEach(resolve => resolve(snapshot)); } };
}

test('Student browser records use exact email ownership including nested logs', () => {
  const f = fixture();
  const students = f.exports.getStoredStudentActivities();
  assert.equal(students.length, 1);
  assert.equal(students[0].email, alice.email);
  assert.ok(students[0].socraticLogs.every(row => row.studentEmail === alice.email));
  assert.ok(f.exports.getStoredSocraticSummaries().every(row => row.studentEmail === alice.email));
  assert.ok(f.exports.getStoredLearningEvents().every(row => row.studentEmail === alice.email));
});

test('Guests cannot read or replay previous users records', async () => {
  const f = fixture(null);
  assert.equal(f.exports.getStoredStudentActivities().length, 0);
  assert.equal(f.exports.getStoredSocraticSummaries().length, 0);
  assert.equal(f.exports.getStoredLearningEvents().length, 0);
  await f.exports.autoSyncAllLocalDataToCloud();
  await f.exports.fetchFirestoreStudentActivities();
  assert.equal(f.requests.length, 0);
  assert.equal(f.writes.length, 0);
  assert.equal(f.reads.length, 0);
});

test('Cloud replay sends only the currently signed-in users records', async () => {
  const f = fixture();
  await f.exports.autoSyncAllLocalDataToCloud();
  assert.ok(f.requests.length > 0);
  assert.ok(!JSON.stringify(f.requests).includes(bob.email));
  assert.ok(!JSON.stringify(f.writes).includes(bob.email));
});

test('Student Firestore requests include ownership constraints', async () => {
  const f = fixture();
  await f.exports.fetchFirestoreStudentActivities();
  await f.exports.fetchFirestoreSocraticSummaries();
  assert.equal(f.reads.length, 2);
  assert.ok(f.reads.every(ref => ref.condition?.operator === '==' && ref.condition.value === alice.email));
});

test('Only a verified admin may use collection-wide queries', async () => {
  const f = fixture({ uid: 'teacher', email: 'hongjinwoo@simin.hs.kr', emailVerified: true });
  await f.exports.fetchFirestoreStudentActivities();
  assert.equal(f.reads.length, 1);
  assert.equal(f.reads[0].condition, undefined);
  const unverified = fixture({ uid: 'teacher', email: 'hongjinwoo@simin.hs.kr', emailVerified: false });
  await unverified.exports.fetchFirestoreStudentActivities();
  assert.equal(unverified.reads.length, 0);
});

test('Late reads from the previous account cannot populate the new account', async () => {
  const f = fixture(alice, true);
  const loading = f.exports.fetchServerAnalyticsData();
  f.setUser(bob);
  f.resolveReads();
  const result = await loading;
  assert.equal(result.students.length, 0);
  assert.equal(result.socraticLogs.length, 0);
  assert.equal(result.learningEvents.length, 0);
  assert.ok(f.exports.getStoredStudentActivities().every(row => row.email === bob.email));
});

test('Large own history is replayed in bounded requests without losing records', async () => {
  const f = fixture();
  const history = Array.from({ length: 551 }, (_, i) => ({ id: 'large-' + i, studentEmail: alice.email, passageTitle: 'Practice', studentQuestionSnippet: 'x'.repeat(12000) }));
  f.storage.setItem('csat_analytics_socratic_v1', JSON.stringify(history));
  await f.exports.autoSyncAllLocalDataToCloud();
  const bodies = f.requests.filter(item => item.options?.method === 'POST').map(item => JSON.parse(item.options.body));
  assert.ok(bodies.length > 1);
  assert.ok(bodies.every(body => (body.students?.length || 0) + (body.socraticLogs?.length || 0) + (body.learningEvents?.length || 0) <= 40));
  assert.ok(bodies.every(body => JSON.stringify(body).length <= 200000));
  const sent = new Set(bodies.flatMap(body => body.socraticLogs || []).map(row => row.id));
  assert.ok(history.every(row => sent.has(row.id)));
  assert.equal(JSON.parse(f.storage.getItem('csat_analytics_socratic_v1')).length, 551);
});

test('Rejected sync shows a warning and preserves browser originals', async () => {
  const f = fixture();
  const before = f.storage.getItem('csat_analytics_socratic_v1');
  f.setStatus(403);
  await f.exports.autoSyncAllLocalDataToCloud();
  assert.ok(f.events.some(event => event.type === 'csat_analytics_sync_error' && typeof event.detail === 'string'));
  assert.ok(!JSON.stringify(f.events).includes(alice.email));
  assert.equal(f.storage.getItem('csat_analytics_socratic_v1'), before);
});
