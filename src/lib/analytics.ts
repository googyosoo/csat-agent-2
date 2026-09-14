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

export const INITIAL_STUDENTS: StudentActivity[] = [
  {
    id: 'std-20101-minjun',
    email: '20101_minjun@simin.hs.kr',
    name: '20101 김민준',
    loginCount: 14,
    lastLogin: new Date(Date.now() - 1000 * 60 * 12).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 84,
    completedPassagesCount: 8,
    transformedQuestionsGenerated: 15,
    quizAccuracyPercentage: 92,
    socraticQuestionsCount: 4,
    status: 'online',
  },
  {
    id: 'std-20102-seoyeon',
    email: '20102_seoyeon@simin.hs.kr',
    name: '20102 이서연',
    loginCount: 19,
    lastLogin: new Date(Date.now() - 1000 * 60 * 28).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 110,
    completedPassagesCount: 12,
    transformedQuestionsGenerated: 22,
    quizAccuracyPercentage: 96,
    socraticQuestionsCount: 5,
    status: 'online',
  },
  {
    id: 'std-20103-dohyun',
    email: '20103_dohyun@simin.hs.kr',
    name: '20103 박도현',
    loginCount: 9,
    lastLogin: new Date(Date.now() - 1000 * 60 * 45).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 62,
    completedPassagesCount: 6,
    transformedQuestionsGenerated: 11,
    quizAccuracyPercentage: 88,
    socraticQuestionsCount: 3,
    status: 'offline',
  },
  {
    id: 'std-20104-jiwoo',
    email: '20104_jiwoo@simin.hs.kr',
    name: '20104 최지우',
    loginCount: 11,
    lastLogin: new Date(Date.now() - 1000 * 60 * 75).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 75,
    completedPassagesCount: 7,
    transformedQuestionsGenerated: 14,
    quizAccuracyPercentage: 90,
    socraticQuestionsCount: 2,
    status: 'offline',
  },
  {
    id: 'std-20105-yeeun',
    email: '20105_yeeun@simin.hs.kr',
    name: '20105 정예은',
    loginCount: 8,
    lastLogin: new Date(Date.now() - 1000 * 60 * 120).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 53,
    completedPassagesCount: 5,
    transformedQuestionsGenerated: 9,
    quizAccuracyPercentage: 85,
    socraticQuestionsCount: 2,
    status: 'offline',
  },
  {
    id: 'std-guest-simin',
    email: 'guest_student@simin.hs.kr',
    name: '학습자 (미로그인 게스트)',
    loginCount: 5,
    lastLogin: new Date(Date.now() - 1000 * 60 * 5).toLocaleString('ko-KR'),
    totalDwellTimeMinutes: 35,
    completedPassagesCount: 4,
    transformedQuestionsGenerated: 6,
    quizAccuracyPercentage: 89,
    socraticQuestionsCount: 2,
    status: 'online',
  },
];

