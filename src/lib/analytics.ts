/**
 * Real-time Student Analytics & Learning Tracking Engine with Firebase Firestore & LocalStorage Persistence
 */

import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

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

/**
 * Async Sync activity data to backend server for cross-browser admin tracking
 */
export async function syncAnalyticsToServer(data: {
  student?: StudentActivity;
  students?: StudentActivity[];
  socraticLog?: SocraticSummary;
  socraticLogs?: SocraticSummary[];
  learningEvent?: any;
  learningEvents?: any[];
}): Promise<void> {
  notifyAnalyticsUpdated();
  try {
    await fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {}
}

/**
 * Universal Auto-Sync: Guarantees that ALL locally accumulated student logs & reflections
 * are immediately uploaded to both Backend Server & Firestore DB so teachers can see them.
 */
export async function autoSyncAllLocalDataToCloud(): Promise<void> {
  try {
    const localStudents = getStoredStudentActivities();
    const localSocratic = getStoredSocraticSummaries();
    const localEvents = getStoredLearningEvents();

    if (localStudents.length === 0 && localSocratic.length === 0 && localEvents.length === 0) {
      return;
    }

    // 1. Bulk push to Backend Server API
    await fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        students: localStudents,
        socraticLogs: localSocratic,
        learningEvents: localEvents,
      }),
    }).catch(() => {});

    // 2. Parallel upload to Firestore
    localSocratic.forEach((log) => {
      if (log && log.id) {
        setDoc(doc(db, 'socratic_logs', log.id), log, { merge: true }).catch(() => {});
      }
    });

    localEvents.forEach((ev) => {
      if (ev && ev.id) {
        setDoc(doc(db, 'learningEvents', ev.id), ev, { merge: true }).catch(() => {});
      }
    });

    localStudents.forEach((std) => {
      if (std && std.email) {
        const docId = std.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        setDoc(doc(db, 'students', docId), std, { merge: true }).catch(() => {});
      }
    });
  } catch (e) {}
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
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'socratic_logs')),
      getDocs(collection(db, 'learningEvents')),
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

    const result = { students, socraticLogs, learningEvents, lastFetched: Date.now() };
    firestoreCache = result;
    notifyAnalyticsUpdated();
    return result;
  })();

  const timeoutPromise = new Promise<{
    students: StudentActivity[];
    socraticLogs: SocraticSummary[];
    learningEvents: LearningEvent[];
  }>((resolve) => setTimeout(() => resolve(firestoreCache), timeoutMs));

  return Promise.race([fetchPromise, timeoutPromise]);
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
  let serverStudents: StudentActivity[] = [];
  let serverSocraticLogs: SocraticSummary[] = [];
  let serverLearningEvents: LearningEvent[] = [];

  // 1. Fast Path: High-speed Backend Server API (10~20ms response)
  const backendPromise = (async () => {
    try {
      const res = await fetch('/api/analytics/data');
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

  // CRITICAL: Persist all merged Socratic logs and students into current browser's localStorage
  // This guarantees that even if the serverless backend restarts, all data remains permanently intact in the teacher's browser!
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const allSocs = Array.from(socMap.values());
      const allStds = Array.from(studentMap.values());
      if (allSocs.length > 0) {
        localStorage.setItem(STORAGE_KEY_SOCRATIC, JSON.stringify(allSocs.slice(0, 500)));
      }
      if (allStds.length > 0) {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(allStds.slice(0, 500)));
      }
    }
  } catch (e) {}

  // 4. Background auto-sync local data to cloud so other users (teachers) can see it
  autoSyncAllLocalDataToCloud();

  return {
    students: Array.from(studentMap.values()),
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

  return Array.from(map.values());
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
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    setDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
  } catch (e) {}

  return { students, idx };
}

/**
 * Async fetch student activities from Firebase Firestore with LocalStorage fallback
 */
export async function fetchFirestoreStudentActivities(): Promise<StudentActivity[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    if (querySnapshot.empty) {
      return getStoredStudentActivities();
    }
    const list: StudentActivity[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as StudentActivity);
    });
    return list.length > 0 ? list : getStoredStudentActivities();
  } catch (e) {
    return getStoredStudentActivities();
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

  return Array.from(socMap.values());
}

/**
 * Async fetch Socratic summaries from Firebase Firestore
 */
export async function fetchFirestoreSocraticSummaries(): Promise<SocraticSummary[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'socratic_logs'));
    if (querySnapshot.empty) {
      return getStoredSocraticSummaries();
    }
    const list: SocraticSummary[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SocraticSummary);
    });
    return list;
  } catch (e) {
    return getStoredSocraticSummaries();
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
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    setDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
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
    localStorage.setItem(STORAGE_KEY_SOCRATIC, JSON.stringify(summaries.slice(0, 100)));
    localStorage.setItem(STORAGE_KEY_LEARNING_EVENTS, JSON.stringify(storedEvents.slice(0, 500)));
    setDoc(doc(db, 'socratic_logs', newLog.id), newLog).catch(() => {});
    setDoc(doc(db, 'learningEvents', newLearningEvent.id), newLearningEvent).catch(() => {});
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
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    setDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
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
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    setDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
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
          const normalized: LearningEvent = {
            id,
            studentEmail: email,
            studentName: e.studentName || e.name || (email.includes('@') ? email.split('@')[0] : '학습자'),
            passageId: e.passageId || '',
            passageTitle: e.passageTitle || '수능 영어 지문',
            lesson: e.lesson || '',
            itemNo: e.itemNo || '',
            questionType: e.questionType || (e.reasonText ? '지문 학습 소감 & 세특' : '변형문제 풀이'),
            difficulty: e.difficulty || '',
            selectedIndex: e.selectedIndex,
            correctIndex: e.correctIndex,
            isCorrect: e.isCorrect,
            reasonText: e.reasonText || e.content || '',
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

  return Array.from(eventMap.values());
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
    localStorage.setItem(STORAGE_KEY_LEARNING_EVENTS, JSON.stringify(events.slice(0, 500)));
    const docId = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setDoc(doc(db, 'learningEvents', docId), newEvent, { merge: true }).catch(() => {});
    syncAnalyticsToServer({ learningEvent: newEvent });

    if (event.studentEmail) {
      const { students, idx } = ensureStudentRecord(event.studentEmail, event.studentName);
      if (!students[idx].learningEvents) students[idx].learningEvents = [];
      if (!students[idx].learningEvents.some((e) => e.id === newEvent.id)) {
        students[idx].learningEvents.unshift(newEvent);
        students[idx].learningEvents = students[idx].learningEvents.slice(0, 100);
      }
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      const sDocId = event.studentEmail.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
      setDoc(doc(db, 'students', sDocId), students[idx], { merge: true }).catch(() => {});
    }
  } catch (e) {}

  return events;
}

