import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';

interface LandingPageProps {
  onStartGuestPreview: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartGuestPreview }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setLoginError(err?.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-base leading-tight">2027 심인고등학교</h1>
            <span className="text-xs text-blue-400 font-semibold tracking-wider">심화영어II CSAT-AI Engine</span>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
        >
          <i className={`fa-brands fa-google ${isLoggingIn ? 'fa-spin' : ''}`}></i>
          <span>{isLoggingIn ? '로그인 처리 중...' : 'Google 로그인'}</span>
        </button>
      </header>

      {/* Main Hero Portal Section */}
      <main className="max-w-4xl w-full mx-auto my-auto py-10 z-10 space-y-8 text-center">
        {/* Title Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold shadow-inner">
          <i className="fa-solid fa-sparkles text-amber-400"></i>
          <span>심인고등학교 학생 전용 AI 심화영어 포털 (@simin.hs.kr)</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            수능 1등급을 위한 <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300">
              맞춤형 Agentic AI 학습 플랫폼
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            EBS 46개 지문 완벽 분석, 정답을 유도하는 소크라테스 튜터링, 0초 즉시 수능 변형문제 생성, 그리고 내 생기부 세특을 채워주는 메타인지 소감 자산화 시스템.
          </p>
        </div>

        {/* Login CTA Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg mx-auto shadow-2xl space-y-4">
          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2 text-left">
              <i className="fa-solid fa-triangle-exclamation text-rose-400 shrink-0"></i>
              <span>{loginError}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-950/60 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            <i className={`fa-brands fa-google text-lg ${isLoggingIn ? 'fa-spin' : ''}`}></i>
            <span>{isLoggingIn ? '인증 진행 중...' : '🔑 심인고 계정(@simin.hs.kr) Google 로그인'}</span>
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center space-x-1">
              <i className="fa-solid fa-shield-halved text-emerald-400"></i>
              <span>@simin.hs.kr 보안 인증</span>
            </span>
            <button
              onClick={onStartGuestPreview}
              className="text-slate-400 hover:text-slate-200 underline font-medium underline-offset-2"
            >
              👀 서비스 훑어보기 (게스트)
            </button>
          </div>
        </div>

        {/* 4 Major Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-blue-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <h4 className="text-xs font-bold text-white">EBS 46개 지문 워크북</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              원어민 TTS 리딩 및 구문 분석 노트를 제공합니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-brain"></i>
            </div>
            <h4 className="text-xs font-bold text-white">소크라테스 AI 튜터</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              3단계 힌트 유도로 독해 및 어휘 추론 능력을 배가시킵니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-amber-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h4 className="text-xs font-bold text-white">수능 6대 변형문항 생성</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              빈칸·어법·삽입 문제를 0초 만에 인쇄 및 변형 생성합니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-purple-500/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <h4 className="text-xs font-bold text-white">오답노트 & 세특 자산화</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              작성한 공부 소감이 나만의 세특 자료와 오답노트로 쌓입니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 pt-4 z-10">
        © 2026 심인고등학교 2027 심화영어II AI 학습 시스템 · Google Authentication Protected
      </footer>
    </div>
  );
};
