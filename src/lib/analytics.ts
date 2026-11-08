/**
 * Real-time Student Analytics & Learning Tracking Engine with Firebase Firestore & LocalStorage Persistence
 */

import { auth, db, subscribeToAuth } from './firebase';
import { isAdminUser } from './adminAuth';
import { authenticatedFetch } from './api';
import { collection, doc, setDoc, getDocs, query, where, DocumentReference, DocumentData } from 'firebase/firestore';


const normalizeEmail = (value?: string | null): string => (value || '').trim().toLowerCase();
const identityKey = () => {
  const user = auth.currentUser;
  return user ? JSON.stringify([user.uid, normalizeEmail(user.email), user.emailVerified]) : '';
};
let activeIdentityKey = identityKey();
let identityGeneration = 0;
function captureIdentity() {
  const key = identityKey();
  if (key !== activeIdentityKey) {
    activeIdentityKey = key;
    identityGeneration += 1;
    firestoreCache = emptyAnalyticsCache();
  }
  const user = auth.currentUser;
  return { key, generation: identityGeneration, uid: user?.uid || '',
    email: normalizeEmail(user?.email), verified: !!user?.emailVerified,
    admin: !!user?.emailVerified && isAdminUser(user.email) };
}
type AnalyticsIdentity = ReturnType<typeof captureIdentity>;
function isCurrentIdentity(identity: AnalyticsIdentity): boolean {
  const current = captureIdentity();
  return current.key === identity.key && current.generation === identity.generation;
}
function canReadOwner(email: string | undefined, identity = captureIdentity()): boolean {
  return identity.verified && !!identity.email && (identity.admin || normalizeEmail(email) === identity.email);
}
function filterStudents(rows: StudentActivity[], identity = captureIdentity()): StudentActivity[] {
  return rows.filter(row => row && canReadOwner(row.email, identity)).map(row => ({ ...row,
    socraticLogs: (row.socraticLogs || []).filter(log => log && canReadOwner(log.studentEmail, identity)),
    learningEvents: (row.learningEvents || []).filter(event => event && canReadOwner(event.studentEmail, identity)),
  }));
}
function emptyAnalyticsCache() {
  return { students: [] as StudentActivity[], socraticLogs: [] as SocraticSummary[], learningEvents: [] as LearningEvent[], lastFetched: 0 };
}
subscribeToAuth(() => { captureIdentity(); });
function ownerQuery(name: string, field: 'email' | 'studentEmail', identity: AnalyticsIdentity) {
  const ref = collection(db, name);
  return identity.admin ? ref : query(ref, where(field, '==', identity.email));
}
async function safeSetDoc(ref: DocumentReference<DocumentData>, row: StudentActivity | SocraticSummary | LearningEvent, options?: { merge: boolean }): Promise<void> {
  const identity = captureIdentity();
  const email = 'email' in row ? row.email : row.studentEmail;
  if (!canReadOwner(email, identity) || !isCurrentIdentity(identity)) return;
  const safe: Record<string, unknown> = { ...row };
  for (const claim of ['role', 'isAdmin', 'admin', 'emailVerified', 'uid', 'ownerUid']) delete safe[claim];
  if (normalizeEmail(email) === identity.email) safe.ownerUid = identity.uid;
  if ('email' in row) {
    safe.socraticLogs = (row.socraticLogs || []).filter(log => normalizeEmail(log.studentEmail) === normalizeEmail(email));
    safe.learningEvents = (row.learningEvents || []).filter(event => normalizeEmail(event.studentEmail) === normalizeEmail(email));
  }
  if (!isCurrentIdentity(identity)) return;
  if (options) await setDoc(ref, safe, options);
  else await setDoc(ref, safe);
}
// Retain raw records owned by other browser accounts on disk.
function persistAnalyticsRows(key: string, rows: unknown[]): void {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    const map = new Map<string, unknown>();
    for (const row of [...(Array.isArray(parsed) ? parsed : []), ...rows] as any[]) {
      if (!row || typeof row !== 'object') continue;
      const owner = normalizeEmail(row.studentEmail || row.email);
      map.set(owner + ':' + (key === STORAGE_KEY_STUDENTS ? owner : row.id || JSON.stringify(row)), row);
    }
    localStorage.setItem(key, JSON.stringify(Array.from(map.values())));
  } catch {}
}

export interface StudentActivity {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  loginCount: number;
  lastLogin: string;
  totalDwellTimeMinutes: number;
  completedPassagesCount: number;
  transformedQuestionsGenerated: number;
  quizAccuracyPercentage: number;
  socraticQuestionsCount: number;
  status: 'online' | 'offline';
  socraticLogs?: SocraticSummary[];
  learningEvents?: LearningEvent[];
}

export interface SocraticSummary {
  id: string;
  studentEmail: string;
  studentName: string;
  passageTitle: string;
  lesson: string;
  itemNo: string;
  timestamp: string;
  studentQuestionSnippet: string;
  aiHintLevel: number;
  keyTopic: string;
  metacognitiveStatus: '우수 (구문 파악 성공)' | '보통 (힌트 유도 필요)' | '집중 필요 (어휘 보강)';
}

export interface AnalyticsMetrics {
  totalStudents: number;
  totalLogins: number;
  avgDwellTimeMinutes: number;
  totalGeneratedQuestions: number;
  totalSocraticConversations: number;
}

const STORAGE_KEY_STUDENTS = 'csat_analytics_students_v1';
const STORAGE_KEY_SOCRATIC = 'csat_analytics_socratic_v1';
const STORAGE_KEY_LEARNING_EVENTS = 'csat_analytics_learning_events_v1';

