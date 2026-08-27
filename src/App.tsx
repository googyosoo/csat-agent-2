import React, { useState, useEffect } from 'react';
import { INITIAL_EBS_DATASET } from './data/ebsDataset';
import { EBSPassage } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LibraryTab } from './components/LibraryTab';
import { OrchestratorTab } from './components/OrchestratorTab';
import { GeneratorTab } from './components/GeneratorTab';
import { VocabTab } from './components/VocabTab';
import { IngestModal } from './components/IngestModal';
import { MistakeVaultModal } from './components/MistakeVaultModal';
import { AdminDashboardTab } from './components/AdminDashboardTab';
import { StudentDashboardTab } from './components/StudentDashboardTab';
import { LandingPage } from './components/LandingPage';
import { subscribeToAuth, logout, User } from './lib/firebase';
import { validateUserAccess, ALLOWED_STUDENT_DOMAIN, ADMIN_EMAILS } from './lib/adminAuth';

import { recordUserLogin } from './lib/analytics';

export default function App() {
  const [dataset, setDataset] = useState<EBSPassage[]>(INITIAL_EBS_DATASET);
  const [activeTab, setActiveTab] = useState('library');
  const [selectedPassage, setSelectedPassage] = useState<EBSPassage>(INITIAL_EBS_DATASET[0]);
  const [filterLesson, setFilterLesson] = useState('ALL');
  const [customApiKey, setCustomApiKey] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showMistakeVault, setShowMistakeVault] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);
  const [isGuestPreview, setIsGuestPreview] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Record active learning session immediately
    const currentUserEmail = authUser?.email || 'english1@simin.hs.kr';
    const currentUserName = authUser?.displayName || (currentUserEmail.includes('@') ? currentUserEmail.split('@')[0] : '학습자');

    recordUserLogin({
      email: currentUserEmail,
      displayName: currentUserName,
    });

    const unsubscribe = subscribeToAuth(async (user) => {
      if (user) {
        const access = validateUserAccess(user.email);
        if (!access.allowed) {
          setDeniedReason(access.reason || '접근이 허용되지 않는 계정입니다.');
          setAuthUser(null);
          await logout();
          return;
        }
        recordUserLogin(user);
      }
      setDeniedReason(null);
      setAuthUser(user);
    });

    // 10s Heartbeat Timer to update student online presence and dwell time
    const heartbeatTimer = setInterval(() => {
      const activeEmail = authUser?.email || 'english1@simin.hs.kr';
      const activeName = authUser?.displayName || (activeEmail.includes('@') ? activeEmail.split('@')[0] : '학습자');
      recordUserLogin({ email: activeEmail, displayName: activeName });
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(heartbeatTimer);
    };
  }, [authUser]);

  useEffect(() => {
    if (filterLesson !== 'ALL') {
      const filtered = dataset.filter(p => p.lesson === filterLesson);
      if (filtered.length > 0 && !filtered.some(p => p.id === selectedPassage.id)) {
        setSelectedPassage(filtered[0]);
      }
    }
  }, [filterLesson, dataset]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  const handleAddPassage = (newPassage: EBSPassage) => {
    setDataset(prev => [newPassage, ...prev]);
    setSelectedPassage(newPassage);
  };

  // Render Landing Welcome Portal Page for unauthenticated users
  if (!authUser && !isGuestPreview) {
    return <LandingPage onStartGuestPreview={() => setIsGuestPreview(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        dataset={dataset}
        selectedPassage={selectedPassage}
        setSelectedPassage={(p) => {
          setSelectedPassage(p);
          setIsSidebarOpen(false);
        }}
        filterLesson={filterLesson}
        setFilterLesson={setFilterLesson}
        onOpenIngestModal={() => {
          setShowIngestModal(true);
          setIsSidebarOpen(false);
        }}
        authUser={authUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950 min-w-0">
        <Header
          selectedPassage={selectedPassage}
          isSpeaking={isSpeaking}
          onSpeak={speakText}
          onStopSpeak={stopSpeaking}
          customApiKey={customApiKey}
          setCustomApiKey={setCustomApiKey}
          authUser={authUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenMistakeVault={() => setShowMistakeVault(true)}
        />

        {/* Mobile Quick Navigation Chips Bar (Mobile/Tablet Only) */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center space-x-1.5 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'library', label: '지문 워크북', icon: 'fa-book-open', color: 'bg-blue-600' },
            { id: 'orchestrator', label: '오케스트레이터', icon: 'fa-network-wired', color: 'bg-purple-600' },
            { id: 'generator', label: 'AI 변형문항', icon: 'fa-wand-magic-sparkles', color: 'bg-amber-600' },
            { id: 'vocab', label: '어휘 보관함', icon: 'fa-layer-group', color: 'bg-pink-600' },
            { id: 'student-dashboard', label: '마이 대시보드', icon: 'fa-user-gear', color: 'bg-cyan-600' },
            { id: 'admin', label: '관리자', icon: 'fa-chart-line', color: 'bg-purple-600' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center space-x-1.5 transition-all ${
                activeTab === item.id
                  ? `${item.color} text-white shadow-md`
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content with responsive padding */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {activeTab === 'library' && (
            <LibraryTab
              selectedPassage={selectedPassage}
              isSpeaking={isSpeaking}
              onSpeak={speakText}
              onStopSpeak={stopSpeaking}
              authUser={authUser}
            />
          )}
          {activeTab === 'orchestrator' && (
            <OrchestratorTab selectedPassage={selectedPassage} customApiKey={customApiKey} />
          )}
          {activeTab === 'generator' && (
            <GeneratorTab selectedPassage={selectedPassage} customApiKey={customApiKey} authUser={authUser} />
          )}
          {activeTab === 'vocab' && <VocabTab selectedPassage={selectedPassage} onSpeak={speakText} />}
          {activeTab === 'student-dashboard' && <StudentDashboardTab authUser={authUser} />}
          {activeTab === 'admin' && <AdminDashboardTab authUser={authUser} />}
        </div>
      </main>

      {/* Ingest Modal */}
      {showIngestModal && (
        <IngestModal
          onClose={() => setShowIngestModal(false)}
          onAddPassage={handleAddPassage}
          customApiKey={customApiKey}
        />
      )}

      {/* S5: Personal Mistake Vault Modal */}
      {showMistakeVault && (
        <MistakeVaultModal
          onClose={() => setShowMistakeVault(false)}
          authUser={authUser}
        />
      )}

      {/* Access Denied Modal */}
      {deniedReason && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mx-auto font-bold border border-rose-500/30">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <h3 className="text-base font-bold text-white">로그인 계정 접근 제한 안내</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-sans">
              {deniedReason}
            </p>
            <div className="text-[11px] text-slate-400 space-y-1 text-left bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-300">💡 로그인 허용 정책:</div>
              <div>• <strong>일반 학습자(학생)</strong>: <code className="text-cyan-300 font-mono">@simin.hs.kr</code> (심인고 계정 전용)</div>
              <div>• <strong>지정 관리자</strong>: 지정 이메일 3개 계정 허용 (도메인 무관)</div>
            </div>
            <button
              onClick={() => setDeniedReason(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 transition-all"
            >
              확인 및 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
