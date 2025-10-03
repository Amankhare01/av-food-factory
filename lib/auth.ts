import crypto from 'node:crypto';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret';

export function validateCreds(user: string, pass: string) {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function signToken(payload: object) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, b, s] = parts;
  const data = `${h}.${b}`;
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
  if (sig !== s) return null;
  try {
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}
