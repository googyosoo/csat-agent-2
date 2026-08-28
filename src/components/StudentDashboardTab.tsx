import React, { useState, useEffect } from 'react';
import { User } from '../lib/firebase';
import {
  StudentActivity,
  SocraticSummary,
  LearningEvent,
  getStoredStudentActivities,
  getStoredSocraticSummaries,
  getStoredLearningEvents,
  fetchServerAnalyticsData,
  ensureStudentRecord,
} from '../lib/analytics';

interface StudentDashboardTabProps {
  authUser: User | null;
}

export const StudentDashboardTab: React.FC<StudentDashboardTabProps> = ({ authUser }) => {
  const currentEmail = (authUser?.email || 'guest_student@simin.hs.kr').toLowerCase();
  const currentName = authUser?.displayName || (authUser?.email ? authUser.email.split('@')[0] : '학습자');

  const [myActivity, setMyActivity] = useState<StudentActivity | null>(null);
  const [mySocraticLogs, setMySocraticLogs] = useState<SocraticSummary[]>([]);
  const [myLearningEvents, setMyLearningEvents] = useState<LearningEvent[]>([]);

  const loadMyData = async () => {
    // 1. Ensure local record
    const { students, idx } = ensureStudentRecord(currentEmail, currentName);
    let currentRecord = students[idx] || null;

    // 2. Hydrate from server & Firestore
    try {
      const serverData = await fetchServerAnalyticsData();
      const matched = serverData.students.find(
        (s) => s.email.toLowerCase() === currentEmail
      );
      if (matched) {
        currentRecord = { ...currentRecord, ...matched };
      }
      const filteredSoc = serverData.socraticLogs.filter(
        (s) => s.studentEmail.toLowerCase() === currentEmail
      );
      const filteredEv = serverData.learningEvents.filter(
        (e) => e.studentEmail.toLowerCase() === currentEmail
      );
      setMySocraticLogs(filteredSoc);
      setMyLearningEvents(filteredEv);
    } catch (e) {
      const socSummaries = getStoredSocraticSummaries();
      setMySocraticLogs(socSummaries.filter((s) => s.studentEmail.toLowerCase() === currentEmail));
      const events = getStoredLearningEvents();
      setMyLearningEvents(events.filter((e) => e.studentEmail.toLowerCase() === currentEmail));
    }

    setMyActivity(currentRecord);
  };

  useEffect(() => {
    loadMyData();
    const interval = setInterval(loadMyData, 1000);

    const handleUpdateEvent = () => {
      loadMyData();
    };

    window.addEventListener('csat_analytics_updated', handleUpdateEvent);
    window.addEventListener('focus', handleUpdateEvent);
    document.addEventListener('visibilitychange', handleUpdateEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('csat_analytics_updated', handleUpdateEvent);
      window.removeEventListener('focus', handleUpdateEvent);
      document.removeEventListener('visibilitychange', handleUpdateEvent);
    };
  }, [currentEmail, currentName]);

  const correctCount = myLearningEvents.filter((e) => e.isCorrect).length;
  const totalQuizCount = myLearningEvents.length;
  const quizAccuracy = totalQuizCount > 0 ? Math.round((correctCount / totalQuizCount) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900 border border-blue-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-950/50 shrink-0 overflow-hidden">
            {authUser?.photoURL ? (
              <img src={authUser.photoURL} alt={currentName} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-user-graduate"></i>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">{currentName} 님의 학습 대시보드</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                2027 심화영어II
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{currentEmail}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">최근 학습 기록 시각</div>
            <div className="text-xs font-mono text-cyan-300 font-bold">{myActivity?.lastLogin || '방금 전 접속'}</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
      </div>

      {/* KPI Cards (4 Column Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dwell Time */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">누적 체류 시간</span>
            <i className="fa-solid fa-clock text-amber-400 text-base"></i>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-white font-mono">{myActivity?.totalDwellTimeMinutes || 0}</span>
            <span className="text-xs text-amber-400 font-bold">분</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">수능 영어 지문 읽기 및 문제 풀이 시간</div>
        </div>

        {/* Card 2: Completed Passages */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">완료한 EBS 지문</span>
            <i className="fa-solid fa-book-bookmark text-purple-400 text-base"></i>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-white font-mono">{myActivity?.completedPassagesCount || 0}</span>
            <span className="text-xs text-purple-400 font-bold">개</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">구문 분석 및 퀴즈 완료 지문</div>
        </div>

        {/* Card 3: Generated / Solved Questions */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">AI 변형문제 풀이 수</span>
            <i className="fa-solid fa-wand-magic-sparkles text-emerald-400 text-base"></i>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-white font-mono">{myActivity?.transformedQuestionsGenerated || 0}</span>
            <span className="text-xs text-emerald-400 font-bold">문항</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">수능 유형별 변형 문제 학습 건수</div>
        </div>

        {/* Card 4: Accuracy */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">문제 정답률</span>
            <i className="fa-solid fa-bullseye text-cyan-400 text-base"></i>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black text-white font-mono">{quizAccuracy}</span>
            <span className="text-xs text-cyan-400 font-bold">%</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">출제 변형문항 및 퀴즈 정답률</div>
        </div>
      </div>

      {/* AI Personalized Learning Diagnosis Card */}
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-cyan-300">
          <i className="fa-solid fa-chart-line text-lg"></i>
          <h3 className="text-sm font-bold">AI 맞춤형 학습 성취도 진단 리포트</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-bold">🎯 문제 풀이 정답률</div>
            <div className="text-2xl font-black text-cyan-400 font-mono">{quizAccuracy}%</div>
            <div className="text-[11px] text-slate-500">총 {totalQuizCount}개 시도 중 {correctCount}개 정답</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-bold">💡 메타인지 학습 성취도</div>
            <div className="text-2xl font-black text-purple-400 font-mono">
              {myLearningEvents.length > 5 ? '상위 10% (우수)' : myLearningEvents.length > 0 ? '성장 단계 (우수)' : '시작 단계'}
            </div>
            <div className="text-[11px] text-slate-500">출제 변형문제 학습 누적 기반</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 font-bold">🔥 학습 지속성 점수</div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {myActivity && myActivity.totalDwellTimeMinutes > 30 ? 'A+ (매우 꾸준함)' : 'B (집중 추천)'}
            </div>
            <div className="text-[11px] text-slate-500">체류 시간 및 문제 풀이 활동 지표</div>
          </div>
        </div>
      </div>

      {/* Grid: Left (Reflection Logs), Right (Quiz Learning Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: My Reflection Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-comments text-purple-400"></i>
              <h3 className="text-sm font-bold text-white">나의 지문 학습 소감 & 탐구 기록</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">({mySocraticLogs.length}건)</span>
          </div>

          {mySocraticLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <i className="fa-solid fa-pen-fancy text-3xl text-purple-500/30"></i>
              <p className="text-xs font-semibold text-slate-300">아직 작성한 학습 소감이 없습니다.</p>
              <p className="text-[11px] text-slate-500">
                [지문 분석 워크북] 하단에서 지문 분석 후 메타인지 소감을 작성해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {mySocraticLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-purple-500/40 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-300">{log.passageTitle || 'EBS 지문'} ({log.lesson} {log.itemNo})</span>
                    <span className="text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2 bg-slate-900 p-2 rounded-lg border border-slate-800/60 font-serif">
                    "{log.studentQuestionSnippet}"
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20 font-bold">
                      세특 자산 축적 완료
                    </span>
                    <span className="text-slate-400 font-semibold">{log.metacognitiveStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: My Quiz & Learning Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-list-check text-cyan-400"></i>
              <h3 className="text-sm font-bold text-white">나의 수능 변형문제 풀이 & 정답 이력</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">({myLearningEvents.length}건)</span>
          </div>

          {myLearningEvents.length === 0 ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <i className="fa-solid fa-file-signature text-3xl text-cyan-500/30"></i>
              <p className="text-xs font-semibold text-slate-300">아직 완료한 변형문제 풀이 이력이 없습니다.</p>
              <p className="text-[11px] text-slate-500">
                [AI 변형문항] 탭에서 선생님이 출제한 문제를 풀어보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {myLearningEvents.map((ev) => (
                <div key={ev.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-300">{ev.passageTitle || 'EBS 수능 지문'}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${ev.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                      {ev.isCorrect ? '✓ 정답' : '✗ 오답'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>유형: <strong className="text-slate-200">{ev.questionType || '수능 변형'}</strong></span>
                    <span className="font-mono text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
