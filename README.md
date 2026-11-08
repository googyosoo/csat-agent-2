<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/16276915-ee19-40b5-810d-d5fd6803cbb4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 학생 기록 접근 보호

이 변경은 학생 기록 접근 권한을 보완합니다. 서버 임시 파일을 영구 저장소로 바꾸는 작업은 포함하지 않습니다.

- 서버는 Firebase ID 토큰을 Google의 고정 검증 주소에서 확인합니다. 요청 본문의 이메일이나 역할을 로그인 증거로 사용하지 않습니다.
- 학생은 본인 기록만 조회하고 전송할 수 있습니다. 다른 계정의 브라우저 기록을 한꺼번에 재전송하지 않습니다.
- 전체 기록 조회와 학생 리포트, 공유 문항 등록 및 삭제는 지정된 교사 계정만 허용합니다.
- 게스트 체험은 실제 학생 기록을 조회하거나 클라우드에 기록을 전송하지 않습니다.
- Firestore 조회도 학생 본인 이메일 조건으로 제한합니다. 관리자 미리보기로 실제 기록을 여는 기능은 제거했습니다.

### 운영 적용 전 확인

1. 실제 Firebase 프로젝트의 VITE_FIREBASE_API_KEY와 VITE_FIREBASE_PROJECT_ID를 설정합니다. 서버는 같은 값을 사용하며 FIREBASE_WEB_API_KEY와 FIREBASE_PROJECT_ID로 별도 지정할 수도 있습니다. 이 Firebase 웹 설정값은 AI 비밀키와 다릅니다.
2. 서버 설정이 없거나 토큰 검증을 할 수 없으면 기록 요청은 차단됩니다. 보안을 풀어서 작동하게 하지 마세요.
3. firestore.rules를 실제 프로젝트에 별도로 적용하고 학생 A, 학생 B, 교사 계정으로 규칙을 확인해야 합니다. GitHub 수정 제안 생성만으로 현재 운영 DB 규칙이 바뀌지는 않습니다. firebase deploy --only firestore:rules는 실제 DB 권한을 바꾸므로 운영자의 별도 승인이 필요합니다.
4. 기존 students 문서의 중첩 socraticLogs와 learningEvents에 다른 학생 자료가 섞여 있는지 운영자가 확인해야 합니다. 문서 단위 읽기 규칙은 문서 안의 일부 필드만 감추지 못합니다. 섞인 자료가 있다면 원본을 보존하고 교사 승인 아래 정리한 뒤 적용하세요.
5. 기존 데이터의 이메일 대소문자가 섞여 있다면 교사가 정리한 뒤 사용하세요. 학생 조회를 전체 컬렉션 읽기로 되돌리지 마세요.
6. 브라우저의 기존 원본 기록은 삭제하지 않습니다. 공용 기기에는 과거 기록이 남아 있을 수 있으므로 운영자가 보관 및 정리 정책을 정해야 합니다.
7. 서버의 /tmp 파일은 영구 저장소가 아닙니다. Firestore 저장 성공 확인과 장기 보관 정책 보완은 별도 작업입니다.

### 검사

npm run test:security는 서버 토큰과 소유권 검사, 계정 전환 및 인증 헤더 검사를 실행합니다. 수정 제안을 열면 GitHub Actions에서 보안 검사, 타입 검사, 전체 빌드를 실행합니다. 실제 학생 정보나 AI API를 호출하는 검사는 없습니다.