/**
 * Deterministic Korean Date Parser that parses:
 * - "2026. 09. 14. 오후 06:35:12" / "2026. 9. 14. 오전 8:30"
 * - ISO string: "2026-09-14T09:35:12.000Z"
 * - Numeric timestamp or ID fallback
 */
export function parseToTimestamp(str: string | number | undefined): number {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const direct = Date.parse(str);
  if (!isNaN(direct)) return direct;

  const match = str.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(오전|오후)?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const isPm = match[4] === '오후';
    let hour = parseInt(match[5], 10);
    const min = parseInt(match[6], 10);
    const sec = match[7] ? parseInt(match[7], 10) : 0;
    if (isPm && hour < 12) hour += 12;
    if (!isPm && match[4] === '오전' && hour === 12) hour = 0;
    return new Date(year, month, day, hour, min, sec).getTime();
  }

  const idMatch = str.match(/(?:soc|evt)-(\d{12,14})/);
  if (idMatch) {
    return parseInt(idMatch[1], 10);
  }

  return 0;
}

export function formatRelativeTime(ts: number): string {
  if (!ts) return '최근';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 10) return '방금 전';
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return new Date(ts).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Global Custom Event Dispatcher for 0ms Instant UI Reactivity
 */
export function notifyAnalyticsUpdated() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('csat_analytics_updated'));
    } catch (e) {}
  }
}


/** Public warning contract: CustomEvent<string>, no record or account details. */
function notifyAnalyticsSyncError(message: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<string>('csat_analytics_sync_error', { detail: message }));
  }
}
async function sendAnalyticsRequest(url: string, identity: AnalyticsIdentity, options?: RequestInit): Promise<Response | null> {
  if (!isCurrentIdentity(identity)) return null;
  try {
    const response = await authenticatedFetch(url, options);
    if (!isCurrentIdentity(identity)) return null;
    if (!response.ok) {
      notifyAnalyticsSyncError('학습 기록 동기화에 실패했습니다. 브라우저의 기록은 보존되어 있습니다. 잠시 후 다시 시도해 주세요.');
    }
    return response;
  } catch {
    if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 서버에 연결하지 못했습니다. 브라우저의 기록은 보존되어 있습니다.');
    return null;
  }
}
type AnalyticsSyncData = {
  student?: StudentActivity;
  students?: StudentActivity[];
  socraticLog?: SocraticSummary;
  socraticLogs?: SocraticSummary[];
  learningEvent?: LearningEvent;
  learningEvents?: LearningEvent[];
};
type AnalyticsBatch = { students: StudentActivity[]; socraticLogs: SocraticSummary[]; learningEvents: LearningEvent[] };
function ownSyncRows(data: AnalyticsSyncData, identity: AnalyticsIdentity): AnalyticsBatch {
  const students = filterStudents([...(data.students || []), ...(data.student ? [data.student] : [])], { ...identity, admin: false });
  const own = (row: { studentEmail: string }) => row && normalizeEmail(row.studentEmail) === identity.email;
  const dedupe = <T extends { id: string; studentEmail: string }>(rows: T[]): T[] => {
    const map = new Map<string, T>();
    rows.filter(own).forEach(row => map.set(row.id || JSON.stringify(row), row));
    return Array.from(map.values());
  };
  return {
    students: students.map(({ socraticLogs: _logs, learningEvents: _events, ...metadata }) => metadata),
    socraticLogs: dedupe([...(data.socraticLogs || []), ...(data.socraticLog ? [data.socraticLog] : []), ...students.flatMap(row => row.socraticLogs || [])]),
    learningEvents: dedupe([...(data.learningEvents || []), ...(data.learningEvent ? [data.learningEvent] : []), ...students.flatMap(row => row.learningEvents || [])]),
  };
}
// Validate nested fields too: server limits apply to each string, array and node.
function syncPayloadFits(value: unknown): boolean {
  let nodes = 0;
  const visit = (item: unknown, depth: number): boolean => {
    if (++nodes > 9000 || depth > 30) return false;
    if (typeof item === 'string') return item.length <= 16000;
    if (!item || typeof item !== 'object') return true;
    if (Array.isArray(item) && item.length > 500) return false;
    return Object.values(item).every(child => visit(child, depth + 1));
  };
  try { return visit(value, 0) && JSON.stringify(value).length <= 200000; }
  catch { return false; }
}
async function sendOwnAnalyticsBatches(rows: AnalyticsBatch, identity: AnalyticsIdentity): Promise<void> {
  let batch: AnalyticsBatch = { students: [], socraticLogs: [], learningEvents: [] };
  let count = 0;
  const flush = async (): Promise<boolean> => {
    if (!count) return true;
    if (!isCurrentIdentity(identity)) return false;
    const response = await sendAnalyticsRequest('/api/analytics/sync', identity, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batch),
    });
    batch = { students: [], socraticLogs: [], learningEvents: [] };
    count = 0;
    return !!response?.ok && isCurrentIdentity(identity);
  };
  for (const key of ['students', 'socraticLogs', 'learningEvents'] as const) {
    for (const row of rows[key]) {
      if (!isCurrentIdentity(identity)) return;
      const singleton = { students: [], socraticLogs: [], learningEvents: [], [key]: [row] };
      if (!syncPayloadFits(singleton)) {
        notifyAnalyticsSyncError('일부 학습 기록이 전송 크기 제한을 초과했습니다. 원본은 브라우저에 보존되어 있으며 잘라서 전송하지 않았습니다.');
        continue;
      }
      const candidate = { ...batch, [key]: [...batch[key], row] };
      if (count >= 40 || !syncPayloadFits(candidate)) {
        if (!await flush()) return;
      }
      // Each branch keeps the collection's concrete TypeScript row type.
      if (key === 'students') batch.students.push(row as StudentActivity);
      else if (key === 'socraticLogs') batch.socraticLogs.push(row as SocraticSummary);
      else batch.learningEvents.push(row as LearningEvent);
      count += 1;
    }
  }
  await flush();
}

