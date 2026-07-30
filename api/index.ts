import app from '../server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Handler Error]:', err);
    return res.status(200).json({
      success: false,
      error: err?.message || 'Vercel 서버리스 연동 처리 중 오류가 발생했습니다. Vercel 대시보드의 GEMINI_API_KEY 환경변수를 확인해 주세요.',
    });
  }
}
