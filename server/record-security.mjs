// Standalone preparation unit. Google lookup, not JWT decoding, verifies tokens.
const DEFAULT_ADMINS = ['sitech3@simin.hs.kr', 'hongjinwoo@simin.hs.kr'];
const MUTATIONS = new Set(['POST', 'DELETE', 'PUT', 'PATCH']);
const RECORD_ARRAYS = new Set(['socraticLogs', 'learningEvents', 'logs', 'events']);
const RECORD_SINGLES = new Set(['student', 'log', 'event', 'socraticLog', 'learningEvent']);
const OWN_METRICS = new Set(['loginCount', 'totalDwellTimeMinutes', 'completedPassagesCount',
  'transformedQuestionsGenerated', 'quizAccuracyPercentage', 'socraticQuestionsCount']);
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const AUTHORITY = /^(role|roles|uid|admin|isAdmin|permissions|customClaims)$/i;
const AGGREGATE = /count|total|stats|summary|aggregate|class|average|distribution/i;
const MAX_ARRAY = 500;
const MAX_TEXT = 16000;

class Rejection extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const reject = (status, code) => { throw new Rejection(status, code); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonicalEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validEmail = value => typeof value === 'string' && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const owns = (value, principal) => validEmail(value) && canonicalEmail(value) === principal.email;

function decodeClaims(idToken, projectId, now) {
  if (idToken.length > 16384) reject(401, 'invalid_token');
  const parts = idToken.split('.');
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) reject(401, 'invalid_token');
  let header, claims;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { reject(401, 'invalid_token'); }
  if (!object(header) || header.alg !== 'RS256' || !object(claims) ||
      claims.aud !== projectId || claims.iss !== 'https://securetoken.google.com/' + projectId ||
      typeof claims.sub !== 'string' || !claims.sub.trim() || claims.sub.length > 128 ||
      !validEmail(claims.email) || !Number.isFinite(claims.exp) || claims.exp <= now ||
      !Number.isFinite(claims.iat) || claims.iat < 0 || claims.iat > now ||
      !Number.isFinite(claims.auth_time) || claims.auth_time < 0 || claims.auth_time > now ||
      claims.iat >= claims.exp || claims.auth_time > claims.iat) reject(401, 'invalid_token');
  return claims;
}

async function lookupIdentity(idToken, claims, config) {
  const controller = new AbortController();
  let timer;
  try {
    const timeout = new Promise((_, fail) => {
      timer = setTimeout(() => { controller.abort(); fail(new Rejection(503, 'verification_unavailable')); }, config.timeoutMs);
    });
    const data = await Promise.race([timeout, (async () => {
      const response = await config.fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(config.apiKey),
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
          signal: controller.signal, redirect: 'error' });
      if (!response.ok) {
        if ([400, 401, 403].includes(response.status)) reject(401, 'invalid_token');
        reject(503, 'verification_unavailable');
      }
      return await response.json();
    })()]);
    if (!object(data) || !Array.isArray(data.users)) reject(503, 'verification_unavailable');
    if (data.users.length !== 1 || !object(data.users[0])) reject(401, 'invalid_token');
    const user = data.users[0];
    // Exact signed identity comparison precedes canonicalization used for ownership.
    if (user.localId !== claims.sub || user.email !== claims.email) reject(401, 'identity_mismatch');
    if (user.emailVerified !== true || (user.disabled !== undefined && user.disabled !== false)) reject(403, 'account_not_allowed');
    if (user.validSince !== undefined) {
      if (!/^[0-9]+$/.test(String(user.validSince)) || !Number.isSafeInteger(Number(user.validSince))) reject(503, 'verification_unavailable');
      if (claims.auth_time < Number(user.validSince)) reject(403, 'account_not_allowed');
    }
    const email = canonicalEmail(user.email);
    return Object.freeze({ uid: user.localId, email,
      name: typeof user.displayName === 'string' ? user.displayName.slice(0, 256) : email,
      isAdmin: config.adminEmails.has(email) });
  } catch (error) {
    if (error instanceof Rejection) throw error;
    reject(503, 'verification_unavailable');
  } finally { clearTimeout(timer); }
}

