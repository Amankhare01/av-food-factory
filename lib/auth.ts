const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret';

export function validateCreds(user: string, pass: string) {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

function base64UrlFromUint8(u8: Uint8Array) {
  // Prefer Node Buffer when available
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(u8).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  // Browser fallback
  let binary = '';
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeStr(str: string) {
  const enc = new TextEncoder();
  return base64UrlFromUint8(enc.encode(str));
}

async function hmacSha256Base64Url(data: string, secret: string) {
  // Use Web Crypto API when available (Edge/middleware/runtime)
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.subtle) {
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const key = await (globalThis as any).crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await (globalThis as any).crypto.subtle.sign('HMAC', key, enc.encode(data));
    return base64UrlFromUint8(new Uint8Array(sig));
  }

  // Fallback to Node's crypto at runtime (do not import at top-level)
  try {
    // dynamic import keeps bundlers from trying to include the Node crypto shim in Edge builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHmac('sha256', secret).update(data).digest('base64url');
  } catch (err) {
    // As a last resort, throw so calling code can handle
    throw new Error('No suitable crypto available for HMAC');
  }
}

export async function signToken(payload: object) {
  const header = base64UrlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncodeStr(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = await hmacSha256Base64Url(data, ADMIN_SECRET);
  return `${data}.${sig}`;
}

export async function verifyToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, b, s] = parts;
  const data = `${h}.${b}`;
  const sig = await hmacSha256Base64Url(data, ADMIN_SECRET);
  if (sig !== s) return null;
  try {
    // Decode payload
    let payloadJson: string;
    if (typeof Buffer !== 'undefined') {
      payloadJson = Buffer.from(b.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    } else {
      // Browser decode
      const padded = b.replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(padded);
      // convert binary string to utf-8
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      payloadJson = new TextDecoder().decode(bytes);
    }
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