/**
 * Async Sync activity data to backend server for cross-browser admin tracking
 */
export async function syncAnalyticsToServer(data: AnalyticsSyncData): Promise<void> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return;
  try {
    const rows = ownSyncRows(data, identity);
    await sendOwnAnalyticsBatches(rows, identity);
    if (isCurrentIdentity(identity)) notifyAnalyticsUpdated();
  } catch {
    if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 동기화 중 오류가 발생했습니다. 브라우저의 원본 기록은 보존되어 있습니다.');
  }
}

/**
 * Auto-sync only the currently verified account's own local records.
 * Administrator visibility does not grant permission to replay other accounts' browser caches.
 */
export async function autoSyncAllLocalDataToCloud(): Promise<void> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return;
  try {
    const ownIdentity = { ...identity, admin: false };
    const localStudents = filterStudents(getStoredStudentActivities(), ownIdentity);
    const localSocratic = getStoredSocraticSummaries().filter(row => normalizeEmail(row.studentEmail) === identity.email);
    const localEvents = getStoredLearningEvents().filter(row => normalizeEmail(row.studentEmail) === identity.email);

    if (localStudents.length === 0 && localSocratic.length === 0 && localEvents.length === 0) {
      return;
    }

    // Metadata is sent separately; nested records replay as deduplicated top-level logs.
    const rows = ownSyncRows({ students: localStudents, socraticLogs: localSocratic, learningEvents: localEvents }, identity);
    await sendOwnAnalyticsBatches(rows, identity);

    if (!isCurrentIdentity(identity)) return;

    // 2. Parallel upload to Firestore
    rows.socraticLogs.forEach((log) => {
      if (log && log.id) {
        safeSetDoc(doc(db, 'socratic_logs', log.id), log, { merge: true }).catch(() => { if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 클라우드 저장에 실패했습니다. 브라우저의 원본 기록은 보존되어 있습니다.'); });
      }
    });

    rows.learningEvents.forEach((ev) => {
      if (ev && ev.id) {
        safeSetDoc(doc(db, 'learningEvents', ev.id), ev, { merge: true }).catch(() => { if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 클라우드 저장에 실패했습니다. 브라우저의 원본 기록은 보존되어 있습니다.'); });
      }
    });

    rows.students.forEach((std) => {
      if (std && std.email) {
        const docId = std.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        safeSetDoc(doc(db, 'students', docId), std, { merge: true }).catch(() => { if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 클라우드 저장에 실패했습니다. 브라우저의 원본 기록은 보존되어 있습니다.'); });
      }
    });
  } catch {
    if (isCurrentIdentity(identity)) notifyAnalyticsSyncError('학습 기록 동기화 중 오류가 발생했습니다. 브라우저의 원본 기록은 보존되어 있습니다.');
  }
}

// Background Firestore cache to avoid slow network blocking
let firestoreCache: {
  students: StudentActivity[];
  socraticLogs: SocraticSummary[];
  learningEvents: LearningEvent[];
  lastFetched: number;
} = {
  students: [],
  socraticLogs: [],
  learningEvents: [],
  lastFetched: 0,
};

async function fetchFirestoreWithTimeout(timeoutMs = 3500): Promise<{
  students: StudentActivity[];
  socraticLogs: SocraticSummary[];
  learningEvents: LearningEvent[];
}> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return emptyAnalyticsCache();
  const now = Date.now();
  // Use cached Firestore data if fetched within last 5 seconds to avoid API latency
  if (now - firestoreCache.lastFetched < 5000 && firestoreCache.students.length > 0) {
    return firestoreCache;
  }

  const fetchPromise = (async () => {
    const students: StudentActivity[] = [];
    const socraticLogs: SocraticSummary[] = [];
    const learningEvents: LearningEvent[] = [];

    const [stdSnap, socSnap, evtSnap] = await Promise.allSettled([
      getDocs(ownerQuery('students', 'email', identity)),
      getDocs(ownerQuery('socratic_logs', 'studentEmail', identity)),
      getDocs(ownerQuery('learningEvents', 'studentEmail', identity)),
    ]);

    if (stdSnap.status === 'fulfilled' && !stdSnap.value.empty) {
      stdSnap.value.forEach((d) => {
        const sData = d.data() as StudentActivity;
        students.push(sData);
        // Also extract any student-nested logs
        if (sData.socraticLogs && Array.isArray(sData.socraticLogs)) {
          sData.socraticLogs.forEach((l) => {
            if (l) socraticLogs.push(l);
          });
        }
        if (sData.learningEvents && Array.isArray(sData.learningEvents)) {
          sData.learningEvents.forEach((e) => {
            if (e) learningEvents.push(e);
          });
        }
      });
    }
    if (socSnap.status === 'fulfilled' && !socSnap.value.empty) {
      socSnap.value.forEach((d) => {
        const item = d.data() as SocraticSummary;
        if (item) socraticLogs.push(item);
      });
    }
    if (evtSnap.status === 'fulfilled' && !evtSnap.value.empty) {
      evtSnap.value.forEach((d) => {
        const item = d.data() as LearningEvent;
        if (item) learningEvents.push(item);
      });
    }

    if (!isCurrentIdentity(identity)) return emptyAnalyticsCache();
    const result = { students: filterStudents(students, identity),
      socraticLogs: socraticLogs.filter(row => canReadOwner(row.studentEmail, identity)),
      learningEvents: learningEvents.filter(row => canReadOwner(row.studentEmail, identity)), lastFetched: Date.now() };
    firestoreCache = result;
    notifyAnalyticsUpdated();
    return result;
  })();

  const timeoutPromise = new Promise<{
    students: StudentActivity[];
    socraticLogs: SocraticSummary[];
    learningEvents: LearningEvent[];
  }>((resolve) => setTimeout(() => resolve(isCurrentIdentity(identity) ? firestoreCache : emptyAnalyticsCache()), timeoutMs));

  const result = await Promise.race([fetchPromise, timeoutPromise]);
  return isCurrentIdentity(identity) ? result : emptyAnalyticsCache();
}

/**
 * Ultra-Fast Multi-Source Data Aggregator:
 * 1. LocalStorage (0ms immediate state)
 * 2. High-speed In-Memory Backend API (10~20ms)
 * 3. Non-blocking Firestore Background Sync with Student-Nested Log Extraction
 */
export async function fetchServerAnalyticsData(): Promise<{
  students: StudentActivity[];
  socraticLogs: SocraticSummary[];
  learningEvents: LearningEvent[];
}> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return emptyAnalyticsCache();
  let accessDenied = false;
  let serverStudents: StudentActivity[] = [];
  let serverSocraticLogs: SocraticSummary[] = [];
  let serverLearningEvents: LearningEvent[] = [];

  // 1. Fast Path: High-speed Backend Server API (10~20ms response)
  const backendPromise = (async () => {
    try {
      const res = await sendAnalyticsRequest('/api/analytics/data', identity);
      if (!res) return;
      if (res.status === 401 || res.status === 403) accessDenied = true;
      if (!isCurrentIdentity(identity)) return;
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          serverStudents = data.students || [];
          serverSocraticLogs = data.socraticLogs || [];
          serverLearningEvents = data.learningEvents || [];
        }
      }
    } catch (e) {}
  })();

  // 2. Parallel Firestore Sync (with 3500ms guard)
  const firestorePromise = fetchFirestoreWithTimeout(3500);

  await Promise.allSettled([backendPromise, firestorePromise]);

  if (!isCurrentIdentity(identity) || accessDenied) return emptyAnalyticsCache();
  const { students: firestoreStudents, socraticLogs: firestoreSocratic, learningEvents: firestoreEvents } = firestoreCache;

  // 3. LocalStorage
  const localStudents = getStoredStudentActivities();
  const localSocratic = getStoredSocraticSummaries();
  const localEvents = getStoredLearningEvents();

  // Merge students
  const studentMap = new Map<string, StudentActivity>();
  const addOrUpdateStudent = (s: StudentActivity) => {
    if (!s || !s.email) return;
    const key = s.email.toLowerCase().trim();
    const existing = studentMap.get(key);
    if (!existing) {
      studentMap.set(key, s);
    } else {
      // Merge socraticLogs and learningEvents
      const mergedSoc = [...(existing.socraticLogs || []), ...(s.socraticLogs || [])];
      const mergedEvt = [...(existing.learningEvents || []), ...(s.learningEvents || [])];

      studentMap.set(key, {
        ...existing,
        ...s,
        loginCount: Math.max(existing.loginCount || 1, s.loginCount || 1),
        totalDwellTimeMinutes: Math.max(existing.totalDwellTimeMinutes || 0, s.totalDwellTimeMinutes || 0),
        completedPassagesCount: Math.max(existing.completedPassagesCount || 0, s.completedPassagesCount || 0),
        transformedQuestionsGenerated: Math.max(existing.transformedQuestionsGenerated || 0, s.transformedQuestionsGenerated || 0),
        socraticQuestionsCount: Math.max(existing.socraticQuestionsCount || 0, s.socraticQuestionsCount || 0),
        status: s.status === 'online' || existing.status === 'online' ? 'online' : 'offline',
        socraticLogs: mergedSoc,
        learningEvents: mergedEvt,
      });
    }
  };

  localStudents.forEach(addOrUpdateStudent);
  firestoreStudents.forEach(addOrUpdateStudent);
  serverStudents.forEach(addOrUpdateStudent);

  // Merge Socratic logs (deduplicate by id or unique signature)
  const socMap = new Map<string, SocraticSummary>();
  [...firestoreSocratic, ...localSocratic, ...serverSocraticLogs].forEach((soc) => {
    if (soc) {
      const key = soc.id || `${soc.studentEmail || 'guest'}_${soc.passageTitle || ''}_${(soc.studentQuestionSnippet || '').slice(0, 30)}`;
      if (!soc.id) soc.id = key;
      socMap.set(key, soc);
    }
  });

  // Merge Learning Events (deduplicate by id or signature)
  const eventMap = new Map<string, LearningEvent>();
  [...firestoreEvents, ...localEvents, ...serverLearningEvents].forEach((ev) => {
    if (ev) {
      const key = ev.id || `${ev.studentEmail || 'guest'}_${ev.passageTitle || ''}_${(ev.reasonText || '').slice(0, 30)}`;
      if (!ev.id) ev.id = key;
      eventMap.set(key, ev);
    }
  });

  // CRITICAL: Extract and merge student-nested logs from all student documents
  Array.from(studentMap.values()).forEach((std) => {
    if (std.socraticLogs && Array.isArray(std.socraticLogs)) {
      std.socraticLogs.forEach((soc) => {
        if (soc) {
          const key = soc.id || `${soc.studentEmail || std.email}_${soc.passageTitle || ''}_${(soc.studentQuestionSnippet || '').slice(0, 30)}`;
          if (!soc.id) soc.id = key;
          socMap.set(key, soc);
        }
      });
    }
    if (std.learningEvents && Array.isArray(std.learningEvents)) {
      std.learningEvents.forEach((ev) => {
        if (ev) {
          const key = ev.id || `${ev.studentEmail || std.email}_${ev.passageTitle || ''}_${(ev.reasonText || '').slice(0, 30)}`;
          if (!ev.id) ev.id = key;
          eventMap.set(key, ev);
        }
      });
    }
  });

  // CRITICAL: Auto-register any student who wrote a reflection/log into studentMap so they are visible in teacher dashboard
  Array.from(socMap.values()).forEach((soc) => {
    if (soc && soc.studentEmail) {
      const key = soc.studentEmail.toLowerCase().trim();
      const existing = studentMap.get(key);
      if (!existing) {
        const name = soc.studentName || (key.includes('@') ? key.split('@')[0] : '학습자');
        studentMap.set(key, {
          id: `std-from-soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: soc.studentEmail,
          name,
          loginCount: 1,
          lastLogin: soc.timestamp || new Date().toLocaleString('ko-KR'),
          totalDwellTimeMinutes: 5,
          completedPassagesCount: 1,
          transformedQuestionsGenerated: 0,
          quizAccuracyPercentage: 0,
          socraticQuestionsCount: 1,
          status: 'offline',
          socraticLogs: [soc],
        });
      } else {
        existing.socraticQuestionsCount = Math.max(existing.socraticQuestionsCount || 0, 1);
      }
    }
  });

  // CRITICAL: Reconcile socraticQuestionsCount so stale/inflated runaway counters are sanitized
  studentMap.forEach((std, key) => {
    const actualSocCount = Array.from(socMap.values()).filter((soc) => {
      if (!soc || !soc.studentEmail) return false;
      const socKey = soc.studentEmail.toLowerCase().trim();
      return socKey === key;
    }).length;
    std.socraticQuestionsCount = actualSocCount;
  });

  if (!isCurrentIdentity(identity)) return emptyAnalyticsCache();
  for (const [key, row] of studentMap) if (!canReadOwner(row.email, identity)) studentMap.delete(key);
  for (const [key, row] of socMap) if (!canReadOwner(row.studentEmail, identity)) socMap.delete(key);
  for (const [key, row] of eventMap) if (!canReadOwner(row.studentEmail, identity)) eventMap.delete(key);
  for (const [key, row] of studentMap) studentMap.set(key, filterStudents([row], identity)[0]);
  // CRITICAL: Persist all merged Socratic logs and students into current browser's localStorage
  // This guarantees that even if the serverless backend restarts, all data remains permanently intact in the teacher's browser!
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const allSocs = Array.from(socMap.values());
      const allStds = Array.from(studentMap.values());
      if (allSocs.length > 0) {
        persistAnalyticsRows(STORAGE_KEY_SOCRATIC, allSocs);
      }
      if (allStds.length > 0) {
        persistAnalyticsRows(STORAGE_KEY_STUDENTS, allStds);
      }
    }
  } catch (e) {}

  // 4. Background auto-sync local data to cloud so other users (teachers) can see it
  autoSyncAllLocalDataToCloud();

  return {
    students: filterStudents(Array.from(studentMap.values()), identity),
    socraticLogs: Array.from(socMap.values()),
    learningEvents: Array.from(eventMap.values()),
  };
}

const ALL_STUDENT_STORAGE_KEYS = [
  'csat_analytics_students_v1',
  'csat_analytics_students',
  'csat_students',
  'students_activities',
];

/**
 * Get stored student activities from localStorage with legacy key fallback & deep scan
 */
export function getStoredStudentActivities(): StudentActivity[] {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return [];
  const map = new Map<string, StudentActivity>();

  ALL_STUDENT_STORAGE_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((s) => {
          if (s && s.email) {
            const eKey = s.email.toLowerCase().trim();
            const existing = map.get(eKey);
            if (!existing) {
              map.set(eKey, s);
            } else {
              map.set(eKey, {
                ...existing,
                ...s,
                loginCount: Math.max(existing.loginCount || 1, s.loginCount || 1),
                totalDwellTimeMinutes: Math.max(existing.totalDwellTimeMinutes || 0, s.totalDwellTimeMinutes || 0),
                completedPassagesCount: Math.max(existing.completedPassagesCount || 0, s.completedPassagesCount || 0),
                transformedQuestionsGenerated: Math.max(existing.transformedQuestionsGenerated || 0, s.transformedQuestionsGenerated || 0),
                socraticQuestionsCount: Math.max(existing.socraticQuestionsCount || 0, s.socraticQuestionsCount || 0),
              });
            }
          }
        });
      }
    } catch {}
  });

  return filterStudents(Array.from(map.values()));
}

/**
 * Helper to get unique guest student identifier and remembered name
 */
export function getGuestStudentIdentifier(): { guestId: string; guestName: string; guestEmail: string } {
  if (typeof window === 'undefined') {
    return { guestId: 'guest_default', guestName: '학습자 (미로그인 게스트)', guestEmail: 'guest_student@simin.hs.kr' };
  }
  let guestId = localStorage.getItem('csat_guest_client_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('csat_guest_client_id', guestId);
  }
  const savedName = localStorage.getItem('csat_guest_student_name') || '';
  const guestName = savedName.trim() || '학습자 (미로그인 게스트)';
  const guestEmail = savedName.trim()
    ? `${savedName.trim().replace(/\s+/g, '_')}@simin.hs.kr`
    : `${guestId}@simin.hs.kr`;

  return { guestId, guestName, guestEmail };
}

/**
 * Helper to guarantee student record exists in array
 */
export function ensureStudentRecord(emailInput?: string | null, nameInput?: string | null): { students: StudentActivity[]; idx: number } {
  const cleanEmail = (emailInput && emailInput.trim()) ? emailInput.trim().toLowerCase() : 'guest_student@simin.hs.kr';
  const cleanName = (nameInput && nameInput.trim()) ? nameInput.trim() : (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : '학습자');

  const students = getStoredStudentActivities();
  let idx = students.findIndex((s) => s.email.toLowerCase() === cleanEmail);

  const nowStr = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (idx < 0) {
    const newRecord: StudentActivity = {
      id: `std-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      loginCount: 1,
      lastLogin: nowStr,
      totalDwellTimeMinutes: 5,
      completedPassagesCount: 1,
      transformedQuestionsGenerated: 0,
      quizAccuracyPercentage: 100,
      socraticQuestionsCount: 0,
      status: 'online',
    };
    students.unshift(newRecord);
    idx = 0;
  } else {
    students[idx].status = 'online';
    students[idx].lastLogin = nowStr;
    if (nameInput && nameInput.trim()) {
      students[idx].name = nameInput.trim();
    }
  }

  try {
    persistAnalyticsRows(STORAGE_KEY_STUDENTS, students);
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    safeSetDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
  } catch (e) {}

  return { students, idx };
}

/**
 * Async fetch student activities from Firebase Firestore with LocalStorage fallback
 */
export async function fetchFirestoreStudentActivities(): Promise<StudentActivity[]> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return [];
  try {
    const querySnapshot = await getDocs(ownerQuery('students', 'email', identity));
    if (!isCurrentIdentity(identity)) return [];
    if (querySnapshot.empty) {
      return getStoredStudentActivities();
    }
    const list: StudentActivity[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as StudentActivity);
    });
    return filterStudents(list, identity);
  } catch (e) {
    return isCurrentIdentity(identity) ? getStoredStudentActivities() : [];
  }
}

const ALL_SOCRATIC_STORAGE_KEYS = [
  'csat_analytics_socratic_v1',
  'csat_analytics_socratic_summaries',
  'csat_socratic_logs',
  'socratic_summaries',
  'csat_analytics_socratic',
];

/**
 * Get stored Socratic conversation summaries from localStorage across all legacy keys
 * with comprehensive normalization and missing-field repair
 */
export function getStoredSocraticSummaries(): SocraticSummary[] {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return [];
  const socMap = new Map<string, SocraticSummary>();

  ALL_SOCRATIC_STORAGE_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any, idx: number) => {
          if (!item) return;
          const email = (item.studentEmail || item.email || 'guest_student@simin.hs.kr').trim();
          const name = item.studentName || item.name || (email.includes('@') ? email.split('@')[0] : '학습자');
          const snippet = (
            item.studentQuestionSnippet ||
            item.questionText ||
            item.content ||
            item.reasonText ||
            item.text ||
            item.comment ||
            ''
          ).trim();

          const id = item.id || `soc-recovered-${idx}-${Date.now()}`;
          const normalized: SocraticSummary = {
            id,
            studentEmail: email,
            studentName: name,
            passageTitle: item.passageTitle || 'EBS 수능 지문',
            lesson: item.lesson || '',
            itemNo: item.itemNo || '',
            timestamp: item.timestamp || new Date().toLocaleString('ko-KR'),
            studentQuestionSnippet: snippet,
            aiHintLevel: item.aiHintLevel || 1,
            keyTopic: item.keyTopic || `${item.lesson || ''} ${item.itemNo || ''} 지문 학습 성찰`.trim(),
            metacognitiveStatus: item.metacognitiveStatus || '우수 (구문 파악 성공)',
          };

          // Use dedup key of id or email+content
          const dedup = id || `${email.toLowerCase()}_${snippet.slice(0, 30)}`;
          if (!socMap.has(dedup)) {
            socMap.set(dedup, normalized);
          }
        });
      }
    } catch {}
  });

  // Full Dynamic Scan across ALL localStorage keys to recover any previously saved student reflections
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((k) => {
        if (ALL_SOCRATIC_STORAGE_KEYS.includes(k)) return; // Already processed
        try {
          const raw = localStorage.getItem(k);
          if (!raw) return;
          const trimmed = raw.trim();
          if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return;
          const parsed = JSON.parse(trimmed);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          list.forEach((item: any, idx: number) => {
            if (!item || typeof item !== 'object') return;
            const snippet = (
              item.studentQuestionSnippet ||
              item.questionText ||
              item.reasonText ||
              item.content ||
              item.text ||
              item.comment ||
              item.reflection ||
              ''
            ).trim();

            if (snippet && snippet.length > 2) {
              const email = (item.studentEmail || item.email || 'guest_student@simin.hs.kr').trim();
              const name = item.studentName || item.name || (email.includes('@') ? email.split('@')[0] : '학습자');
              const id = item.id || `soc-scan-${k}-${idx}`;
              const dedup = id || `${email.toLowerCase()}_${snippet.slice(0, 30)}`;
              if (!socMap.has(dedup)) {
                socMap.set(dedup, {
                  id,
                  studentEmail: email,
                  studentName: name,
                  passageTitle: item.passageTitle || 'EBS 수능 영어 지문',
                  lesson: item.lesson || '',
                  itemNo: item.itemNo || '',
                  timestamp: item.timestamp || new Date().toLocaleString('ko-KR'),
                  studentQuestionSnippet: snippet,
                  aiHintLevel: item.aiHintLevel || 1,
                  keyTopic: item.keyTopic || `${item.lesson || ''} ${item.itemNo || ''} 지문 학습 성찰`.trim(),
                  metacognitiveStatus: item.metacognitiveStatus || '우수 (구문 파악 성공)',
                });
              }
            }
          });
        } catch (e) {}
      });
    } catch (e) {}
  }

  return Array.from(socMap.values()).filter(row => canReadOwner(row.studentEmail));
}