// Copy only bounded JSON; never assign untrusted prototype-affecting keys.
function boundedCopy(input) {
  const budget = { nodes: 0, text: 0 };
  function copy(value, depth) {
    if (++budget.nodes > 10000 || depth > 12) reject(400, 'invalid_sync_body');
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      budget.text += value.length;
      if (value.length > MAX_TEXT || budget.text > 262144) reject(400, 'invalid_sync_body');
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length > MAX_ARRAY) reject(400, 'invalid_sync_body');
      return value.map(item => copy(item, depth + 1));
    }
    if (!object(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) reject(400, 'invalid_sync_body');
    const entries = Object.entries(value);
    if (entries.length > 100) reject(400, 'invalid_sync_body');
    const result = {};
    for (const [key, child] of entries) {
      if (DANGEROUS.has(key) || key.length > 128) reject(400, 'invalid_sync_body');
      // Validate even stripped fields so malicious structures cannot hide here.
      const clean = copy(child, depth + 1);
      if (!AUTHORITY.test(key)) result[key] = clean;
    }
    return result;
  }
  return copy(input, 0);
}

function prepareSync(input, principal) {
  if (!object(input)) reject(400, 'invalid_sync_body');
  const clean = boundedCopy(input);
  function checkRecord(record, kind) {
    if (!object(record)) reject(400, 'invalid_sync_body');
    const key = kind === 'student' ? 'email' : 'studentEmail';
    if (!validEmail(record[key])) reject(400, 'invalid_sync_body');
    if (!principal.isAdmin && !owns(record[key], principal)) reject(403, 'cross_user_sync');
    if (!principal.isAdmin) {
      record[key] = principal.email;
      if (kind === 'student') {
        record.id = principal.uid; record.name = principal.name;
        if ('displayName' in record) record.displayName = principal.name;
      } else record.studentName = principal.name;
    }
  }
  function walk(value) {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (!object(value)) return;
    for (const [key, child] of Object.entries(value)) {
      if (key === 'students' || RECORD_ARRAYS.has(key)) {
        if (!Array.isArray(child)) reject(400, 'invalid_sync_body');
        child.forEach(record => checkRecord(record, key === 'students' ? 'student' : 'activity'));
      } else if (RECORD_SINGLES.has(key)) {
        checkRecord(child, key === 'student' ? 'student' : 'activity');
      }
      walk(child);
    }
    // Also catch embedded activity records outside the conventional array names.
    if ('studentEmail' in value) {
      if (!validEmail(value.studentEmail)) reject(400, 'invalid_sync_body');
      if (!principal.isAdmin && !owns(value.studentEmail, principal)) reject(403, 'cross_user_sync');
      if (!principal.isAdmin) { value.studentEmail = principal.email; value.studentName = principal.name; }
    }
  }
  walk(clean);
  return clean;
}

