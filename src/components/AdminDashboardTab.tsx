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

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ authUser }) => {
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [socSummaries, setSocSummaries] = useState<SocraticSummary[]>([]);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentActivity | null>(null);

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
    const headers = ['학생이름', '이메일', '접속상태', '최근접속시각', '체류시간(분)', '완료지문수', '변형문제풀이수', '소크라테스질의수', '주요탐구소재'];
    const rows = students.map(s => {
      const studentSocraticLogs = socSummaries.filter(
        (soc) => soc.studentEmail.toLowerCase() === s.email.toLowerCase()
      );
      const mainTopics = studentSocraticLogs.map(l => l.keyTopic || '').filter(Boolean).join('; ') || 'EBS 지문 구문 및 어휘 탐구';

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
    link.setAttribute('download', `2027_EBS_심화영어II_학습실적통계_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📊 CSV 학습자 데이터 파일이 다운로드되었습니다 (Excel 한글 인코딩 지원).');
  };

  const handleCopyForGoogleSheets = () => {
    const headers = ['학생이름', '이메일', '접속상태', '최근접속시각', '체류시간(분)', '완료지문수', '변형문제풀이수', '소크라테스질의수', '주요탐구소재'];
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
    const intervalId = setInterval(loadData, 2000);
    return () => clearInterval(intervalId);
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

      {/* KPI Top Cards Grid */}
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

      {/* Detailed Student Analytics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-users-viewfinder text-purple-400"></i>
            <h3 className="text-xs font-bold text-white">학생별 세부 학습 현황 & AI 세특 생성</h3>
            <span className="text-[10px] text-slate-400">({filteredStudents.length}명)</span>
          </div>

          <div className="relative w-full sm:w-64">
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
                  <th className="py-2.5 px-3">상태</th>
                  <th className="py-2.5 px-3">학생 정보</th>
                  <th className="py-2.5 px-3">최근 접속</th>
                  <th className="py-2.5 px-3">체류 시간</th>
                  <th className="py-2.5 px-3">완료 지문</th>
                  <th className="py-2.5 px-3">변형 문제</th>
                  <th className="py-2.5 px-3">학습 소감</th>
                  <th className="py-2.5 px-3 text-right">AI 세특 & 피드백</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
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
                        <div className="font-bold text-slate-200">{std.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{std.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{std.lastLogin}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-300 font-mono">{std.totalDwellTimeMinutes}</span> 분
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-300 font-mono">{std.completedPassagesCount} 지문</td>
                    <td className="py-3 px-3 font-bold text-cyan-300 font-mono">{std.transformedQuestionsGenerated} 문제</td>
                    <td className="py-3 px-3 font-bold text-rose-400 font-mono">{std.socraticQuestionsCount} 건</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleGenerateStudentReport(std)}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-950/50 transition-all flex items-center space-x-1.5 ml-auto"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles text-cyan-300"></i>
                        <span>AI 세특 & 피드백</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                  EBS 지문 학습 실적, 소크라테스 3단계 힌트 응용 및 변형문제 성취도를 종합 분석하는 중입니다.
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
      {/* S1: Append-Only Learning Event Stream Log Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <i className="fa-solid fa-list-check text-cyan-400"></i>
            <span>실시간 학생 풀이 & 사고 이력 누적 스트림 (`learningEvents`)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">총 {learningEvents.length}건 누적됨</span>
        </div>
        {learningEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">아직 축적된 실시간 학습 이벤트 로그가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="p-2.5">일시</th>
                  <th className="p-2.5">학생</th>
                  <th className="p-2.5">지문</th>
                  <th className="p-2.5">유형</th>
                  <th className="p-2.5">정답 여부</th>
                  <th className="p-2.5">학생 사고 근거 / 소감</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {learningEvents.slice(0, 10).map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30">
                    <td className="p-2.5 text-slate-400 font-mono text-[11px]">{new Date(ev.timestamp).toLocaleTimeString('ko-KR')}</td>
                    <td className="p-2.5 text-slate-200 font-bold">{ev.studentName || ev.studentEmail.split('@')[0]}</td>
                    <td className="p-2.5 text-slate-300 font-mono">{ev.lesson} {ev.itemNo}</td>
                    <td className="p-2.5 text-purple-300">{ev.questionType || '지문풀이'}</td>
                    <td className="p-2.5">
                      {ev.isCorrect !== undefined ? (
                        ev.isCorrect ? (
                          <span className="text-emerald-400 font-bold">⭕ 정답</span>
                        ) : (
                          <span className="text-rose-400 font-bold">❌ 오답</span>
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300 truncate max-w-xs">{ev.reasonText || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
