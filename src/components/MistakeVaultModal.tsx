import React, { useState } from 'react';
import { LearningEvent, getStoredLearningEvents } from '../lib/analytics';
import { User } from '../lib/firebase';

interface MistakeVaultModalProps {
  onClose: () => void;
  authUser: User | null;
}

export const MistakeVaultModal: React.FC<MistakeVaultModalProps> = ({ onClose, authUser }) => {
  const allEvents = getStoredLearningEvents();
  const studentEmail = authUser?.email?.toLowerCase();

  const userMistakes = allEvents.filter(
    (ev) => ev.isCorrect === false && (!studentEmail || ev.studentEmail.toLowerCase() === studentEmail)
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedEvent = userMistakes[selectedIndex] || null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl font-bold">
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>📕 나만의 개인 오답노트 (Personal Mistake Vault)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                  오답 {userMistakes.length}개
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                내가 틀렸던 문제와 당시 작성한 판단 이유, 수능 정답 논리를 나란히 비교 복습하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 border border-slate-700"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Content Body */}
        {userMistakes.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <i className="fa-solid fa-circle-check text-4xl text-emerald-400/80"></i>
            <h4 className="text-sm font-bold text-slate-200">축하합니다! 아직 오답 기록이 없습니다.</h4>
            <p className="text-xs text-slate-400">지문 분석 워크북과 변형문제를 계속 풀면서 오답 노트를 쌓아보세요.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4">
            {/* Left Mistake List */}
            <div className="w-full md:w-1/3 overflow-y-auto space-y-2 pr-1 border-r border-slate-800">
              {userMistakes.map((ev, idx) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedIndex === idx
                      ? 'bg-rose-950/70 border-rose-500 text-rose-200 font-bold shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-300 font-bold">
                      [{ev.lesson || 'EBS'} {ev.itemNo || '지문'}]
                    </span>
                    <span className="text-rose-400 font-mono">오답</span>
                  </div>
                  <div className="truncate font-semibold">{ev.passageTitle || '수능 영어 지문'}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {ev.questionType || '지문 문제'} · {new Date(ev.timestamp).toLocaleDateString('ko-KR')}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Detailed Review Area */}
            {selectedEvent && (
              <div className="w-full md:w-2/3 overflow-y-auto space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200">
                    [{selectedEvent.lesson} {selectedEvent.itemNo}] {selectedEvent.passageTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[11px] border border-purple-500/30">
                    {selectedEvent.questionType || '문제 복습'}
                  </span>
                </div>

                {/* Choices Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-rose-300 flex items-center space-x-1">
                      <i className="fa-solid fa-circle-xmark"></i>
                      <span>내가 선택한 답안</span>
                    </span>
                    <p className="text-sm font-bold text-rose-200">
                      {selectedEvent.selectedIndex !== undefined ? `${selectedEvent.selectedIndex + 1}번` : '미선택'}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-emerald-300 flex items-center space-x-1">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>수능 출제 정답</span>
                    </span>
                    <p className="text-sm font-bold text-emerald-200">
                      {selectedEvent.correctIndex !== undefined ? `${selectedEvent.correctIndex + 1}번` : 'EBS 정답'}
                    </p>
                  </div>
                </div>

                {/* Student's Reason / Metacognition Note */}
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-purple-300 flex items-center space-x-1.5">
                    <i className="fa-solid fa-pen-clip"></i>
                    <span>풀이 당시에 작성한 판단 이유 / 메타인지 소감</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    "{selectedEvent.reasonText || '당시 작성된 별도 판단 근거가 없습니다.'}"
                  </p>
                </div>

                {/* AI Review Advice */}
                <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-300 flex items-center space-x-1.5">
                    <i className="fa-solid fa-lightbulb text-amber-400"></i>
                    <span>오답 극복 수능 복습 조언</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    이 유형에서는 지문의 연결어 주변과 결론부 문장의 패러프레이징을 유의해서 재검토해야 합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