/**
 * Async fetch Socratic summaries from Firebase Firestore
 */
export async function fetchFirestoreSocraticSummaries(): Promise<SocraticSummary[]> {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return [];
  try {
    const querySnapshot = await getDocs(ownerQuery('socratic_logs', 'studentEmail', identity));
    if (!isCurrentIdentity(identity)) return [];
    if (querySnapshot.empty) {
      return getStoredSocraticSummaries();
    }
    const list: SocraticSummary[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SocraticSummary);
    });
    return list.filter(row => canReadOwner(row.studentEmail, identity));
  } catch (e) {
    return isCurrentIdentity(identity) ? getStoredSocraticSummaries() : [];
  }
}

/**
 * Record user login event and save to Firestore & LocalStorage & Backend
 */
export function recordUserLogin(user: { email?: string | null; displayName?: string | null; photoURL?: string | null }): StudentActivity[] {
  const email = user?.email || 'guest_student@simin.hs.kr';
  const name = user?.displayName || (email.includes('@') ? email.split('@')[0] : '학습자');
  const { students, idx } = ensureStudentRecord(email, name);

  students[idx].loginCount += 1;
  students[idx].status = 'online';

  if (user?.photoURL) {
    students[idx].avatarUrl = user.photoURL;
  }

  try {
    persistAnalyticsRows(STORAGE_KEY_STUDENTS, students);
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    safeSetDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
    syncAnalyticsToServer({ student: students[idx] });
  } catch (e) {}

  return students;
}