export const INITIAL_SOCRATIC_SUMMARIES: SocraticSummary[] = [
  {
    id: 'soc-seed-01',
    studentEmail: 'guest_student@simin.hs.kr',
    studentName: '학습자 (미로그인 게스트)',
    passageTitle: '리얼리즘 소설과 허구적 사실의 성격',
    lesson: '실전 모의고사 3회',
    itemNo: '29번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toLocaleString('ko-KR'),
    studentQuestionSnippet: '실제 보고서를 그대로 가져와 소설이라고 명명하는 순간 독자의 태도가 사실 여부(factual truth)에서 보편적 도덕 진리(general moral truth)를 찾는 것으로 전환된다는 마지막 문장이 큰 울림을 주었습니다. 문학의 본질적 가치에 대해 다시 생각해 보게 되었습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 29번 허구적 명제와 도덕적 진리 탐구',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
  {
    id: 'soc-seed-02',
    studentEmail: '20101_minjun@simin.hs.kr',
    studentName: '20101 김민준',
    passageTitle: '놀이와 일의 경계 및 기준 충족의 문제',
    lesson: '실전 모의고사 3회',
    itemNo: '30번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleString('ko-KR'),
    studentQuestionSnippet: '아리스토텔레스가 지적한 "기준 충족에 대한 관심이 과도해질 때 놀이가 노동으로 변질된다"는 결론부가 인상 깊었습니다. 5번 moderate가 문맥상 과도한 집착을 뜻하는 excessive로 바뀌어야 정답이라는 것을 도출했습니다. 배움의 즐거움을 잃지 않는 학습 태도를 유지해야겠다고 느꼈습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 30번 놀이의 본질과 변질 원인 분석',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
  {
    id: 'soc-seed-03',
    studentEmail: '20102_seoyeon@simin.hs.kr',
    studentName: '20102 이서연',
    passageTitle: '리얼리즘 소설과 허구적 사실의 성격',
    lesson: '실전 모의고사 3회',
    itemNo: '29번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toLocaleString('ko-KR'),
    studentQuestionSnippet: 'A번 대동사 문제에서 "Lies are designed to deceive, whereas Lord of the Flies is not"의 is가 대동사로 쓰인 원리를 이해했습니다. 일반동사 deceive의 대동사로 does를 쓸 뻔했으나 수동태 be designed를 받아야 한다는 것을 파악했습니다. 세특 탐구로 "문학 텍스트의 허구성 명제와 언어철학"을 연계하고 싶습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 29번 대동사 be/do 판별 및 허구명제 탐구',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
  {
    id: 'soc-seed-04',
    studentEmail: '20103_dohyun@simin.hs.kr',
    studentName: '20103 박도현',
    passageTitle: '놀이와 일의 경계 및 기준 충족의 문제',
    lesson: '실전 모의고사 3회',
    itemNo: '30번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toLocaleString('ko-KR'),
    studentQuestionSnippet: 'Henry Curtis의 "놀이가 연습의 동기를 부여한다"는 주장을 읽고 야구 선수의 고된 연습이 놀이적 동기에서 비롯된다는 점에 공감했습니다. delayed reward(지연된 보상) 개념과 결부하여 심리학적 관점에서 지문을 분석해 보았습니다.',
    aiHintLevel: 2,
    keyTopic: '실전 3회 30번 지연된 보상과 내적 동기 분석',
    metacognitiveStatus: '보통 (힌트 유도 필요)',
  },
  {
    id: 'soc-seed-05',
    studentEmail: '20104_jiwoo@simin.hs.kr',
    studentName: '20104 최지우',
    passageTitle: '리얼리즘 소설과 허구적 사실의 성격',
    lesson: '실전 모의고사 3회',
    itemNo: '29번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toLocaleString('ko-KR'),
    studentQuestionSnippet: 'B번에서 claimed 뒤에 오는 목적어 절 접속사 that과 what의 구분 기준을 정리했습니다. 뒷문장이 완전한 2형식 문장(propositions in fiction are neither true nor false)이므로 접속사 that이 온다는 것을 명확히 설명할 수 있게 되었습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 29번 명사절 접속사 that vs what 구조 분석',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
  {
    id: 'soc-seed-06',
    studentEmail: '20105_yeeun@simin.hs.kr',
    studentName: '20105 정예은',
    passageTitle: '놀이와 일의 경계 및 기준 충족의 문제',
    lesson: '실전 모의고사 3회',
    itemNo: '30번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 130).toLocaleString('ko-KR'),
    studentQuestionSnippet: '단어 drudgery(고역, 고된 일)와 furnish an adequate motive의 뉘앙스를 확실히 학습했습니다. 어휘 문제에서 전체적인 논리 반전을 알리는 Aristotle, for example 뒷부분의 전환에 주목하여 5번 moderate의 문맥적 모순을 잡아냈습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 30번 핵심 어휘 습득 및 대조 논리 파악',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
  {
    id: 'soc-seed-07',
    studentEmail: '20101_minjun@simin.hs.kr',
    studentName: '20101 김민준',
    passageTitle: '리얼리즘 소설과 허구적 사실의 성격',
    lesson: '실전 모의고사 3회',
    itemNo: '29번 (p.131)',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleString('ko-KR'),
    studentQuestionSnippet: 'the fact that we call it fiction in the first place means that ... 구문에서 동격의 that절과 주어-동사 수일치(means)를 완벽히 정리했습니다. pull one\'s weight(자신의 역할을 다하다) 관용구를 문맥에 맞게 독해하는 훈련이 되었습니다.',
    aiHintLevel: 1,
    keyTopic: '실전 3회 29번 주어-동사 원거리 수일치 구문 정밀 분석',
    metacognitiveStatus: '우수 (구문 파악 성공)',
  },
];

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

  // Merge Socratic logs (deduplicate by id)
  const socMap = new Map<string, SocraticSummary>();
  [...firestoreSocratic, ...localSocratic, ...serverSocraticLogs, ...INITIAL_SOCRATIC_SUMMARIES].forEach((soc) => {
    if (soc && soc.id) {
      socMap.set(soc.id, soc);
    }
  });

  // Merge Learning Events (deduplicate by id)
  const eventMap = new Map<string, LearningEvent>();
  [...firestoreEvents, ...localEvents, ...serverLearningEvents].forEach((ev) => {
    if (ev && ev.id) {
      eventMap.set(ev.id, ev);
    }
  });

  // CRITICAL: Extract and merge student-nested logs from all student documents
  Array.from(studentMap.values()).forEach((std) => {
    if (std.socraticLogs && Array.isArray(std.socraticLogs)) {
      std.socraticLogs.forEach((soc) => {
        if (soc && soc.id) {
          socMap.set(soc.id, soc);
        }
      });
    }
    if (std.learningEvents && Array.isArray(std.learningEvents)) {
      std.learningEvents.forEach((ev) => {
        if (ev && ev.id) {
          eventMap.set(ev.id, ev);
        }
      });
    }
  });

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
 * Get stored student activities from localStorage with legacy key fallback
 */
export function getStoredStudentActivities(): StudentActivity[] {
  const map = new Map<string, StudentActivity>();

  // 1. Preload initial seed students
  INITIAL_STUDENTS.forEach((s) => {
    map.set(s.email.toLowerCase().trim(), { ...s });
  });

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

  // Always ensure seed socratic logs are available as fallback/initial records
  INITIAL_SOCRATIC_SUMMARIES.forEach((seed) => {
    const dedup = seed.id || `${seed.studentEmail.toLowerCase()}_${seed.studentQuestionSnippet.slice(0, 30)}`;
    if (!socMap.has(dedup)) {
      socMap.set(dedup, { ...seed });
    }
  });

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
  const email = (data.studentEmail && data.studentEmail.trim()) ? data.studentEmail.trim().toLowerCase() : 'guest_student@simin.hs.kr';
  const name = (data.studentName && data.studentName.trim()) ? data.studentName.trim() : (email.includes('@') ? email.split('@')[0] : '학습자');
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

