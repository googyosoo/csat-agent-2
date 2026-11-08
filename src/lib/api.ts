import { auth } from './firebase';

/** Send Firebase identity only to this app's own API, never to third-party URLs. */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const target = new URL(url, window.location.origin);
  const apiPath = target.pathname.toLowerCase();
  const isLocalApi = target.origin === window.location.origin && (apiPath === '/api' || apiPath.startsWith('/api/'));
  if (!isLocalApi) return fetch(url, options);

  const method = (options.method || 'GET').toUpperCase();
  const protectedRecord = /^\/api\/analytics(?:\/|$)/.test(apiPath)
    || /^\/api\/gemini\/student-report\/?$/.test(apiPath)
    || (/^\/api\/transformed-questions(?:\/|$)/.test(apiPath) && !['GET', 'HEAD', 'OPTIONS'].includes(method));
  const user = auth.currentUser;
  if (!user) {
    if (protectedRecord) throw new Error('학생 기록을 이용하려면 Google 계정으로 로그인해 주세요.');
    return fetch(url, options);
  }

  const token = await user.getIdToken();
  if (auth.currentUser?.uid !== user.uid) throw new Error('계정이 변경되었습니다. 다시 시도해 주세요.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', 'Bearer ' + token);
  return fetch(url, { ...options, headers });
}

/**
 * Helper utility to safely execute fetch requests and handle JSON responses,
 * preventing 'Unexpected token <' errors when server returns HTML error pages.
 */
export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await authenticatedFetch(url, options);
  
  const contentType = response.headers.get('content-type') || '';
  
  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const errorJson = await response.json();
      throw new Error(errorJson.error || errorJson.message || `서버 오류가 발생했습니다. (HTTP ${response.status})`);
    } else {
      const text = await response.text();
      console.error(`[API Non-JSON Error ${response.status}]:`, text.slice(0, 300));
      if (response.status === 504) {
        throw new Error(`AI 서버 응답 시간 초과 (HTTP 504 Timeout). 생성 요청이 복잡하여 지연되었습니다. '변형 문제 생성' 버튼을 다시 클릭해 주세요.`);
      }
      throw new Error(`서버 응답 오류 (HTTP ${response.status}): 백엔드 연결 상태를 확인해 주세요.`);
    }
  }

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (parseErr) {
      throw new Error('응답 데이터를 분석하는 중 오류가 발생했습니다 (JSON 파싱 에러).');
    }
  } else {
    const rawText = await response.text();
    console.warn(`[API Response Not JSON]:`, rawText.slice(0, 300));
    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error('서버 응답이 JSON 형식이 아닙니다.');
    }
  }
}