/**
 * Record Socratic tutor conversation / study reflection event in Firestore & LocalStorage & Backend
 */
export async function recordSocraticQuestion(data: {
  studentEmail?: string | null;
  studentName?: string | null;
  passageTitle: string;
  lesson: string;
  itemNo: string;
  questionText: string;
  hintLevel?: number;
}): Promise<void> {
  let email = (data.studentEmail && data.studentEmail.trim()) ? data.studentEmail.trim().toLowerCase() : '';
  let name = (data.studentName && data.studentName.trim()) ? data.studentName.trim() : '';

  if (!email || email === 'guest_student@simin.hs.kr') {
    const guestInfo = getGuestStudentIdentifier();
    if (!name || name === '학습자' || name.includes('미로그인')) {
      name = guestInfo.guestName;
    }
    email = guestInfo.guestEmail;
  }
  const nowStr = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaries = getStoredSocraticSummaries();
  const hintLvl = data.hintLevel || 1;
  const status: '우수 (구문 파악 성공)' | '보통 (힌트 유도 필요)' | '집중 필요 (어휘 보강)' =
    hintLvl === 1 ? '우수 (구문 파악 성공)' : hintLvl === 2 ? '보통 (힌트 유도 필요)' : '집중 필요 (어휘 보강)';

  const newLog: SocraticSummary = {
    id: `soc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentEmail: email,
    studentName: name,
    passageTitle: data.passageTitle,
    lesson: data.lesson,
    itemNo: data.itemNo,
    timestamp: nowStr,
    studentQuestionSnippet: data.questionText.slice(0, 150),
    aiHintLevel: hintLvl,
    keyTopic: `${data.lesson} ${data.itemNo} 학습 소감 & 구문 탐구`,
    metacognitiveStatus: status,
  };

  summaries.unshift(newLog);

  // Also create a matching learning event for the live feed
  const newLearningEvent: LearningEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentEmail: email,
    studentName: name,
    passageTitle: data.passageTitle,
    lesson: data.lesson,
    itemNo: data.itemNo,
    questionType: '지문 학습 소감 & 세특',
    reasonText: data.questionText.slice(0, 200),
    timestamp: new Date().toISOString(),
  };

  const storedEvents = getStoredLearningEvents();
  storedEvents.unshift(newLearningEvent);

  try {
    persistAnalyticsRows(STORAGE_KEY_SOCRATIC, summaries);
    persistAnalyticsRows(STORAGE_KEY_LEARNING_EVENTS, storedEvents);
    safeSetDoc(doc(db, 'socratic_logs', newLog.id), newLog).catch(() => {});
    safeSetDoc(doc(db, 'learningEvents', newLearningEvent.id), newLearningEvent).catch(() => {});
  } catch (e) {}

  // Automatically update student activity count and embed socratic logs directly in student record
  const { students, idx } = ensureStudentRecord(email, name);
  students[idx].socraticQuestionsCount += 1;
  students[idx].completedPassagesCount = Math.max(students[idx].completedPassagesCount || 0, 1);
  students[idx].totalDwellTimeMinutes += 2;
  students[idx].lastLogin = nowStr;

  // Embed directly in student object so it syncs with students collection
  if (!students[idx].socraticLogs) students[idx].socraticLogs = [];
  if (!students[idx].socraticLogs.some((l) => l.id === newLog.id)) {
    students[idx].socraticLogs.unshift(newLog);
    students[idx].socraticLogs = students[idx].socraticLogs.slice(0, 50);
  }

  if (!students[idx].learningEvents) students[idx].learningEvents = [];
  if (!students[idx].learningEvents.some((e) => e.id === newLearningEvent.id)) {
    students[idx].learningEvents.unshift(newLearningEvent);
    students[idx].learningEvents = students[idx].learningEvents.slice(0, 100);
  }

  try {
    persistAnalyticsRows(STORAGE_KEY_STUDENTS, students);
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    safeSetDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
    await syncAnalyticsToServer({
      student: students[idx],
      socraticLog: newLog,
      learningEvent: newLearningEvent,
    });
  } catch (e) {}
}

/**
 * Record transformed question generation event in Firestore & LocalStorage & Backend
 */
export function recordGeneratorUsage(studentEmail?: string | null): void {
  const email = studentEmail || 'guest_student@simin.hs.kr';
  const { students, idx } = ensureStudentRecord(email);

  students[idx].transformedQuestionsGenerated += 1;
  students[idx].completedPassagesCount += 1;
  students[idx].totalDwellTimeMinutes += 5;

  try {
    persistAnalyticsRows(STORAGE_KEY_STUDENTS, students);
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    safeSetDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
    syncAnalyticsToServer({ student: students[idx] });
  } catch (e) {}
}

/**
 * Clear all accumulated analytics data
 */
export function clearAnalyticsData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
    localStorage.removeItem(STORAGE_KEY_SOCRATIC);
    localStorage.removeItem(STORAGE_KEY_LEARNING_EVENTS);
  } catch (e) {}
}

/**
 * Calculate overall metrics from student activity data
 */
export function calculateAnalyticsMetrics(students: StudentActivity[]): AnalyticsMetrics {
  const totalStudents = students.length;
  const totalLogins = students.reduce((acc, s) => acc + s.loginCount, 0);
  const totalDwell = students.reduce((acc, s) => acc + s.totalDwellTimeMinutes, 0);
  const avgDwellTimeMinutes = totalStudents > 0 ? Math.round(totalDwell / totalStudents) : 0;
  const totalGeneratedQuestions = students.reduce((acc, s) => acc + s.transformedQuestionsGenerated, 0);
  const totalSocraticConversations = students.reduce((acc, s) => acc + s.socraticQuestionsCount, 0);

  return {
    totalStudents,
    totalLogins,
    avgDwellTimeMinutes,
    totalGeneratedQuestions,
    totalSocraticConversations,
  };
}

/* ==========================================================================
   S1: Append-Only Event Log Infrastructure
   ========================================================================== */

export interface LearningEvent {
  id: string;
  studentEmail: string;
  studentName?: string;
  passageId?: string;
  passageTitle?: string;
  lesson?: string;
  itemNo?: string;
  questionType?: string;
  difficulty?: string;
  selectedIndex?: number;
  correctIndex?: number;
  isCorrect?: boolean;
  reasonText?: string;
  elapsedMs?: number;
  timestamp: string;
}

const ALL_EVENT_STORAGE_KEYS = [
  'csat_analytics_learning_events_v1',
  'csat_analytics_learning_events',
  'csat_learning_events',
  'learning_events',
];

export function getStoredLearningEvents(): LearningEvent[] {
  const identity = captureIdentity();
  if (!identity.verified || !identity.email) return [];
  const eventMap = new Map<string, LearningEvent>();

  ALL_EVENT_STORAGE_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((e: any, idx: number) => {
          if (!e) return;
          const id = e.id || `evt-recovered-${idx}-${Date.now()}`;
          const email = (e.studentEmail || e.email || 'guest_student@simin.hs.kr').trim();
            const rawReason = (e.reasonText || e.content || '').trim();
            const isQuizPlaceholder = !rawReason || rawReason === '오답 선택' || rawReason === '정답 선택' || rawReason === '정답을 올바르게 도출함' || rawReason === '오답 선택 후 오답 원인 분석';
            const defaultType = (e.isCorrect !== undefined || isQuizPlaceholder) ? '변형문제 풀이' : '지문 학습 소감 & 세특';
            const normalized: LearningEvent = {
              id,
              studentEmail: email,
              studentName: e.studentName || e.name || (email.includes('@') ? email.split('@')[0] : '학습자'),
              passageId: e.passageId || '',
              passageTitle: e.passageTitle || '수능 영어 지문',
              lesson: e.lesson || '',
              itemNo: e.itemNo || '',
              questionType: e.questionType || defaultType,
              difficulty: e.difficulty || '',
              selectedIndex: e.selectedIndex,
              correctIndex: e.correctIndex,
              isCorrect: e.isCorrect,
              reasonText: rawReason,
              elapsedMs: e.elapsedMs || 0,
              timestamp: e.timestamp || new Date().toISOString(),
            };

          if (!eventMap.has(id)) {
            eventMap.set(id, normalized);
          }
        });
      }
    } catch {}
  });

  return Array.from(eventMap.values()).filter(row => canReadOwner(row.studentEmail));
}

export async function recordLearningEvent(event: Omit<LearningEvent, 'id' | 'timestamp'>): Promise<LearningEvent[]> {
  const events = getStoredLearningEvents();
  const newEvent: LearningEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  events.unshift(newEvent);
  try {
    persistAnalyticsRows(STORAGE_KEY_LEARNING_EVENTS, events);
    const docId = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    safeSetDoc(doc(db, 'learningEvents', docId), newEvent, { merge: true }).catch(() => {});
    syncAnalyticsToServer({ learningEvent: newEvent });

    if (event.studentEmail) {
      const { students, idx } = ensureStudentRecord(event.studentEmail, event.studentName);
      if (!students[idx].learningEvents) students[idx].learningEvents = [];
      if (!students[idx].learningEvents.some((e) => e.id === newEvent.id)) {
        students[idx].learningEvents.unshift(newEvent);
        students[idx].learningEvents = students[idx].learningEvents.slice(0, 100);
      }
      persistAnalyticsRows(STORAGE_KEY_STUDENTS, students);
      const sDocId = event.studentEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
      safeSetDoc(doc(db, 'students', sDocId), students[idx], { merge: true }).catch(() => {});
    }
  } catch (e) {}

  return events;
}

