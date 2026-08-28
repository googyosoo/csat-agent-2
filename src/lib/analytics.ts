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

/**
 * Async Sync activity data to backend server for cross-browser admin tracking
 */
export async function syncAnalyticsToServer(data: {
  student?: StudentActivity;
  socraticLog?: SocraticSummary;
  learningEvent?: any;
}): Promise<void> {
  try {
    await fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {}
}

/**
 * Fetch all real student activities from backend server and Firestore DB
 */
export async function fetchServerAnalyticsData(): Promise<{
  students: StudentActivity[];
  socraticLogs: SocraticSummary[];
  learningEvents: LearningEvent[];
}> {
  let serverStudents: StudentActivity[] = [];
  let serverSocraticLogs: SocraticSummary[] = [];
  let serverLearningEvents: LearningEvent[] = [];

  // 1. Try Backend Server API
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

  // 2. Try Firestore DB
  let firestoreStudents: StudentActivity[] = [];
  let firestoreSocratic: SocraticSummary[] = [];
  let firestoreEvents: LearningEvent[] = [];
  try {
    const [stdSnap, socSnap, evtSnap] = await Promise.allSettled([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'socratic_logs')),
      getDocs(collection(db, 'learningEvents')),
    ]);
    if (stdSnap.status === 'fulfilled' && !stdSnap.value.empty) {
      stdSnap.value.forEach((d) => firestoreStudents.push(d.data() as StudentActivity));
    }
    if (socSnap.status === 'fulfilled' && !socSnap.value.empty) {
      socSnap.value.forEach((d) => firestoreSocratic.push(d.data() as SocraticSummary));
    }
    if (evtSnap.status === 'fulfilled' && !evtSnap.value.empty) {
      evtSnap.value.forEach((d) => firestoreEvents.push(d.data() as LearningEvent));
    }
  } catch (e) {}

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
      studentMap.set(key, {
        ...existing,
        ...s,
        loginCount: Math.max(existing.loginCount || 1, s.loginCount || 1),
        totalDwellTimeMinutes: Math.max(existing.totalDwellTimeMinutes || 0, s.totalDwellTimeMinutes || 0),
        completedPassagesCount: Math.max(existing.completedPassagesCount || 0, s.completedPassagesCount || 0),
        transformedQuestionsGenerated: Math.max(existing.transformedQuestionsGenerated || 0, s.transformedQuestionsGenerated || 0),
        socraticQuestionsCount: Math.max(existing.socraticQuestionsCount || 0, s.socraticQuestionsCount || 0),
        status: s.status === 'online' || existing.status === 'online' ? 'online' : 'offline',
      });
    }
  };

  localStudents.forEach(addOrUpdateStudent);
  serverStudents.forEach(addOrUpdateStudent);
  firestoreStudents.forEach(addOrUpdateStudent);

  // Merge Socratic logs (deduplicate by id)
  const socMap = new Map<string, SocraticSummary>();
  [...localSocratic, ...serverSocraticLogs, ...firestoreSocratic].forEach((soc) => {
    if (soc && soc.id) {
      socMap.set(soc.id, soc);
    }
  });

  // Merge Learning Events (deduplicate by id)
  const eventMap = new Map<string, LearningEvent>();
  [...localEvents, ...serverLearningEvents, ...firestoreEvents].forEach((ev) => {
    if (ev && ev.id) {
      eventMap.set(ev.id, ev);
    }
  });

  return {
    students: Array.from(studentMap.values()),
    socraticLogs: Array.from(socMap.values()),
    learningEvents: Array.from(eventMap.values()),
  };
}

/**
 * Get stored student activities from localStorage
 */
export function getStoredStudentActivities(): StudentActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

  // Automatically update student activity count
  const { students, idx } = ensureStudentRecord(email, name);
  students[idx].socraticQuestionsCount += 1;
  students[idx].completedPassagesCount = Math.max(students[idx].completedPassagesCount || 0, 1);
  students[idx].totalDwellTimeMinutes += 2;
  students[idx].lastLogin = nowStr;

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
    syncAnalyticsToServer({ learningEvent: newEvent });
  } catch (e) {}

  return events;
}

