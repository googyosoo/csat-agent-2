import React from 'react';
import { EBSPassage } from '../types';
import { User, signInWithGoogle, logout } from '../lib/firebase';

interface HeaderProps {
  selectedPassage: EBSPassage;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeak: () => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  authUser: User | null;
  onToggleSidebar?: () => void;
  onOpenMistakeVault?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPassage,
  isSpeaking,
  onSpeak,
  onStopSpeak,
  customApiKey,
  setCustomApiKey,
  authUser,
  onToggleSidebar,
  onOpenMistakeVault,
}) => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app_theme') as 'dark' | 'light') || 'dark';
  });

  React.useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error(err.message || '로그아웃 실패');
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 px-3 md:px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-md shrink-0 z-10">
      <div className="flex items-center space-x-2 md:space-x-3 truncate">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0"
            title="메뉴 열기"
          >
            <i className="fa-solid fa-bars text-sm"></i>
          </button>
        )}
        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30 shrink-0">
          {selectedPassage.lesson} {selectedPassage.itemNo}
        </span>
        <span className="hidden sm:inline text-xs text-slate-400 shrink-0">[{selectedPassage.type}]</span>
        <h2 className="text-xs md:text-sm font-bold text-slate-200 truncate max-w-[120px] sm:max-w-xs md:max-w-md">{selectedPassage.title}</h2>
      </div>

      <div className="flex items-center space-x-2.5 shrink-0">
        {/* Personal Mistake Vault Button */}
        {onOpenMistakeVault && (
          <button
            type="button"
            onClick={onOpenMistakeVault}
            className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
            title="내가 틀린 문제와 쓴 생각 복습하기"
          >
            <i className="fa-solid fa-book-bookmark text-rose-400"></i>
            <span className="hidden sm:inline">개인 오답노트</span>
          </button>
        )}

        {/* Dark / Light Theme Toggle Switch */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              theme === 'dark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="다크 모드 적용"
          >
            <i className="fa-solid fa-moon text-[11px]"></i>
            <span className="hidden sm:inline">다크</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              theme === 'light'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="일반(라이트) 모드 적용"
          >
            <i className="fa-solid fa-sun text-[11px]"></i>
            <span className="hidden sm:inline">일반</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center bg-slate-950 px-2.5 py-1 rounded-lg border border-emerald-500/30 space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-medium text-emerald-300">서버 시스템 연동 (유료 키 입력 불필요)</span>
        </div>

        <div className="flex items-center bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-mono text-slate-400">CSAT-AI Engine</span>
        </div>

        {isSpeaking ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={onStopSpeak}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center space-x-1.5 transition-all animate-pulse"
              title="음성 리딩 즉시 멈춤"
            >
              <i className="fa-solid fa-circle-stop"></i>
              <span>리딩 멈춤</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSpeak(selectedPassage.passage)}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all"
            title="지문 전체 음성 합성 리딩 시작"
          >
            <i className="fa-solid fa-volume-high text-cyan-400"></i>
            <span>지문 리딩 (TTS)</span>
          </button>
        )}

        {/* Firebase Google SSO Login Button or User Profile */}
        <div className="pl-2 border-l border-slate-800 flex items-center space-x-2">
          {authUser ? (
            <div className="flex items-center space-x-2.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              {authUser.photoURL ? (
                <img
                  src={authUser.photoURL}
                  alt={authUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-blue-400 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(authUser.displayName || authUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-slate-200 hidden sm:inline truncate max-w-[120px]">
                {authUser.displayName || authUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-semibold rounded-md border border-slate-700 transition-all shrink-0"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="hidden xl:inline text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                학습자: @simin.hs.kr
              </span>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-blue-900/30 disabled:opacity-50"
                title="심인고등학교 계정(@simin.hs.kr) 또는 지정 관리자 이메일 전용"
              >
                <i className={`fa-brands fa-google ${isLoggingIn ? 'fa-spin' : ''}`}></i>
                <span>{isLoggingIn ? '로그인 중...' : 'Google 로그인'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

