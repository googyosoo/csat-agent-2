import React, { useState, useEffect } from 'react';
import { User } from '../lib/firebase';
import { isAdminUser, ADMIN_EMAILS } from '../lib/adminAuth';
import {
  StudentActivity,
  SocraticSummary,
  LearningEvent,
  getStoredStudentActivities,
  getStoredSocraticSummaries,
  getStoredLearningEvents,
  fetchServerAnalyticsData,
  fetchFirestoreStudentActivities,
  fetchFirestoreSocraticSummaries,
  calculateAnalyticsMetrics,
  clearAnalyticsData,
  parseToTimestamp,
  formatRelativeTime,
} from '../lib/analytics';
import { safeFetchJson } from '../lib/api';

interface AdminDashboardTabProps {
  authUser: User | null;
}

interface StudentReportResult {
  studentEmail: string;
  studentName: string;
  personalizedFeedback: string;
  schoolRecordSetek: string;
  byteCount: number;
  keyCompetencies: string[];
}

export interface UnifiedActivityRecord {
  id: string;
  sourceType: 'reflection' | 'quiz';
  studentEmail: string;
  studentName: string;
  passageTitle: string;
  lesson: string;
  itemNo: string;
  questionType: string;
  isCorrect?: boolean;
  content: string;
  metacognitiveStatus?: string;
  rawTimestamp: number;
  formattedDate: string;
  relativeTime: string;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ authUser }) => {
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [socSummaries, setSocSummaries] = useState<SocraticSummary[]>([]);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentActivity | null>(null);

  // Dedicated Student Reflection (소감/댓글) Viewer Filter & Sort State
  const [reflectionStudentFilter, setReflectionStudentFilter] = useState<string>('all');
  const [reflectionSortOrder, setReflectionSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [reflectionSearch, setReflectionSearch] = useState<string>('');

  // View Navigation Tab ('all': 통합 전체 뷰, 'students': 학생별 학습 현황 및 기록, 'reflections': 학생별 소감 피드, 'feed': 실시간 최신순 기록 스트림)
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'students' | 'reflections' | 'feed'>('all');

  // Student-specific records modal state
  const [selectedStudentForRecords, setSelectedStudentForRecords] = useState<StudentActivity | null>(null);
  const [studentRecordsFilter, setStudentRecordsFilter] = useState<'all' | 'reflection' | 'quiz'>('all');
  const [studentRecordsSearch, setStudentRecordsSearch] = useState('');

  // Accordion expanded students in table
  const [expandedStudentIds, setExpandedStudentIds] = useState<string[]>([]);

  // Latest Activity Feed Controls
  const [feedFilter, setFeedFilter] = useState<'all' | 'reflection' | 'quiz'>('all');
  const [feedStudentFilter, setFeedStudentFilter] = useState<string>('all');
  const [feedSearchTerm, setFeedSearchTerm] = useState('');
  const [feedViewMode, setFeedViewMode] = useState<'cards' | 'table'>('cards');
  const [feedVisibleCount, setFeedVisibleCount] = useState(20);

  // AI Setek Generator State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState<StudentReportResult | null>(null);
  const [copied, setCopied] = useState(false);
  // Google Sheets & CSV Export Modal State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 4000);
  };

  const generateCSVContent = () => {
    const headers = ['학생이름', '이메일', '접속상태', '최근접속시각', '체류시간(분)', '완료지문수', '변형문제풀이수', '학습소감및탐구수', '주요탐구소재'];
    const rows = students.map(s => {
      const studentSocraticLogs = socSummaries.filter(
        (soc) => soc.studentEmail.toLowerCase() === s.email.toLowerCase()
      );
      const mainTopics = studentSocraticLogs.map(l => l.keyTopic || '').filter(Boolean).join('; ') || '지문 구문 및 핵심 어휘 탐구';

      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email.replace(/"/g, '""')}"`,
        `"${s.status === 'online' ? '접속 중' : '오프라인'}"`,
        `"${s.lastLogin || '최근 접속 기록 있음'}"`,
        `"${s.totalDwellTimeMinutes || 0}"`,
        `"${s.completedPassagesCount || 0}"`,
        `"${s.transformedQuestionsGenerated || 0}"`,
        `"${s.socraticQuestionsCount || 0}"`,
        `"${mainTopics.replace(/"/g, '""')}"`
      ].join(',');
    });

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  };

  const handleExportCSV = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `영어_학습실적통계_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📊 CSV 학습자 데이터 파일이 다운로드되었습니다 (Excel 한글 인코딩 지원).');
  };

  const handleCopyForGoogleSheets = () => {
    const headers = ['학생이름', '이메일', '접속상태', '최근접속시각', '체류시간(분)', '완료지문수', '변형문제풀이수', '학습소감및탐구수', '주요탐구소재'];
    const rows = students.map(s => {
      const studentSocraticLogs = socSummaries.filter(
        (soc) => soc.studentEmail.toLowerCase() === s.email.toLowerCase()
      );
      const mainTopics = studentSocraticLogs.map(l => l.keyTopic || '').filter(Boolean).join('; ') || 'EBS 지문 구문 및 어휘 탐구';

      return [
        s.name,
        s.email,
        s.status === 'online' ? '접속 중' : '오프라인',
        s.lastLogin || '최근 접속',
        s.totalDwellTimeMinutes || 0,
        s.completedPassagesCount || 0,
        s.transformedQuestionsGenerated || 0,
        s.socraticQuestionsCount || 0,
        mainTopics
      ].join('\t');
    });

    const tsvContent = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(tsvContent);
    triggerToast('📋 구글 시트용 데이터가 클립보드에 복사되었습니다! 열린 구글 시트에 Ctrl+V로 붙여넣으세요.');
  };

  const handleOpenGoogleSheetsNew = () => {
    handleCopyForGoogleSheets();
    window.open('https://sheets.new', '_blank');
  };

  // Load accumulated real data from Firestore DB and Server Store
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('초기화 중...');

  const loadData = async () => {
    const { students: sList, socraticLogs: socList, learningEvents: evList } = await fetchServerAnalyticsData();
    setStudents(sList);
    setSocSummaries(socList);
    setLearningEvents(evList);
    setLastSyncTime(new Date().toLocaleTimeString('ko-KR'));
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 1000);

    const handleUpdateEvent = () => {
      loadData();
    };

    window.addEventListener('csat_analytics_updated', handleUpdateEvent);
    window.addEventListener('focus', handleUpdateEvent);
    document.addEventListener('visibilitychange', handleUpdateEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('csat_analytics_updated', handleUpdateEvent);
      window.removeEventListener('focus', handleUpdateEvent);
      document.removeEventListener('visibilitychange', handleUpdateEvent);
    };
  }, []);

  const handleResetData = () => {
    clearAnalyticsData();
    loadData();
    setShowResetConfirm(false);
  };

  const handleGenerateStudentReport = async (student: StudentActivity) => {
    setSelectedStudent(student);
    setIsGeneratingReport(true);
    setReportResult(null);
    setReportError(null);
    setCopied(false);

    const studentSocraticLogs = socSummaries.filter(
      (soc) => soc.studentEmail.toLowerCase() === student.email.toLowerCase()
    );

    try {
      const data = await safeFetchJson('/api/gemini/student-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          studentEmail: student.email,
          studentName: student.name,
          records: studentSocraticLogs,
          socraticLogs: studentSocraticLogs,
        }),
      });

      if (data.success && data.data) {
        setReportResult(data.data);
      } else {
        throw new Error(data.error || '보고서 생성 실패');
      }
    } catch (err: any) {
      setReportError(`AI 세특 & 피드백 리포트 생성 오류: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopySetek = () => {
    if (!reportResult?.schoolRecordSetek) return;
    navigator.clipboard.writeText(reportResult.schoolRecordSetek);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Check admin authorization
  const isRealAdmin = authUser ? isAdminUser(authUser.email) : false;
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const hasAccess = isRealAdmin || previewMode;
  const metrics = calculateAnalyticsMetrics(students);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine all student learning events and socratic logs into a unified, timestamp-sorted stream (최신순 내림차순 정렬)
  const allUnifiedRecords: UnifiedActivityRecord[] = React.useMemo(() => {
    const records: UnifiedActivityRecord[] = [];
    const reflectionKeySet = new Set<string>();

    // 1. Process learningEvents (quizzes, transformed questions, reflections)
    learningEvents.forEach((ev) => {
      const ts = parseToTimestamp(ev.timestamp) || (ev.id ? parseToTimestamp(ev.id) : 0);
      const isReflection = ev.questionType === '지문 학습 소감 & 세특' || (!ev.questionType && !ev.isCorrect && !!ev.reasonText);
      const content = (ev.reasonText || '').trim();

      if (isReflection) {
        if (content) {
          reflectionKeySet.add(`${ev.studentEmail.toLowerCase()}_${content.slice(0, 30)}`);
        }
        records.push({
          id: ev.id,
          sourceType: 'reflection',
          studentEmail: ev.studentEmail,
          studentName: ev.studentName || (ev.studentEmail.includes('@') ? ev.studentEmail.split('@')[0] : '학습자'),
          passageTitle: ev.passageTitle || 'EBS 수능 지문',
          lesson: ev.lesson || '',
          itemNo: ev.itemNo || '',
          questionType: '지문 학습 성찰/소감',
          content: content || '지문 구문 및 어휘 탐구 소감 작성',
          rawTimestamp: ts,
          formattedDate: ts ? new Date(ts).toLocaleString('ko-KR') : ev.timestamp,
          relativeTime: formatRelativeTime(ts),
        });
      } else {
        records.push({
          id: ev.id,
          sourceType: 'quiz',
          studentEmail: ev.studentEmail,
          studentName: ev.studentName || (ev.studentEmail.includes('@') ? ev.studentEmail.split('@')[0] : '학습자'),
          passageTitle: ev.passageTitle || '수능 영어 변형 문항',
          lesson: ev.lesson || '',
          itemNo: ev.itemNo || '',
          questionType: ev.questionType || '변형문제 풀이',
          isCorrect: ev.isCorrect,
          content: content || (ev.isCorrect ? '정답을 올바르게 도출함' : '오답 선택 후 오답 원인 분석'),
          rawTimestamp: ts,
          formattedDate: ts ? new Date(ts).toLocaleString('ko-KR') : ev.timestamp,
          relativeTime: formatRelativeTime(ts),
        });
      }
    });

    // 2. Process socSummaries
    socSummaries.forEach((soc) => {
      const text = (soc.studentQuestionSnippet || '').trim();
      const dedupKey = `${soc.studentEmail.toLowerCase()}_${text.slice(0, 30)}`;
      if (text && reflectionKeySet.has(dedupKey)) {
        return; // Already added
      }
      if (text) reflectionKeySet.add(dedupKey);

      const ts = parseToTimestamp(soc.timestamp) || (soc.id ? parseToTimestamp(soc.id) : 0);
      records.push({
        id: soc.id,
        sourceType: 'reflection',
        studentEmail: soc.studentEmail,
        studentName: soc.studentName || (soc.studentEmail.includes('@') ? soc.studentEmail.split('@')[0] : '학습자'),
        passageTitle: soc.passageTitle || 'EBS 수능 지문',
        lesson: soc.lesson || '',
        itemNo: soc.itemNo || '',
        questionType: '지문 학습 성찰/소감',
        content: text || '지문 구문 분석 및 핵심 어휘 학습 소감',
        metacognitiveStatus: soc.metacognitiveStatus,
        rawTimestamp: ts,
        formattedDate: soc.timestamp,
        relativeTime: formatRelativeTime(ts),
      });
    });

    // 3. Process nested socraticLogs and learningEvents from students array directly
    students.forEach((std) => {
      if (std.socraticLogs && Array.isArray(std.socraticLogs)) {
        std.socraticLogs.forEach((soc) => {
          const text = (soc.studentQuestionSnippet || '').trim();
          const dedupKey = `${std.email.toLowerCase()}_${text.slice(0, 30)}`;
          if (text && reflectionKeySet.has(dedupKey)) return;
          if (text) reflectionKeySet.add(dedupKey);

          const ts = parseToTimestamp(soc.timestamp) || (soc.id ? parseToTimestamp(soc.id) : 0);
          records.push({
            id: soc.id || `soc-std-${Math.random().toString(36).substring(2, 6)}`,
            sourceType: 'reflection',
            studentEmail: std.email,
            studentName: std.name || soc.studentName || '학습자',
            passageTitle: soc.passageTitle || 'EBS 수능 지문',
            lesson: soc.lesson || '',
            itemNo: soc.itemNo || '',
            questionType: '지문 학습 성찰/소감',
            content: text || '지문 구문 분석 및 핵심 어휘 학습 소감',
            metacognitiveStatus: soc.metacognitiveStatus,
            rawTimestamp: ts,
            formattedDate: soc.timestamp,
            relativeTime: formatRelativeTime(ts),
          });
        });
      }
      if (std.learningEvents && Array.isArray(std.learningEvents)) {
        std.learningEvents.forEach((ev) => {
          if (records.some((r) => r.id === ev.id)) return;
          const ts = parseToTimestamp(ev.timestamp) || (ev.id ? parseToTimestamp(ev.id) : 0);
          records.push({
            id: ev.id,
            sourceType: 'quiz',
            studentEmail: std.email,
            studentName: std.name || ev.studentName || '학습자',
            passageTitle: ev.passageTitle || '수능 영어 변형 문항',
            lesson: ev.lesson || '',
            itemNo: ev.itemNo || '',
            questionType: ev.questionType || '변형문제 풀이',
            isCorrect: ev.isCorrect,
            content: ev.reasonText || (ev.isCorrect ? '정답을 올바르게 도출함' : '오답 선택 후 오답 원인 분석'),
            rawTimestamp: ts,
            formattedDate: ts ? new Date(ts).toLocaleString('ko-KR') : ev.timestamp,
            relativeTime: formatRelativeTime(ts),
          });
        });
      }
    });

    // STRICT DESCENDING SORT BY RAW TIMESTAMP (최신순!)
    return records.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }, [learningEvents, socSummaries, students]);

  // All reflection logs only (학습 소감 / 학생 댓글)
  const allReflectionsOnly = React.useMemo(() => {
    return allUnifiedRecords.filter((r) => r.sourceType === 'reflection');
  }, [allUnifiedRecords]);

  // Filtered & Sorted Student Reflections for Dedicated Reflection Section (최근 순 / 학생별 필터링)
  const filteredStudentReflections = React.useMemo(() => {
    let list = allReflectionsOnly;

    // 1. 학생별 필터링
    if (reflectionStudentFilter !== 'all') {
      list = list.filter((r) => r.studentEmail.toLowerCase() === reflectionStudentFilter.toLowerCase());
    }

    // 2. 검색어 필터링
    if (reflectionSearch.trim()) {
      const term = reflectionSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(term) ||
          r.studentName.toLowerCase().includes(term) ||
          r.studentEmail.toLowerCase().includes(term) ||
          (r.passageTitle || '').toLowerCase().includes(term) ||
          (r.lesson || '').toLowerCase().includes(term) ||
          (r.itemNo || '').toLowerCase().includes(term)
      );
    }

    // 3. 정렬: 최근순(latest) 또는 오래된순(oldest)
    return [...list].sort((a, b) => {
      if (reflectionSortOrder === 'latest') {
        return b.rawTimestamp - a.rawTimestamp; // 최근 순 (최신 작성 우선)
      } else {
        return a.rawTimestamp - b.rawTimestamp; // 오래된 순
      }
    });
  }, [allReflectionsOnly, reflectionStudentFilter, reflectionSearch, reflectionSortOrder]);

  // Toggle student row expansion in table
  const toggleStudentExpanded = (studentId: string) => {
    setExpandedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Helper to get records for a specific student (already sorted in DESC order)
  const getRecordsForStudent = (email: string) => {
    return allUnifiedRecords.filter((r) => r.studentEmail.toLowerCase() === email.toLowerCase());
  };

  // Filtered latest activity stream records
  const filteredFeedRecords = allUnifiedRecords.filter((record) => {
    // Category filter
    if (feedFilter === 'reflection' && record.sourceType !== 'reflection') return false;
    if (feedFilter === 'quiz' && record.sourceType !== 'quiz') return false;

    // Student filter
    if (feedStudentFilter !== 'all' && record.studentEmail.toLowerCase() !== feedStudentFilter.toLowerCase()) {
      return false;
    }

    // Search term
    if (feedSearchTerm.trim()) {
      const term = feedSearchTerm.toLowerCase();
      const matchName = record.studentName.toLowerCase().includes(term);
      const matchEmail = record.studentEmail.toLowerCase().includes(term);
      const matchPassage = (record.passageTitle || '').toLowerCase().includes(term);
      const matchLesson = (record.lesson || '').toLowerCase().includes(term);
      const matchContent = record.content.toLowerCase().includes(term);
      const matchType = record.questionType.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchPassage && !matchLesson && !matchContent && !matchType) {
        return false;
      }
    }

    return true;
  });

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl mx-auto font-bold border border-rose-500/30">
          <i className="fa-solid fa-user-lock"></i>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">학습 관리자 접근 제한 구역</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          이 대시보드는 지정된 수능 영어 교사 및 관리자 계정만 접근할 수 있습니다.
          <br />
          허가된 관리자 계정: <span className="text-cyan-300 font-mono">{ADMIN_EMAILS.join(', ')}</span>
        </p>
        <button
          onClick={() => setPreviewMode(true)}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all"
        >
          관리자 뷰 미리보기 (테스트용)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-emerald-400 flex items-center space-x-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{syncToast}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl font-bold">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">2027 심화영어II 학습자 대시보드 & AI 세특 생성기</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-md flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>실시간 연동 중 ({lastSyncTime})</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              실제 수강생 수집 실적: <strong className="text-cyan-300 font-mono">{students.length}명</strong> | 학생별 실시간 학습 이력 수집 및 생기부 세특 자동 생성
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs">
          {/* Manual Refresh Button */}
          <button
            onClick={loadData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
            title="실시간 학생 이력 데이터 강제 새로고침"
          >
            <i className="fa-solid fa-rotate text-cyan-400"></i>
            <span>동기화</span>
          </button>
          {/* Google Sheets Sync Button */}
          <button
            onClick={handleOpenGoogleSheetsNew}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
            title="구글 시트(Google Sheets) 새 문서 생성 및 데이터 클립보드 즉시 연동"
          >
            <i className="fa-solid fa-table text-sm"></i>
            <span>구글 시트 연동</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
            title="전체 학생 학습 실적 통계 CSV 파일 다운로드 (Excel 한글 지원)"
          >
            <i className="fa-solid fa-file-csv text-sm"></i>
            <span>CSV 다운로드</span>
          </button>

          {/* More Sync Guide Modal Button */}
          <button
            onClick={() => setShowSyncModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
            title="연동 방식 상세 설정"
          >
            <i className="fa-solid fa-link"></i>
            <span>연동 안내</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-2.5 py-2 bg-slate-800/80 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-700 transition-all flex items-center space-x-1 shrink-0"
            title="수집된 모든 통계 데이터 리셋"
          >
            <i className="fa-solid fa-rotate-left"></i>
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMainTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeMainTab === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-layer-group"></i>
            <span>통합 대시보드</span>
          </button>

          <button
            onClick={() => setActiveMainTab('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeMainTab === 'students'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-users"></i>
            <span>학생별 학습 현황 및 기록</span>
            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[10px] font-mono font-bold">
              {students.length}명
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('reflections')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeMainTab === 'reflections'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-comments text-rose-300"></i>
            <span>✍️ 학생별 학습 소감(댓글) 모아보기</span>
            <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded text-[10px] font-mono font-bold">
              {allReflectionsOnly.length}건
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeMainTab === 'feed'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-bolt text-cyan-400"></i>
            <span>실시간 최신순 기록 스트림</span>
            <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px] font-mono font-bold">
              {allUnifiedRecords.length}건
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 pr-2 flex items-center space-x-2">
          <i className="fa-solid fa-circle-info text-cyan-400"></i>
          <span>학생별 행 클릭 시 작성 소감 및 문제 풀이 즉시 확인 가능</span>
        </div>
      </div>

      {/* KPI Top Cards Grid */}
      {activeMainTab !== 'feed' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">누적 수강 학생 수</span>
              <i className="fa-solid fa-users text-purple-400 text-sm"></i>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">{metrics.totalStudents}</span>
              <span className="text-xs text-purple-400 font-semibold">명</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">총 로그인 횟수</span>
              <i className="fa-solid fa-key text-cyan-400 text-sm"></i>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">{metrics.totalLogins}</span>
              <span className="text-xs text-cyan-400 font-semibold">회</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">평균 체류 시간</span>
              <i className="fa-solid fa-clock text-amber-400 text-sm"></i>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">{metrics.avgDwellTimeMinutes}</span>
              <span className="text-xs text-amber-400 font-semibold">분</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">변형문제 풀이</span>
              <i className="fa-solid fa-file-pen text-emerald-400 text-sm"></i>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">{metrics.totalGeneratedQuestions}</span>
              <span className="text-xs text-emerald-400 font-semibold">건</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">학습 소감/탐구</span>
              <i className="fa-solid fa-comments text-purple-400 text-sm"></i>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-white font-mono">{metrics.totalSocraticConversations}</span>
              <span className="text-xs text-purple-400 font-semibold">건</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Student Analytics & Records Table */}
      {(activeMainTab === 'all' || activeMainTab === 'students') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-users-viewfinder text-purple-400"></i>
              <h3 className="text-sm font-bold text-white">학생별 세부 학습 기록 & AI 세특 관리</h3>
              <span className="text-[11px] text-slate-400 font-mono">({filteredStudents.length}명)</span>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="학생 이름 또는 이메일 검색..."
                className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-500"></i>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <i className="fa-solid fa-user-clock text-3xl text-purple-400/40"></i>
              <p className="text-xs font-semibold text-slate-300">현재 누적된 학생 학습 활동 데이터가 없습니다.</p>
              <p className="text-[11px] text-slate-500">
                학생들이 Google 계정(@simin.hs.kr)으로 로그인하면 실시간으로 접속 시각, 체류시간 및 학습 이력이 이곳에 기록됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                    <th className="py-2.5 px-3">상태</th>
                    <th className="py-2.5 px-3">학생 정보</th>
                    <th className="py-2.5 px-3">최근 접속</th>
                    <th className="py-2.5 px-3">체류 시간</th>
                    <th className="py-2.5 px-3">완료 지문</th>
                    <th className="py-2.5 px-3">변형 문제</th>
                    <th className="py-2.5 px-3">학습 소감</th>
                    <th className="py-2.5 px-3 text-right">기록 상세 & AI 세특</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredStudents.map((std) => {
                    const studentRecords = getRecordsForStudent(std.email);
                    const isExpanded = expandedStudentIds.includes(std.id);
                    const recentLogs = studentRecords.slice(0, 3);

                    return (
                      <React.Fragment key={std.id}>
                        <tr
                          className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-slate-800/30 border-l-2 border-purple-500' : ''
                          }`}
                          onClick={() => toggleStudentExpanded(std.id)}
                        >
                          <td className="py-3 px-3 text-center text-slate-400">
                            <i
                              className={`fa-solid fa-chevron-right text-[10px] transition-transform ${
                                isExpanded ? 'rotate-90 text-purple-400 font-bold' : ''
                              }`}
                            ></i>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                std.status === 'online'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  std.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              ></span>
                              {std.status === 'online' ? '접속 중' : '오프라인'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                                <span>{std.name}</span>
                                {studentRecords.length > 0 && (
                                  <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] rounded border border-purple-500/30 font-mono font-bold">
                                    기록 {studentRecords.length}건
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{std.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">{std.lastLogin}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-amber-300 font-mono">{std.totalDwellTimeMinutes}</span> 분
                          </td>
                          <td className="py-3 px-3 font-bold text-purple-300 font-mono">{std.completedPassagesCount} 지문</td>
                          <td className="py-3 px-3 font-bold text-cyan-300 font-mono">{std.transformedQuestionsGenerated} 문제</td>
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const reflectionCount = Math.max(
                                std.socraticQuestionsCount || 0,
                                studentRecords.filter((r) => r.sourceType === 'reflection').length
                              );
                              if (reflectionCount > 0) {
                                return (
                                  <button
                                    onClick={() => {
                                      setReflectionStudentFilter(std.email);
                                      setActiveMainTab('reflections');
                                    }}
                                    className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-400 rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1.5 shadow-sm"
                                    title={`${std.name} 학생의 소감/댓글 모아보기 (클릭 시 소감 탭으로 이동)`}
                                  >
                                    <i className="fa-solid fa-comment-dots text-[11px] text-rose-400"></i>
                                    <span>{reflectionCount}건 보기</span>
                                  </button>
                                );
                              }
                              return <span className="text-slate-500 font-mono text-xs">0건</span>;
                            })()}
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              {/* View Student All Records Button */}
                              <button
                                onClick={() => setSelectedStudentForRecords(std)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                                title="이 학생이 작성한 모든 학습 소감 및 문제 풀이 기록 확인"
                              >
                                <i className="fa-solid fa-book-open"></i>
                                <span>기록 보기 ({studentRecords.length})</span>
                              </button>

                              {/* AI Setek Generator Button */}
                              <button
                                onClick={() => handleGenerateStudentReport(std)}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-950/50 transition-all flex items-center space-x-1.5 shrink-0"
                              >
                                <i className="fa-solid fa-wand-magic-sparkles text-cyan-300"></i>
                                <span>AI 세특</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Accordion Expanded Row for Inline Records Preview */}
                        {isExpanded && (
                          <tr className="bg-slate-950/80 border-b border-slate-800">
                            <td colSpan={9} className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <i className="fa-solid fa-folder-open text-purple-400 text-xs"></i>
                                  <span className="font-bold text-slate-200 text-xs">
                                    [{std.name}] 학생이 작성한 실시간 학습 기록 미리보기
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    (총 {studentRecords.length}건 중 최근 {recentLogs.length}건)
                                  </span>
                                </div>
                                <button
                                  onClick={() => setSelectedStudentForRecords(std)}
                                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 underline decoration-cyan-500/40"
                                >
                                  <span>전체 기록 {studentRecords.length}건 팝업으로 상세 보기</span>
                                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </button>
                              </div>

                              {studentRecords.length === 0 ? (
                                <p className="text-xs text-slate-500 py-3 text-center bg-slate-900/50 rounded-xl border border-slate-800/60">
                                  아직 작성한 학습 소감이나 문제 풀이 기록이 없습니다.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {recentLogs.map((rec) => (
                                    <div
                                      key={rec.id}
                                      className={`p-3 rounded-xl border space-y-2 text-xs ${
                                        rec.sourceType === 'reflection'
                                          ? 'bg-purple-950/20 border-purple-500/30'
                                          : 'bg-slate-900 border-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-300 truncate max-w-[150px]">
                                          {rec.lesson} {rec.itemNo} {rec.passageTitle}
                                        </span>
                                        <span className="text-slate-500 font-mono text-[10px]">
                                          {rec.relativeTime}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-1.5 text-[10px]">
                                        <span
                                          className={`px-1.5 py-0.5 rounded font-bold ${
                                            rec.sourceType === 'reflection'
                                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                          }`}
                                        >
                                          {rec.questionType}
                                        </span>
                                        {rec.isCorrect !== undefined && (
                                          <span
                                            className={`px-1.5 py-0.5 rounded font-bold ${
                                              rec.isCorrect
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-rose-500/20 text-rose-400'
                                            }`}
                                          >
                                            {rec.isCorrect ? '⭕ 정답' : '❌ 오답'}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-slate-200 text-[11px] leading-relaxed line-clamp-3 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 font-serif">
                                        "{rec.content}"
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ✍️ Dedicated Student Reflections (학습 소감 / 댓글) 모아보기 Section */}
      {(activeMainTab === 'all' || activeMainTab === 'reflections') && (
        <div id="student-reflections-section" className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl font-bold shadow-inner">
                <i className="fa-solid fa-comments"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    ✍️ 학생별 지문 학습 소감(댓글) 모아보기
                  </h3>
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-lg font-mono">
                    총 {allReflectionsOnly.length}건
                  </span>
                  {activeMainTab === 'reflections' && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-md">
                      전용 뷰 모드
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  학생들이 지문 학습 후 직접 작성한 구문 탐구 소감 및 성찰 댓글을 학생별로 필터링하고 최신순으로 확인할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Reflection Top Count Badge */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center space-x-2">
                <span className="text-slate-400">현재 표시 소감:</span>
                <strong className="text-rose-400 font-mono font-bold">{filteredStudentReflections.length}건</strong>
              </div>
            </div>
          </div>

          {/* Filtering & Sorting Controls Bar */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* 1) Student Filter Dropdown & Reset */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 shrink-0">
                  <i className="fa-solid fa-user-check text-rose-400"></i>
                  <span>1) 학생별 필터:</span>
                </span>
                <select
                  value={reflectionStudentFilter}
                  onChange={(e) => setReflectionStudentFilter(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="all">전체 학생 소감 보기 (총 {allReflectionsOnly.length}건)</option>
                  {students.map((std) => {
                    const stdCount = allReflectionsOnly.filter(
                      (r) => r.studentEmail.toLowerCase() === std.email.toLowerCase()
                    ).length;
                    return (
                      <option key={std.id} value={std.email}>
                        {std.name} ({std.email}) - {stdCount}건
                      </option>
                    );
                  })}
                </select>

                {reflectionStudentFilter !== 'all' && (
                  <button
                    onClick={() => setReflectionStudentFilter('all')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
                  >
                    <i className="fa-solid fa-xmark"></i>
                    <span>필터 해제</span>
                  </button>
                )}
              </div>

              {/* 2) Sort Order Toggle (최근 순 / 오래된 순) */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                  <i className="fa-solid fa-arrow-down-wide-short text-cyan-400"></i>
                  <span>2) 정렬:</span>
                </span>
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setReflectionSortOrder('latest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      reflectionSortOrder === 'latest'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="최신 작성된 소감부터 내림차순 정렬"
                  >
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    <span>최근 순 (기본)</span>
                  </button>
                  <button
                    onClick={() => setReflectionSortOrder('oldest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      reflectionSortOrder === 'oldest'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="과거 작성된 소감부터 오름차순 정렬"
                  >
                    <i className="fa-solid fa-arrow-up-1-9"></i>
                    <span>오래된 순</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Keyword Search & Quick Student Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-900">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={reflectionSearch}
                  onChange={(e) => setReflectionSearch(e.target.value)}
                  placeholder="소감 내용, 지문명, 학생명 실시간 검색..."
                  className="w-full bg-slate-900 text-slate-200 text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-500"></i>
                {reflectionSearch && (
                  <button
                    onClick={() => setReflectionSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                )}
              </div>

              {/* Quick Filter Chips for active students */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] overflow-x-auto py-1">
                <span className="text-slate-500 shrink-0">빠른 선택:</span>
                <button
                  onClick={() => setReflectionStudentFilter('all')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    reflectionStudentFilter === 'all'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  전체
                </button>
                {students.slice(0, 7).map((std) => {
                  const count = allReflectionsOnly.filter((r) => r.studentEmail.toLowerCase() === std.email.toLowerCase()).length;
                  const isSelected = reflectionStudentFilter.toLowerCase() === std.email.toLowerCase();
                  return (
                    <button
                      key={std.id}
                      onClick={() => setReflectionStudentFilter(std.email)}
                      className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{std.name}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-rose-700 text-rose-100' : 'bg-slate-800 text-rose-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reflection Cards Feed */}
          {filteredStudentReflections.length === 0 ? (
            <div className="py-14 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mx-auto border border-rose-500/20">
                <i className="fa-solid fa-comment-slash"></i>
              </div>
              <p className="text-sm font-bold text-slate-300">
                {reflectionStudentFilter !== 'all' || reflectionSearch
                  ? '선택한 조건에 해당하는 학생 학습 소감이 없습니다.'
                  : '아직 수집된 학생 학습 소감 데이터가 없습니다.'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                학생들이 지문 학습 화면에서 작성한 구문 분석 소감 및 성찰 댓글이 실시간으로 이곳에 표시됩니다.
              </p>
              {(reflectionStudentFilter !== 'all' || reflectionSearch) && (
                <button
                  onClick={() => {
                    setReflectionStudentFilter('all');
                    setReflectionSearch('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                >
                  모든 소감 다시 보기
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudentReflections.map((item) => {
                  const studentObj = students.find((s) => s.email.toLowerCase() === item.studentEmail.toLowerCase());

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-rose-950/10 flex flex-col justify-between space-y-3"
                    >
                      {/* Card Header: Student & Time */}
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {item.studentName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setReflectionStudentFilter(item.studentEmail)}
                                  className="text-xs font-bold text-white hover:text-rose-300 transition-colors cursor-pointer text-left"
                                  title="이 학생의 소감만 필터링"
                                >
                                  {item.studentName}
                                </button>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {item.studentEmail}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]">
                                {item.lesson && <span className="text-purple-400 font-bold mr-1">[{item.lesson}]</span>}
                                {item.itemNo && <span className="text-cyan-400 mr-1">{item.itemNo}</span>}
                                <span>{item.passageTitle}</span>
                              </div>
                            </div>
                          </div>

                          {/* Relative & Absolute Timestamp */}
                          <div className="text-right shrink-0">
                            <span
                              className="px-2 py-0.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-md"
                              title={item.formattedDate}
                            >
                              {item.relativeTime}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {item.formattedDate.slice(0, 16)}
                            </div>
                          </div>
                        </div>

                        {/* Card Body: Student's Actual Reflection / Comment */}
                        <div className="mt-3 relative">
                          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-100 text-xs leading-relaxed font-sans whitespace-pre-wrap selection:bg-rose-500 selection:text-white shadow-inner">
                            <div className="flex items-start space-x-2">
                              <i className="fa-solid fa-quote-left text-rose-400/60 text-xs mt-0.5 shrink-0"></i>
                              <p className="flex-1 font-medium">{item.content}</p>
                              <i className="fa-solid fa-quote-right text-rose-400/60 text-xs mt-0.5 shrink-0 self-end"></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded-md border border-slate-800">
                            {item.questionType || '지문 학습 성찰'}
                          </span>
                          {item.metacognitiveStatus && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {item.metacognitiveStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {reflectionStudentFilter === 'all' && (
                            <button
                              onClick={() => setReflectionStudentFilter(item.studentEmail)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-300 text-[11px] font-semibold rounded-lg border border-slate-800 transition-all flex items-center space-x-1"
                              title="이 학생의 소감만 보기"
                            >
                              <i className="fa-solid fa-filter text-[10px]"></i>
                              <span>이 학생만</span>
                            </button>
                          )}
                          {studentObj && (
                            <button
                              onClick={() => handleGenerateStudentReport(studentObj)}
                              className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1"
                              title="이 학생의 학습 실적으로 AI 세특 생성"
                            >
                              <i className="fa-solid fa-wand-magic-sparkles text-[10px] text-cyan-300"></i>
                              <span>AI 세특</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student AI Setek & Feedback Report Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-lg font-bold">
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    [{selectedStudent.name}] 학생 AI 피드백 & 생활기록부 세특
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedStudent.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setReportResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {reportError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{reportError}</span>
              </div>
            )}

            {isGeneratingReport ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl font-bold mx-auto animate-bounce">
                  <i className="fa-solid fa-brain animate-spin"></i>
                </div>
                <h4 className="text-sm font-bold text-white">수능 전문 AI가 학습자 세특 & 피드백을 작성 중입니다...</h4>
                <p className="text-xs text-slate-400">
                  지문 분석 실적, 메타인지 성찰 소감 및 변형문제 성취도를 종합 분석하는 중입니다.
                </p>
              </div>
            ) : reportResult ? (
              <div className="space-y-5 text-xs">
                {/* Competency Tags */}
                <div className="flex flex-wrap gap-2">
                  {reportResult.keyCompetencies.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 1. Personalized Feedback */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200 flex items-center space-x-2 text-xs">
                    <i className="fa-solid fa-user-check text-cyan-400"></i>
                    <span>학생 맞춤형 학습 성취도 피드백</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                    {reportResult.personalizedFeedback}
                  </p>
                </div>

                {/* 2. Official NEIS School Record Setek (800~900 Bytes) */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-purple-300 flex items-center space-x-2 text-xs">
                      <i className="fa-solid fa-file-signature text-purple-400"></i>
                      <span>학교생활기록부 세부능력 및 특기사항 (세특 문안)</span>
                    </h4>

                    {/* Byte Counter Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-bold rounded-md">
                        {reportResult.byteCount} / 900 bytes
                      </span>
                      <button
                        onClick={handleCopySetek}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center space-x-1 ${
                          copied
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                        }`}
                      >
                        <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                        <span>{copied ? '복사 완료!' : '세특 원클릭 복사'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-serif text-[12px] whitespace-pre-wrap selection:bg-purple-500 selection:text-white">
                    {reportResult.schoolRecordSetek}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                버튼을 눌러 AI 세특 & 피드백 리포트를 생성해 보세요.
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setReportResult(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets & CSV Integration Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">
                  <i className="fa-solid fa-table"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">구글 시트 (Google Sheets) & CSV 연동 센터</h3>
                  <p className="text-[11px] text-slate-400">학습자 실적 데이터를 스프레드시트에 즉시 동기화합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option 1: Google Sheets Direct Sync */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>방식 1. 구글 시트에 원클릭 연동 (추천)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    실시간 클립보드 Sync
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  버튼 클릭 시 구글 시트 새 문서(<span className="font-mono text-emerald-300">sheets.new</span>)가 열리며 전체 학습자 실적 데이터가 자동으로 클립보드에 복사됩니다. 열린 시트 A1 셀에서 <span className="font-mono font-bold text-white">Ctrl + V</span>를 누르시면 됩니다.
                </p>
                <button
                  onClick={() => {
                    handleOpenGoogleSheetsNew();
                    setShowSyncModal(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-xs"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  <span>구글 시트 새 문서 열기 & 데이터 붙여넣기</span>
                </button>
              </div>

              {/* Option 2: CSV File Download */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                    <i className="fa-solid fa-file-csv"></i>
                    <span>방식 2. Excel CSV 파일 내보내기</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                    UTF-8 BOM 인코딩
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  MS Excel 및 한글 엑셀 프로그램에서 한글 깨짐 없이 바로 열 수 있는 표준 CSV 파일로 내보냅니다.
                </p>
                <button
                  onClick={() => {
                    handleExportCSV();
                    setShowSyncModal(false);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-xs"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>CSV 파일 다운로드 (.csv)</span>
                </button>
              </div>

              {/* Option 3: Copy to Clipboard */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">클립보드에 TSV 형식으로 직접 복사:</span>
                <button
                  onClick={handleCopyForGoogleSheets}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>데이터 클립보드 복사</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Student Records Detail Modal (학생별 작성 기록 상세 모달) */}
      {selectedStudentForRecords && (() => {
        const studentAllLogs = getRecordsForStudent(selectedStudentForRecords.email);
        const filteredLogs = studentAllLogs.filter((rec) => {
          if (studentRecordsFilter === 'reflection' && rec.sourceType !== 'reflection') return false;
          if (studentRecordsFilter === 'quiz' && rec.sourceType !== 'quiz') return false;
          if (studentRecordsSearch.trim()) {
            const term = studentRecordsSearch.toLowerCase();
            const matchContent = rec.content.toLowerCase().includes(term);
            const matchPassage = (rec.passageTitle || '').toLowerCase().includes(term);
            const matchLesson = (rec.lesson || '').toLowerCase().includes(term);
            const matchType = rec.questionType.toLowerCase().includes(term);
            if (!matchContent && !matchPassage && !matchLesson && !matchType) return false;
          }
          return true;
        });

        const reflectionCount = studentAllLogs.filter((r) => r.sourceType === 'reflection').length;
        const quizCount = studentAllLogs.filter((r) => r.sourceType === 'quiz').length;

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl font-bold">
                    <i className="fa-solid fa-book-open-reader"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">
                        [{selectedStudentForRecords.name}] 학생 전체 학습 기록 & 사고 이력
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedStudentForRecords.status === 'online'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {selectedStudentForRecords.status === 'online' ? '접속 중' : '오프라인'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{selectedStudentForRecords.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudentForRecords(null);
                    setStudentRecordsSearch('');
                    setStudentRecordsFilter('all');
                  }}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Student Summary KPI Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">누적 체류</span>
                  <span className="font-bold text-amber-300 font-mono">{selectedStudentForRecords.totalDwellTimeMinutes}분</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">완료 지문</span>
                  <span className="font-bold text-purple-300 font-mono">{selectedStudentForRecords.completedPassagesCount}개</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">문제 풀이</span>
                  <span className="font-bold text-cyan-300 font-mono">{selectedStudentForRecords.transformedQuestionsGenerated}문항</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">성찰 소감</span>
                  <span className="font-bold text-rose-400 font-mono">{selectedStudentForRecords.socraticQuestionsCount}건</span>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-1.5 text-xs">
                  <button
                    onClick={() => setStudentRecordsFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      studentRecordsFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    전체 기록 ({studentAllLogs.length})
                  </button>
                  <button
                    onClick={() => setStudentRecordsFilter('reflection')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      studentRecordsFilter === 'reflection'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    ✍️ 학습 소감 ({reflectionCount})
                  </button>
                  <button
                    onClick={() => setStudentRecordsFilter('quiz')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      studentRecordsFilter === 'quiz'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    🎯 변형문제 풀이 ({quizCount})
                  </button>
                </div>

                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    value={studentRecordsSearch}
                    onChange={(e) => setStudentRecordsSearch(e.target.value)}
                    placeholder="기록 내용/지문 검색..."
                    className="w-full bg-slate-950 text-slate-200 text-xs pl-7 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-500"></i>
                </div>
              </div>

              {/* Records List (Descending Timestamp) */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <i className="fa-solid fa-file-circle-xmark text-3xl text-slate-600"></i>
                    <p className="text-xs font-semibold text-slate-300">조건에 맞는 학습 기록이 없습니다.</p>
                  </div>
                ) : (
                  filteredLogs.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                        rec.sourceType === 'reflection'
                          ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-500/70'
                          : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              rec.sourceType === 'reflection'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {rec.sourceType === 'reflection' ? '✍️ 지문 학습 소감' : '🎯 변형문제 풀이'}
                          </span>
                          <span className="font-bold text-white text-xs">
                            {rec.lesson} {rec.itemNo} {rec.passageTitle}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px]">
                          {rec.isCorrect !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                rec.isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {rec.isCorrect ? '⭕ 정답' : '❌ 오답'}
                            </span>
                          )}
                          {rec.metacognitiveStatus && (
                            <span className="text-slate-400 text-[10px] font-semibold">
                              상태: {rec.metacognitiveStatus}
                            </span>
                          )}
                          <span className="text-slate-400 font-mono text-[11px]" title={rec.formattedDate}>
                            {rec.relativeTime}
                          </span>
                        </div>
                      </div>

                      {/* Content Box */}
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 text-slate-200 text-xs leading-relaxed font-serif whitespace-pre-wrap selection:bg-purple-500 selection:text-white">
                        "{rec.content}"
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>세특 반영 자산: {rec.sourceType === 'reflection' ? '메타인지 구문 탐구 소감' : '문제 해결 사고 근거'}</span>
                        <span className="font-mono">{rec.formattedDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    const student = selectedStudentForRecords;
                    setSelectedStudentForRecords(null);
                    handleGenerateStudentReport(student);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-cyan-300"></i>
                  <span>이 학생의 기록으로 AI 세특 생성하기</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedStudentForRecords(null);
                    setStudentRecordsSearch('');
                    setStudentRecordsFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Upgraded S1: Real-time Unified Learning Event & Reflection Stream (최신순 누적 스트림) */}
      {(activeMainTab === 'all' || activeMainTab === 'feed') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">실시간 학생 학습 기록 & 사고 이력 누적 스트림 (최신순)</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-md flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>최신순 실시간 정렬 중</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  모든 수강생의 지문 학습 소감 및 변형문제 풀이 사고 근거가 작성 시각 기준 내림차순(최신순)으로 자동 집계됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-xs text-slate-400 font-mono">
                총 <strong className="text-cyan-300 font-bold">{allUnifiedRecords.length}건</strong> 누적됨
              </span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setFeedViewMode('cards')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    feedViewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="카드 타임라인 뷰"
                >
                  <i className="fa-solid fa-grip-vertical"></i>
                </button>
                <button
                  onClick={() => setFeedViewMode('table')}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    feedViewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="컴팩트 테이블 뷰"
                >
                  <i className="fa-solid fa-table-list"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => {
                  setFeedFilter('all');
                  setFeedVisibleCount(20);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  feedFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                전체 최신 기록 ({allUnifiedRecords.length})
              </button>
              <button
                onClick={() => {
                  setFeedFilter('reflection');
                  setFeedVisibleCount(20);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                  feedFilter === 'reflection'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>✍️ 지문 학습 소감</span>
                <span className="font-mono text-[10px] text-purple-300">
                  ({allUnifiedRecords.filter((r) => r.sourceType === 'reflection').length})
                </span>
              </button>
              <button
                onClick={() => {
                  setFeedFilter('quiz');
                  setFeedVisibleCount(20);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                  feedFilter === 'quiz'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>🎯 변형문제 풀이 & 사고 근거</span>
                <span className="font-mono text-[10px] text-cyan-300">
                  ({allUnifiedRecords.filter((r) => r.sourceType === 'quiz').length})
                </span>
              </button>
            </div>

            {/* Student Filter Dropdown & Search Bar */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={feedStudentFilter}
                onChange={(e) => {
                  setFeedStudentFilter(e.target.value);
                  setFeedVisibleCount(20);
                }}
                className="bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="all">모든 학생 ({students.length}명)</option>
                {students.map((s) => (
                  <option key={s.id} value={s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-52">
                <input
                  type="text"
                  value={feedSearchTerm}
                  onChange={(e) => {
                    setFeedSearchTerm(e.target.value);
                    setFeedVisibleCount(20);
                  }}
                  placeholder="작성 내용, 학생명 검색..."
                  className="w-full bg-slate-900 text-slate-200 text-xs pl-7 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-500"></i>
              </div>
            </div>
          </div>

          {/* Feed Content Rendering */}
          {filteredFeedRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2 bg-slate-950/40 rounded-2xl border border-slate-800/60">
              <i className="fa-solid fa-inbox text-3xl text-slate-600"></i>
              <p className="text-xs font-semibold text-slate-300">해당 조건에 부합하는 실시간 기록이 없습니다.</p>
              <p className="text-[11px] text-slate-500">
                학생들이 학습 소감을 제출하거나 변형문제를 풀면 실시간으로 최신순 피드에 즉시 나타납니다.
              </p>
            </div>
          ) : feedViewMode === 'cards' ? (
            /* Cards Timeline View */
            <div className="space-y-3">
              {filteredFeedRecords.slice(0, feedVisibleCount).map((record) => {
                const matchedStudent = students.find(
                  (s) => s.email.toLowerCase() === record.studentEmail.toLowerCase()
                );

                return (
                  <div
                    key={record.id}
                    className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                      record.sourceType === 'reflection'
                        ? 'bg-purple-950/15 border-purple-500/30 hover:border-purple-500/60'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                            record.sourceType === 'reflection'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          <i className={`fa-solid ${record.sourceType === 'reflection' ? 'fa-pen-fancy' : 'fa-wand-magic-sparkles'}`}></i>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{record.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{record.studentEmail}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono" title={record.formattedDate}>
                            {record.relativeTime} ({record.formattedDate})
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg font-bold ${
                            record.sourceType === 'reflection'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {record.questionType}
                        </span>

                        {record.isCorrect !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-lg font-bold ${
                              record.isCorrect
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {record.isCorrect ? '⭕ 정답' : '❌ 오답'}
                          </span>
                        )}

                        {record.metacognitiveStatus && (
                          <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline-block">
                            {record.metacognitiveStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Passage Info Title */}
                    <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 pl-1">
                      <i className="fa-solid fa-book-bookmark text-purple-400 text-[10px]"></i>
                      <span>{record.lesson} {record.itemNo} {record.passageTitle}</span>
                    </div>

                    {/* Student Written Content Quote Box */}
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-100 text-xs leading-relaxed font-serif whitespace-pre-wrap selection:bg-purple-500 selection:text-white">
                      "{record.content}"
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-[10px] text-slate-500">
                        {record.sourceType === 'reflection'
                          ? '지문 심층 분석 & 메타인지 성찰 기록'
                          : '수능 유형별 변형 문제 풀이 및 논리적 근거'}
                      </span>

                      {matchedStudent && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedStudentForRecords(matchedStudent)}
                            className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center space-x-1 underline decoration-cyan-500/30"
                          >
                            <i className="fa-solid fa-user-clock text-[10px]"></i>
                            <span>이 학생의 전체 기록 보기</span>
                          </button>
                          <button
                            onClick={() => handleGenerateStudentReport(matchedStudent)}
                            className="text-purple-400 hover:text-purple-300 text-[11px] font-bold flex items-center space-x-1 underline decoration-purple-500/30"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                            <span>AI 세특</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Compact Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">일시 (최신순)</th>
                    <th className="p-2.5">작성 학생</th>
                    <th className="p-2.5">대상 지문</th>
                    <th className="p-2.5">유형</th>
                    <th className="p-2.5">정답 여부</th>
                    <th className="p-2.5">학생 작성 본문 (소감 / 사고 근거)</th>
                    <th className="p-2.5 text-right">학생 기록</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFeedRecords.slice(0, feedVisibleCount).map((record) => {
                    const matchedStudent = students.find(
                      (s) => s.email.toLowerCase() === record.studentEmail.toLowerCase()
                    );

                    return (
                      <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2.5 text-slate-400 font-mono text-[11px] whitespace-nowrap" title={record.formattedDate}>
                          <span className="font-bold text-slate-300">{record.relativeTime}</span>
                          <div className="text-[10px] text-slate-500">{record.formattedDate}</div>
                        </td>
                        <td className="p-2.5 text-slate-200">
                          <div className="font-bold">{record.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{record.studentEmail}</div>
                        </td>
                        <td className="p-2.5 text-slate-300 font-mono text-[11px] max-w-[140px] truncate">
                          {record.lesson} {record.itemNo} {record.passageTitle}
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.sourceType === 'reflection'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {record.questionType}
                          </span>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {record.isCorrect !== undefined ? (
                            record.isCorrect ? (
                              <span className="text-emerald-400 font-bold">⭕ 정답</span>
                            ) : (
                              <span className="text-rose-400 font-bold">❌ 오답</span>
                            )
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-200 font-serif max-w-sm">
                          <div className="line-clamp-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80 text-[11px]">
                            "{record.content}"
                          </div>
                        </td>
                        <td className="p-2.5 text-right whitespace-nowrap">
                          {matchedStudent && (
                            <button
                              onClick={() => setSelectedStudentForRecords(matchedStudent)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold border border-slate-700"
                            >
                              기록 보기
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Load More Button */}
          {filteredFeedRecords.length > feedVisibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setFeedVisibleCount((prev) => prev + 20)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all shadow-md flex items-center space-x-2 mx-auto"
              >
                <i className="fa-solid fa-angles-down text-purple-400"></i>
                <span>
                  기록 더보기 (+20건) &mdash; 총 {filteredFeedRecords.length}건 중 {Math.min(feedVisibleCount, filteredFeedRecords.length)}건 표시 중
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