function scopePayload(payload, principal) {
  function scope(value) {
    if (Array.isArray(value)) return value.filter(item => !object(item) ||
      (!('studentEmail' in item) || owns(item.studentEmail, principal)) &&
      (!('email' in item) || owns(item.email, principal))).map(scope);
    if (!object(value)) return value;
    // Ownership never propagates to arbitrary nested objects. Only a record with
    // its own verified identity may retain the explicitly known personal metrics.
    const identityKeys = ['email', 'studentEmail'].filter(key => key in value);
    const ownedRecord = identityKeys.length > 0 && identityKeys.every(key => owns(value[key], principal));
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      if (DANGEROUS.has(key) || AUTHORITY.test(key)) continue;
      if ((AGGREGATE.test(key) || OWN_METRICS.has(key)) &&
          !(ownedRecord && OWN_METRICS.has(key) && typeof child === 'number' && Number.isFinite(child))) continue;
      if (key === 'students' || RECORD_ARRAYS.has(key)) {
        if (!Array.isArray(child)) continue;
        const identity = key === 'students' ? 'email' : 'studentEmail';
        result[key] = child.filter(item => object(item) && owns(item[identity], principal)).map(scope);
      } else if (RECORD_SINGLES.has(key)) {
        const identity = key === 'student' ? 'email' : 'studentEmail';
        if (object(child) && owns(child[identity], principal)) result[key] = scope(child);
      } else {
        if (object(child) && (('studentEmail' in child && !owns(child.studentEmail, principal)) ||
          ('email' in child && !owns(child.email, principal)))) continue;
        result[key] = scope(child);
      }
    }
    if (Array.isArray(result.students)) result.count = result.students.length;
    if (Array.isArray(result.socraticLogs)) result.socraticCount = result.socraticLogs.length;
    else if (Array.isArray(result.students) && result.students.some(s => Array.isArray(s.socraticLogs))) {
      result.socraticCount = result.students.reduce((sum, s) => sum + (s.socraticLogs?.length || 0), 0);
    }
    return result;
  }
  return scope(payload);
}

export function createRecordSecurity(options = {}) {
  const defaults = { fetch: options.fetch ?? globalThis.fetch,
    timeoutMs: Math.min(8000, Math.max(1, options.timeoutMs ?? 8000)),
    adminEmails: new Set((options.adminEmails ?? DEFAULT_ADMINS).map(canonicalEmail)) };
  const clock = options.clock ?? Date.now; // milliseconds since epoch
  return async function recordSecurityMiddleware(req, res, next) {
    const method = String(req.method || '').toUpperCase();
    if (method === 'OPTIONS') return next();
    let pathname = String(req.originalUrl || '').split('?')[0];
    try { pathname = decodeURIComponent(pathname); }
    catch { return res.status(400).json({ error: 'invalid_path' }); }
    pathname = pathname.split(String.fromCharCode(92)).join('/').replace(/\/+/g, '/');
    const segments = [];
    for (const part of pathname.split('/')) {
      if (part === '..') segments.pop(); else if (part && part !== '.') segments.push(part);
    }
    pathname = ('/' + segments.join('/')).toLowerCase();
    const under = base => pathname === base || pathname.startsWith(base + '/');
    const analytics = under('/api/analytics');
    const adminOnly = under('/api/gemini/student-report') || (under('/api/transformed-questions') && MUTATIONS.has(method));
    if (!analytics && !adminOnly) return next();
    try {
      // Resolve env after dotenv initialization, even for the exported singleton.
      const projectId = options.projectId ?? (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID);
      const apiKey = options.apiKey ?? (process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY);
      const config = { ...defaults, projectId, apiKey };
      if (typeof projectId !== 'string' || !projectId.trim() || typeof apiKey !== 'string' || !apiKey.trim() || typeof config.fetch !== 'function') reject(503, 'verification_not_configured');
      const authorization = req.headers?.authorization;
      if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9_.-]+$/.test(authorization)) reject(401, 'invalid_token');
      const idToken = authorization.slice(7);
      const now = clock() / 1000;
      if (!Number.isFinite(now)) reject(503, 'verification_unavailable');
      const claims = decodeClaims(idToken, projectId, now);
      const principal = await lookupIdentity(idToken, claims, config);
      if (adminOnly && !principal.isAdmin) reject(403, 'admin_required');
      if (under('/api/analytics/sync')) req.body = prepareSync(req.body, principal);
      req.verifiedUser = principal;
      if (analytics && !principal.isAdmin) {
        const originalJson = res.json;
        res.json = function scopedJson(payload) { return originalJson.call(this, scopePayload(payload, principal)); };
      }
    } catch (error) {
      const safe = error instanceof Rejection ? error : new Rejection(503, 'verification_unavailable');
      return res.status(safe.status).json({ error: safe.code });
    }
    // Do not turn downstream handler errors into authentication errors.
    return next();
  };
}

export const recordSecurity = createRecordSecurity();
