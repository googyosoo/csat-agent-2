# 2027 심화영어II Agentic AI 학습 플랫폼 (csat-agent-2)

심인고등학교 2027학년도 심화영어II 수업 및 수능 연계 학습을 지원하는 맞춤형 Agentic AI 학습 플랫폼입니다.
EBS 수능 연계 교재 지문을 기반으로 정밀 구문 분석, 소크라테스식 메타인지 문답, 수능형 실전 변형 문제 풀이, 오답 족보와 세특 자산화를 통합 제공합니다.

- **배포 주소**: [https://csat-agent-2.vercel.app](https://csat-agent-2.vercel.app)
- **저장소**: [https://github.com/googyosoo/csat-agent-2](https://github.com/googyosoo/csat-agent-2)

---

## 주요 기능 안내

1. **지문 분석 워크북 (Library & Audio)**
   - EBS 연계 지문의 구문 구조, 문맥 어휘, 핵심 문법, 한글 해설 정밀 분석
   - 네이티브 화자 음성 Web Speech TTS 낭독 기능 제공
2. **소크라테스 튜터링 (Socratic Dialog)**
   - 정답을 일방적으로 알려주지 않고 학생 스스로 단서와 논리를 찾아가도록 유도하는 AI 문답
   - 문맥적 추론과 비판적 사고력을 키우는 단계별 힌트 시스템
3. **수능 변형문항 문제은행 (Dynamic Generator)**
   - 빈칸 추론, 어법 판단, 문장 삽입, 어휘 적절성, 주제 파악, 요약문 완성 6대 핵심 수능 유형 지원
   - 교사가 직접 승인한 검증 문항 풀이 및 5지선다 오답 해설 제공
4. **오답노트 및 학습 소감 기록 (Mistake Vault & Reflection)**
   - 학생이 틀린 문항의 오답 선지와 해설을 개인 보관함에 자동 저장
   - 지문별 학습 소감과 성찰 메모를 기록하여 학습 연속성 유지
5. **교사용 실시간 관리자 대시보드 (Admin Dashboard)**
   - 학생 접속 현황, 학습 체류 시간, 문항 정답률 실시간 모니터링
   - 축적된 학습 데이터를 바탕으로 학교생활기록부 세부능력 및 특기사항(세특) 초안 구성 지원
6. **BYOK (Bring Your Own Key) 지원**
   - 상단 설정 메뉴에서 사용자의 개인 Google Gemini API Key를 직접 등록해 독립적으로 활용 가능
   - 빌드 번들에는 Gemini 서버 키가 포함되지 않아 안전함

---

## 시작 방법

### 사전 요구사항
- Node.js 18 이상
- npm

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정 (.env)
루트 경로에 `.env` 파일을 구성합니다.
```env
# Gemini API Key (서버 기본 키 / 없으면 사용자 BYOK 키 입력 사용)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Config (클라이언트 공개 설정)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=csat-project-platform.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=csat-project-platform
VITE_FIREBASE_STORAGE_BUCKET=csat-project-platform.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 4. 프로덕션 빌드
```bash
npm run build
```
- 프론트엔드 정적 번들: `dist/`
- Vercel Serverless Function: `api/index.js`
- 프로덕션 Express 서버: `dist/server.cjs`

---

## 기술 스택
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React, Motion
- **Backend**: Node.js, Express, esbuild (Vercel Serverless Function 번들링)
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Database & Auth**: Google Firebase Auth (Google SSO), Cloud Firestore
