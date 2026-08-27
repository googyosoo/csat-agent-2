import React, { useState, useEffect } from 'react';
import { EBSPassage, SavedTransformedQuestion } from '../types';
import { safeFetchJson } from '../lib/api';
import { recordGeneratorUsage, recordLearningEvent } from '../lib/analytics';
import { User } from '../lib/firebase';
import { isAdminUser } from '../lib/adminAuth';

interface GeneratorTabProps {
  selectedPassage?: EBSPassage | null;
  customApiKey: string;
  authUser: User | null;
}

export const GeneratorTab: React.FC<GeneratorTabProps> = ({ selectedPassage, customApiKey, authUser }) => {
  const isAdmin = authUser ? isAdminUser(authUser.email) : false;

  const [targetType, setTargetType] = useState('빈칸 추론');
  const [difficulty, setDifficulty] = useState('수능 표준');
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Questions published for the selected passage
  const [questionsList, setQuestionsList] = useState<SavedTransformedQuestion[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // User choice & feedback state for the active question
  const [userChoices, setUserChoices] = useState<{ [questionId: string]: number }>({});
  const [showAnalysisMap, setShowAnalysisMap] = useState<{ [questionId: string]: boolean }>({});
  const [showOriginalPassage, setShowOriginalPassage] = useState(true);

  // Load published questions for this passage from server
  const loadPublishedQuestions = async () => {
    if (!selectedPassage) return;
    setIsLoadingQuestions(true);
    try {
      const data = await safeFetchJson(`/api/transformed-questions?passageId=${encodeURIComponent(selectedPassage.id)}`);
      if (data.success && Array.isArray(data.questions)) {
        setQuestionsList(data.questions);
        if (data.questions.length > 0) {
          setSelectedQuestionIndex(0);
        }
      }
    } catch (e) {
      console.warn('Failed to load transformed questions from server:', e);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadPublishedQuestions();
    setError(null);
    setSuccessMsg(null);
  }, [selectedPassage?.id]);

  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const [lastGenerateTime, setLastGenerateTime] = useState<number>(0);

  // Admin Generate Question and publish to server
  const generateAndPublishQuestion = async () => {
    if (isGenerating) return;
    if (!isAdmin) {
      setError('문항 출제 권한이 없습니다. 지정된 관리자(교사) 계정만 출제할 수 있습니다.');
      return;
    }

    const now = Date.now();
    if (now - lastGenerateTime < 3000) {
      setError('⚠️ 연속 클릭이 차단되었습니다. 잠시 후 다시 시도해 주세요 (3초 연타 방지).');
      return;
    }
    setLastGenerateTime(now);

    if (!selectedPassage || !selectedPassage.passage) {
      setError('변형 문제를 생성할 지문이 선택되지 않았습니다.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Generate via AI
      const data = await safeFetchJson('/api/gemini/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: selectedPassage.passage,
          lesson: selectedPassage.lesson || '미지정',
          itemNo: selectedPassage.itemNo || '미지정',
          targetQuestionType: targetType,
          difficulty,
          customApiKey,
        }),
      });

      if (!data.success || !data.data) {
        throw new Error(data.error || '변형 문항 생성 실패');
      }

      const generatedItem = data.data;

      // 2. Publish to Server
      const newSavedItem: SavedTransformedQuestion = {
        ...generatedItem,
        id: `trans-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        passageId: selectedPassage.id,
        lesson: selectedPassage.lesson || '미지정',
        itemNo: selectedPassage.itemNo || '미지정',
        title: selectedPassage.title || '수능 영어 지문',
        createdBy: authUser?.email || 'admin@simin.hs.kr',
        createdAt: new Date().toISOString(),
      };

      const saveRes = await safeFetchJson('/api/transformed-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSavedItem),
      });

      if (saveRes.success) {
        setQuestionsList((prev) => [newSavedItem, ...prev]);
        setSelectedQuestionIndex(0);
        recordGeneratorUsage(authUser?.email || 'admin@simin.hs.kr');
        setSuccessMsg(`🎉 [${targetType} - ${difficulty}] 변형 문제가 성공적으로 출제되어 학생들에게 실시간 공유되었습니다!`);
      } else {
        throw new Error(saveRes.error || '문항 저장 실패');
      }
    } catch (err: any) {
      setError(`변형 문제 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Admin Delete Question
  const handleDeleteQuestion = async (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!confirm('이 출제 문항을 삭제하시겠습니까? 삭제 시 학생들의 화면에서도 제거됩니다.')) return;

    try {
      const res = await safeFetchJson(`/api/transformed-questions/${questionId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setQuestionsList((prev) => prev.filter((q) => q.id !== questionId));
        setSelectedQuestionIndex(0);
        setSuccessMsg('문항이 성공적으로 삭제되었습니다.');
      }
    } catch (err: any) {
      alert(`삭제 오류: ${err.message}`);
    }
  };

  // Student/Admin option select
  const handleSelectOption = (question: SavedTransformedQuestion, optionIdx: number) => {
    const isAlreadyAnswered = userChoices[question.id] !== undefined;
    if (isAlreadyAnswered) return;

    setUserChoices((prev) => ({ ...prev, [question.id]: optionIdx }));
    setShowAnalysisMap((prev) => ({ ...prev, [question.id]: true }));

    const isCorrect = optionIdx === question.correctIndex;

    // Record learning event for student progress tracking
    recordLearningEvent({
      studentEmail: authUser?.email || 'guest_student@simin.hs.kr',
      studentName: authUser?.displayName || (authUser?.email ? authUser.email.split('@')[0] : '학습자'),
      passageId: selectedPassage?.id,
      passageTitle: selectedPassage?.title,
      lesson: selectedPassage?.lesson,
      itemNo: selectedPassage?.itemNo,
      questionType: question.type,
      difficulty: question.difficulty,
      selectedIndex: optionIdx,
      correctIndex: question.correctIndex,
      isCorrect,
    }).catch(console.error);
  };

  const formatOptionContent = (rawOpt: string) => {
    if (!rawOpt) return '';
    const stripped = rawOpt.replace(/^([①②③④⑤\(\s]*[1-5][\)\.]?\s*)/, '');
    return stripped.trim();
  };

  if (!selectedPassage) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        <i className="fa-solid fa-file-circle-exclamation text-4xl mb-3 text-amber-400"></i>
        <h3 className="text-base font-bold text-white mb-1">선택된 지문이 없습니다</h3>
        <p className="text-xs text-slate-400">좌측 지문 분석 워크북 목록에서 학습할 EBS 지문을 먼저 선택해 주세요.</p>
      </div>
    );
  }

  const activeQuestion: SavedTransformedQuestion | undefined = questionsList[selectedQuestionIndex];
  const activeUserChoice = activeQuestion ? userChoices[activeQuestion.id] : undefined;
  const activeShowAnalysis = activeQuestion ? showAnalysisMap[activeQuestion.id] : false;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. Admin Generation Control Panel (Only visible to teachers/admins) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 p-6 rounded-2xl border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  교사(관리자) 전용 출제 스튜디오
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 mt-1">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
                <span>[{selectedPassage.lesson} {selectedPassage.itemNo}] 수능 변형 문제 AI 출제</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                유형과 난이도를 선택하고 출제하면 모든 학생의 대시보드와 문제은행에 실시간으로 공유 배포됩니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Question Type Selector */}
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 font-medium mb-0.5">출제 유형</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="빈칸 추론">빈칸 추론</option>
                  <option value="어법 판단">어법 판단</option>
                  <option value="문장 삽입">문장 삽입</option>
                  <option value="어휘 적절성">어휘 적절성</option>
                  <option value="주제 및 제목">주제 및 제목</option>
                  <option value="요약문 완성">요약문 완성</option>
                </select>
              </div>

              {/* Difficulty Selector */}
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 font-medium mb-0.5">난이도</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="수능 표준">수능 표준</option>
                  <option value="고난도 (1등급 구분)">고난도 (1등급 구분)</option>
                  <option value="기초 / 개념 확인">기초 / 개념 확인</option>
                </select>
              </div>

              <button
                onClick={generateAndPublishQuestion}
                disabled={isGenerating}
                className="mt-4 md:mt-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 shrink-0"
              >
                <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                <span>{isGenerating ? 'AI 출제 중...' : 'AI 변형문항 출제 및 배포'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-circle-check text-emerald-400"></i>
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {isGenerating && (
            <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/40 text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold text-sm">
                <i className="fa-solid fa-wand-magic-sparkles animate-spin"></i>
                <span>수능 출제 AI가 문제를 생성하고 학생들에게 배포 중입니다... ({elapsedSeconds}초 경과)</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, (elapsedSeconds / 25) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Questions List Tabs Header (Visible to all students & teachers) */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold border border-amber-500/30">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>[{selectedPassage.lesson} {selectedPassage.itemNo}] 출제된 수능 변형 문제</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-md">
                  총 {questionsList.length}문항
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                선생님이 출제한 변형 문제를 풀고 상세한 해설과 오답 분석을 학습하세요.
              </p>
            </div>
          </div>

          <button
            onClick={loadPublishedQuestions}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 shrink-0"
            title="출제 문항 새로고침"
          >
            <i className={`fa-solid fa-rotate ${isLoadingQuestions ? 'fa-spin text-amber-400' : ''}`}></i>
            <span>새로고침</span>
          </button>
        </div>

        {/* Question Selector Chips */}
        {questionsList.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {questionsList.map((q, idx) => {
              const isCurrent = idx === selectedQuestionIndex;
              const hasAnswered = userChoices[q.id] !== undefined;
              const isAnswerCorrect = hasAnswered && userChoices[q.id] === q.correctIndex;

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-2 cursor-pointer transition-all border ${
                    isCurrent
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>문항 {idx + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    isCurrent ? 'bg-black/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {q.type}
                  </span>

                  {hasAnswered && (
                    <span className={`text-[10px] font-black ${isAnswerCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {isAnswerCorrect ? '✓' : '✗'}
                    </span>
                  )}

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteQuestion(q.id, e)}
                      className="ml-1 text-slate-400 hover:text-rose-300 p-0.5 rounded transition-colors"
                      title="문항 삭제"
                    >
                      <i className="fa-solid fa-trash text-[10px]"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Active Question Display & Solver */}
        {activeQuestion ? (
          <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 space-y-5 shadow-2xl">
            {/* Badges Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
                  {activeQuestion.type}
                </span>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
                  {activeQuestion.difficulty || '수능 표준'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  출제자: {activeQuestion.createdBy}
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow print:hidden"
                title="A4 수능 시험지 양식으로 인쇄 및 PDF 저장"
              >
                <i className="fa-solid fa-print"></i>
                <span>수능 시험지 인쇄 / PDF</span>
              </button>
            </div>

            {/* Instruction Stem */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-start space-x-2">
                <span className="text-amber-400 font-mono shrink-0">[Q{selectedQuestionIndex + 1}]</span>
                <span>{activeQuestion.question}</span>
              </h4>
            </div>

            {/* Original EBS Passage Box Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <i className="fa-solid fa-file-lines text-amber-400"></i>
                <span>수능 출제 및 변형 지문</span>
              </span>
              <button
                onClick={() => setShowOriginalPassage(!showOriginalPassage)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/50 transition-all flex items-center space-x-1"
              >
                <i className={`fa-solid ${showOriginalPassage ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                <span>{showOriginalPassage ? '원본 지문 접기' : '원본 지문 비교 보기'}</span>
              </button>
            </div>

            {showOriginalPassage && selectedPassage.passage && (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <i className="fa-solid fa-book-open"></i>
                    <span>[{selectedPassage.lesson} {selectedPassage.itemNo}] 원본 영어 지문 (Original Passage)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">변형 기준 원문</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-all">
                  {selectedPassage.passage}
                </p>
              </div>
            )}

            {/* Formatted Transformed Passage Box */}
            <div className="p-5 bg-slate-900 rounded-xl border border-amber-500/30 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap shadow-inner">
              <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider mb-2 pb-1 border-b border-slate-800 flex items-center space-x-1">
                <i className="fa-solid fa-pen-ruler"></i>
                <span>[{activeQuestion.type}] 변형 적용 지문</span>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: activeQuestion.modifiedPassage
                    ? activeQuestion.modifiedPassage
                        .replace(/<u>/g, '<u class="text-amber-300 font-bold underline decoration-amber-400 decoration-2 underline-offset-4">')
                        .replace(/\[ 주어진 문장 \]/g, '<div class="p-3 my-2 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 font-semibold">[ 주어진 문장 ]</div>')
                        .replace(/\[ 요약문 \]/g, '<div class="p-3 my-2 bg-purple-950/40 border border-purple-500/40 rounded-lg text-purple-200 font-semibold">[ 요약문 ]</div>')
                    : ''
                }}
              />
            </div>

            {/* Interactive Options */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                <span>보기를 클릭하여 정답을 선택하고 해설을 확인하세요:</span>
                <button
                  onClick={() => setShowAnalysisMap((prev) => ({ ...prev, [activeQuestion.id]: !activeShowAnalysis }))}
                  className="text-amber-400 hover:underline text-[11px] font-bold"
                >
                  {activeShowAnalysis ? '해설 숨기기' : '정답 및 상세 해설 전체 보기'}
                </button>
              </div>

              {activeQuestion.options?.map((opt, idx) => {
                const isSelected = activeUserChoice === idx;
                const isCorrect = idx === activeQuestion.correctIndex;
                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                if (activeUserChoice !== undefined || activeShowAnalysis) {
                  if (isCorrect) btnStyle = 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 font-bold ring-1 ring-emerald-500/30';
                  else if (isSelected) btnStyle = 'bg-rose-950/80 border-rose-500/80 text-rose-200 ring-1 ring-rose-500/30';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(activeQuestion, idx)}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${btnStyle}`}
                  >
                    <span className="flex items-start space-x-3 pr-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        (activeUserChoice !== undefined || activeShowAnalysis) && isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <span
                        className="leading-snug"
                        dangerouslySetInnerHTML={{
                          __html: formatOptionContent(opt)
                            .replace(/<u>/g, '<u class="text-amber-300 font-bold underline decoration-amber-400 underline-offset-2">')
                        }}
                      />
                    </span>

                    {(activeUserChoice !== undefined || activeShowAnalysis) && (
                      <span className="shrink-0 ml-2">
                        {isCorrect ? (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center space-x-1">
                            <i className="fa-solid fa-check"></i>
                            <span>정답</span>
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-md border border-rose-500/30">
                            오답 선택
                          </span>
                        ) : null}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Analysis & Explanations Panel */}
            {(activeShowAnalysis || activeUserChoice !== undefined) && (
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-800">
                {/* User Answer Feedback */}
                {activeUserChoice !== undefined && (
                  <div className={`p-4 rounded-xl border ${
                    activeUserChoice === activeQuestion.correctIndex
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}>
                    <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                      <i className={`fa-solid ${activeUserChoice === activeQuestion.correctIndex ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-rose-400'}`}></i>
                      <span>
                        {activeUserChoice === activeQuestion.correctIndex
                          ? '🎉 정답입니다! 지문의 논리적 흐름을 정확히 파악했습니다.'
                          : `💡 아쉽습니다. 정답은 ${activeQuestion.correctIndex + 1}번입니다. 아래 해설을 확인하세요.`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Overall Rationale */}
                <div className="p-4 bg-slate-900/90 rounded-xl border border-amber-500/30 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-1.5 text-xs flex items-center space-x-1.5">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>출제 의도 및 정답 논리 해설</span>
                  </span>
                  <p className="text-slate-200 leading-relaxed">{activeQuestion.rationale}</p>
                </div>

                {/* Distractor Breakdown */}
                {activeQuestion.distractorAnalysis && activeQuestion.distractorAnalysis.length > 0 && (
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-cyan-400 block mb-2 text-xs flex items-center space-x-1.5">
                      <i className="fa-solid fa-list-ol"></i>
                      <span>선지별 상세 오답 & 정답 원인 분석</span>
                    </span>
                    <div className="space-y-1.5">
                      {activeQuestion.distractorAnalysis.map((d, i) => (
                        <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start space-x-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                            d.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {i + 1}번
                          </span>
                          <span className="text-slate-300 leading-relaxed">{d.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary & Syntax Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {activeQuestion.vocabularyHighlights && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-pink-400 block mb-1.5">
                        <i className="fa-solid fa-spell-check mr-1"></i> 문항 출제 핵심 어휘:
                      </span>
                      <ul className="space-y-1">
                        {activeQuestion.vocabularyHighlights.map((vh, i) => (
                          <li key={i} className="text-[11px] text-slate-300 font-mono">• {vh}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeQuestion.syntaxHighlights && (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-cyan-400 block mb-1.5">
                        <i className="fa-solid fa-code mr-1"></i> 수능 출제 구문 포인트:
                      </span>
                      <ul className="space-y-1">
                        {activeQuestion.syntaxHighlights.map((sh, i) => (
                          <li key={i} className="text-[11px] text-slate-300 font-mono">• {sh}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800 border-dashed space-y-2">
            <i className="fa-solid fa-folder-open text-4xl mb-2 text-slate-700"></i>
            <h4 className="text-sm font-bold text-slate-300">
              {isAdmin
                ? '아직 이 지문의 변형 문제가 출제되지 않았습니다.'
                : '선생님이 아직 이 지문의 변형 문제를 출제하지 않았습니다.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isAdmin
                ? '상단 출제 스튜디오에서 출제 유형과 난이도를 선택한 후 [AI 변형문항 출제 및 배포] 버튼을 눌러 학생들에게 배포하세요.'
                : '선생님이 문제를 출제하면 이곳에서 실시간으로 변형 문제를 풀고 해설을 확인할 수 있습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
