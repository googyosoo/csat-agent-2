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
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-950/50">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-sm sm:text-base leading-tight">2027 심인고등학교</h1>
            <span className="text-xs text-blue-400 font-semibold tracking-wider">심화영어II CSAT-AI Engine</span>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50"
        >
          <i className={`fa-brands fa-google text-sm ${isLoggingIn ? 'fa-spin' : ''}`}></i>
          <span>{isLoggingIn ? '로그인 중...' : 'Google 로그인'}</span>
        </button>
      </header>

      {/* Main Hero Portal Section */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 z-10 space-y-7 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>심인고등학교 학생 전용 (@simin.hs.kr) 공식 AI 학습 게이트</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            수능 영어 1등급을 위한 <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              에이전틱 AI 맞춤 학습 플랫폼
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed opacity-90">
            EBS 수능 연계 지문 정밀 분석부터 소크라테스 메타인지 튜터링, 수능 변형 문제 동적 생성, 그리고 개인별 생기부 세특(세부능력 및 특기사항) 자동 자산 축적까지 경험하세요.
          </p>
        </div>

        {/* Primary Login Action Button */}
        <div className="space-y-2 pt-2">
          {loginError && (
            <div className="max-w-md mx-auto p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2 text-left">
              <i className="fa-solid fa-triangle-exclamation text-rose-400 shrink-0"></i>
              <span>{loginError}</span>
            </div>
          )}

          <div className="inline-flex flex-col items-center">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-950/80 transition-all flex items-center space-x-3 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              <i className={`fa-brands fa-google text-lg ${isLoggingIn ? 'fa-spin' : ''}`}></i>
              <span>{isLoggingIn ? '인증 진행 중...' : 'Google 계정으로 시작하기'}</span>
            </button>
            <span className="text-[11px] text-slate-500 mt-2 font-mono flex items-center space-x-1">
              <i className="fa-solid fa-lock text-[10px]"></i>
              <span>@simin.hs.kr 학교 이메일 전용</span>
            </span>
          </div>
        </div>

        {/* 4 Feature Cards Row (1:1 identical layout to agent-1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-8">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 hover:border-blue-500/40 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <h4 className="text-xs font-extrabold text-white">지문 분석 워크북</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              EBS 연계 지문의 구문·어휘·해설 정밀 분석 및 음성 TTS 낭독 기능 제공.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 hover:border-purple-500/40 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-brain"></i>
            </div>
            <h4 className="text-xs font-extrabold text-white">소크라테스 AI 튜터</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              3단계 힌트 시스템으로 스스로 정답의 논리를 찾도록 유도하는 AI 튜터링.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 hover:border-amber-500/40 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h4 className="text-xs font-extrabold text-white">AI 변형문항 생성기</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              빈칸·어법·삽입 등 수능 최적화 6대 유형 변형문항 및 해설 동적 생성.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-2.5 hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <h4 className="text-xs font-extrabold text-white">오답노트 & 세특 축적</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              개인 오답 족보 자동 정리 및 교사용 생기부 세특 초안 자동 기록.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="max-w-6xl w-full mx-auto flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-4 z-10">
        <span>© 2026 심인고등학교 2027 심화영어II CSAT-AI Engine</span>
        <button
          onClick={onStartGuestPreview}
          className="text-slate-400 hover:text-slate-200 underline font-medium"
        >
          👀 게스트 미리보기
        </button>
      </footer>
    </div>
  );
};
