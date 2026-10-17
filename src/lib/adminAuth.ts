/**
 * Authorization and Domain Validation Utilities for CSAT Agent Platform.
 */

export const ADMIN_EMAILS: string[] = [
  'sitech3@simin.hs.kr',
  'hongjinwoo@simin.hs.kr',
];

export const ALLOWED_STUDENT_DOMAIN = '@simin.hs.kr';

/**
 * Check if the given email belongs to an authorized administrator.
 */
export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === cleanEmail);
}

/**
 * Check if the given email belongs to an allowed student domain (@simin.hs.kr).
 */
export function isAllowedStudentDomain(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail.endsWith(ALLOWED_STUDENT_DOMAIN.toLowerCase());
}

export interface AccessCheckResult {
  allowed: boolean;
  role: 'admin' | 'student' | 'denied';
  reason?: string;
}

/**
 * Validate overall access permission for the logged-in user:
 * 1. Designated admins: Assigned 'admin' role.
 * 2. All other Google accounts: Assigned 'student' role.
 */
export function validateUserAccess(email?: string | null): AccessCheckResult {
  if (!email) {
    return { allowed: false, role: 'denied', reason: '로그인이 필요합니다.' };
  }

  // 1. Check if designated admin
  if (isAdminUser(email)) {
    return { allowed: true, role: 'admin' };
  }

  // 2. Allow all authenticated Google accounts as student/learner
  return {
    allowed: true,
    role: 'student',
  };
}

