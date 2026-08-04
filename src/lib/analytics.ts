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

const DEFAULT_SAMPLE_STUDENTS: StudentActivity[] = [
  {
    id: 'std-sample-1',
    email: 'minjun.kim@simin.hs.kr',
    name: '김민준 (3학년 1반)',
    avatarUrl: undefined,
    loginCount: 8,
    lastLogin: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    totalDwellTimeMinutes: 52,
    completedPassagesCount: 5,
    transformedQuestionsGenerated: 8,
    quizAccuracyPercentage: 88,
    socraticQuestionsCount: 9,
    status: 'online',
  },
  {
    id: 'std-sample-2',
    email: 'seoyeon.lee@simin.hs.kr',
    name: '이서연 (3학년 2반)',
    avatarUrl: undefined,
    loginCount: 6,
    lastLogin: '2026. 08. 05. 05:40',
    totalDwellTimeMinutes: 41,
    completedPassagesCount: 4,
    transformedQuestionsGenerated: 6,
    quizAccuracyPercentage: 100,
    socraticQuestionsCount: 7,
    status: 'online',
  },
  {
    id: 'std-sample-3',
    email: 'hyunwoo.park@simin.hs.kr',
    name: '박현우 (3학년 1반)',
    avatarUrl: undefined,
    loginCount: 4,
    lastLogin: '2026. 08. 05. 04:15',
    totalDwellTimeMinutes: 28,
    completedPassagesCount: 3,
    transformedQuestionsGenerated: 4,
    quizAccuracyPercentage: 75,
    socraticQuestionsCount: 4,
    status: 'offline',
  },
  {
    id: 'std-sample-4',
    email: 'yujin.choi@simin.hs.kr',
    name: '최유진 (3학년 3반)',
    avatarUrl: undefined,
    loginCount: 5,
    lastLogin: '2026. 08. 04. 21:10',
    totalDwellTimeMinutes: 35,
    completedPassagesCount: 4,
    transformedQuestionsGenerated: 5,
    quizAccuracyPercentage: 92,
    socraticQuestionsCount: 6,
    status: 'offline',
  },
  {
    id: 'std-sample-5',
    email: 'suhyeon.jung@simin.hs.kr',
    name: '정수현 (3학년 2반)',
    avatarUrl: undefined,
    loginCount: 3,
    lastLogin: '2026. 08. 04. 18:30',
    totalDwellTimeMinutes: 22,
    completedPassagesCount: 2,
    transformedQuestionsGenerated: 3,
    quizAccuracyPercentage: 80,
    socraticQuestionsCount: 3,
    status: 'offline',
  },
  {
    id: 'std-sample-6',
    email: 'donghyun.kang@simin.hs.kr',
    name: '강동현 (3학년 1반)',
    avatarUrl: undefined,
    loginCount: 2,
    lastLogin: '2026. 08. 04. 15:05',
    totalDwellTimeMinutes: 18,
    completedPassagesCount: 2,
    transformedQuestionsGenerated: 2,
    quizAccuracyPercentage: 70,
    socraticQuestionsCount: 2,
    status: 'offline',
  },
];

/**
 * Get stored student activities from localStorage merged with roster
 */
export function getStoredStudentActivities(): StudentActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    let currentStored: StudentActivity[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) currentStored = parsed;
      } catch (e) {}
    }

    // Merge stored active students with base student roster so ALL students remain visible
    const mergedMap = new Map<string, StudentActivity>();

    // First populate base roster
    DEFAULT_SAMPLE_STUDENTS.forEach((std) => {
      mergedMap.set(std.email.toLowerCase(), std);
    });

    // Then layer stored activity over base roster
    currentStored.forEach((std) => {
      if (std && std.email) {
        const key = std.email.toLowerCase();
        const existing = mergedMap.get(key);
        if (existing) {
          mergedMap.set(key, {
            ...existing,
            ...std,
            // Keep highest stats if updated
            loginCount: Math.max(existing.loginCount, std.loginCount || 1),
            totalDwellTimeMinutes: Math.max(existing.totalDwellTimeMinutes, std.totalDwellTimeMinutes || 0),
            completedPassagesCount: Math.max(existing.completedPassagesCount, std.completedPassagesCount || 0),
            transformedQuestionsGenerated: Math.max(existing.transformedQuestionsGenerated, std.transformedQuestionsGenerated || 0),
            socraticQuestionsCount: Math.max(existing.socraticQuestionsCount, std.socraticQuestionsCount || 0),
          });
        } else {
          mergedMap.set(key, std);
        }
      }
    });

    const result = Array.from(mergedMap.values());
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(result));
    return result;
  } catch {
    return DEFAULT_SAMPLE_STUDENTS;
  }
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

/**
 * Get stored Socratic conversation summaries from localStorage
 */
export function getStoredSocraticSummaries(): SocraticSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOCRATIC);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
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
 * Record user login event and save to Firestore & LocalStorage
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
  } catch (e) {}

  return students;
}

/**
 * Record Socratic tutor conversation event in Firestore & LocalStorage
 */
export function recordSocraticQuestion(data: {
  studentEmail?: string | null;
  studentName?: string | null;
  passageTitle: string;
  lesson: string;
  itemNo: string;
  questionText: string;
  hintLevel: number;
}): void {
  const email = data.studentEmail || 'guest_student@simin.hs.kr';
  const name = data.studentName || email.split('@')[0];
  const nowStr = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaries = getStoredSocraticSummaries();
  const status: '우수 (구문 파악 성공)' | '보통 (힌트 유도 필요)' | '집중 필요 (어휘 보강)' =
    data.hintLevel === 1 ? '우수 (구문 파악 성공)' : data.hintLevel === 2 ? '보통 (힌트 유도 필요)' : '집중 필요 (어휘 보강)';

  const newLog: SocraticSummary = {
    id: `soc-${Date.now()}`,
    studentEmail: email,
    studentName: name,
    passageTitle: data.passageTitle,
    lesson: data.lesson,
    itemNo: data.itemNo,
    timestamp: nowStr,
    studentQuestionSnippet: data.questionText.slice(0, 120),
    aiHintLevel: data.hintLevel,
    keyTopic: `${data.lesson} ${data.itemNo} 핵심 질의`,
    metacognitiveStatus: status,
  };

  summaries.unshift(newLog);

  try {
    localStorage.setItem(STORAGE_KEY_SOCRATIC, JSON.stringify(summaries.slice(0, 50)));
    setDoc(doc(db, 'socratic_logs', newLog.id), newLog).catch(() => {});
  } catch (e) {}

  // Automatically update student activity count
  const { students, idx } = ensureStudentRecord(email, name);
  students[idx].socraticQuestionsCount += 1;
  students[idx].totalDwellTimeMinutes += 2;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    const docId = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    setDoc(doc(db, 'students', docId), students[idx], { merge: true }).catch(() => {});
  } catch (e) {}
}

/**
 * Record transformed question generation event in Firestore & LocalStorage
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

const STORAGE_KEY_LEARNING_EVENTS = 'csat_analytics_learning_events_v1';

export function getStoredLearningEvents(): LearningEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEARNING_EVENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
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
  } catch (e) {}

  return events;
}

